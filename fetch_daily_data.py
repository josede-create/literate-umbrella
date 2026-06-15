import json
import math
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".deps"))

import snowflake.connector


SQL_STORES = """
WITH wh AS (
  SELECT DISTINCT
    CASE
      WHEN WAREHOUSENAME = 'Buritis' THEN 'Estoril'
      WHEN WAREHOUSENAME = 'Sagrada Familia' THEN 'Santa Efigênia'
      WHEN WAREHOUSENAME = 'Centro' THEN 'Catete II'
      ELSE WAREHOUSENAME
    END AS warehousename,
    CITY_NAME,
    WAREHOUSEID,
    KEYWH
  FROM FIVETRAN.CPGS_TURBO_DS_PUBLIC.BR_WAREHOUSE_NEW
),
store_map AS (
  SELECT DISTINCT STORE_ID, WAREHOUSE_ID
  FROM FIVETRAN.CPGS_TURBO_DS_PUBLIC.GLOBAL_WAREHOUSE_STORE
  WHERE COUNTRY_CODE = 'BR' AND NEW_ARCH = 'true'
),
rappi AS (
  SELECT
    w.KEYWH,
    w.warehousename,
    COUNT(DISTINCT o.ORDER_ID) AS orders_rappi
  FROM RP_SILVER_DB_PROD.DES_PROD.ORDERS_BR o
  JOIN store_map s ON s.STORE_ID = o.STORE_ID
  JOIN wh w ON w.WAREHOUSEID = s.WAREHOUSE_ID
  WHERE o.COUNTRY = 'BR'
    AND o.VERTICAL_SUB_GROUP = 'TURBO'
    AND o.IS_FINISHED = TRUE
    AND o.STATE IN ('pending_review', 'finished')
    AND o.CREATED_AT::DATE = %(target_date)s
  GROUP BY 1, 2
),
ze AS (
  SELECT CONCAT('BR', WAREHOUSE_ID, 'N') AS KEYWH, COUNT(DISTINCT ORDER_ID) AS orders_ze
  FROM RP_SILVER_DB_PROD.TURBO_CORE.ORDERS_ZE_DELIVERY
  WHERE COUNTRY = 'BR'
    AND STATE = 'pending_review'
    AND CREATED_AT::DATE = %(target_date)s
  GROUP BY 1
),
ops_order AS (
  SELECT
    KEYWH,
    ORDER_ID,
    MAX(COALESCE(ASSING_TO_PICKER, 0)) AS assign,
    MAX(COALESCE(PICKING, 0)) AS picking,
    MAX(COALESCE(PACKING, 0)) AS packing,
    MAX(COALESCE(HANDLING_TO_STOREKEEPER, 0)) AS handoff,
    MAX(COALESCE(TO_USER, 0)) AS to_user,
    MAX(COALESCE(TOTAL_TIME, 0)) AS total
  FROM RP_SILVER_DB_PROD.TURBO_CORE.BR_DELIVERY_TIMES
  WHERE COUNTRY = 'BR'
    AND ORDER_CREATED_AT::DATE = %(target_date)s
    AND ORDER_ID <> '2216319964'
  GROUP BY 1, 2
),
ops_store AS (
  SELECT
    KEYWH,
    AVG(assign) AS assign,
    AVG(picking) AS picking,
    AVG(packing) AS packing,
    AVG(handoff) AS handoff,
    AVG(to_user) AS to_user,
    AVG(total) AS total,
    AVG(assign + picking + packing) AS instore
  FROM ops_order
  GROUP BY 1
),
productivity AS (
  SELECT
    KEYWH,
    SUM(num_pickers) AS conections
  FROM RP_GOLD_DB_PROD.TURBO_CORE.GLOBAL_PICKER_PRODUCTIVITY_PBI
  WHERE country = 'BR'
    AND main_date::DATE = %(target_date)s
    AND duration_range IN ('5:00 - 5:59', '7:00 - 7:59', '6:00 - 6:59', '> 8:00', '4:00 - 4:59')
    AND role_name IN ('Store Lead / Picker support', 'Picker')
  GROUP BY 1
),
cancel_cte AS (
  SELECT KEYWH, COUNT(DISTINCT ORDER_ID) AS cancel_ops
  FROM RP_SILVER_DB_PROD.TURBO_CORE.GLOBAL_CANCEL_RATE_OPS
  WHERE COUNTRY = 'BR'
    AND VERTICAL = 'TURBO'
    AND CATEGORY IS NOT NULL
    AND _DATE::DATE = %(target_date)s
  GROUP BY 1
),
defect_base AS (
  SELECT
    *,
    CASE
      WHEN level_1 IN ('Problems with the order', 'Problems with my order', 'Incomplete or Damaged Orders') THEN 'OPS'
      ELSE 'OTHER_DR'
    END AS dr_type
  FROM RP_SILVER_DB_PROD.TURBO_CORE.BR_DEFECT_RATES
  WHERE is_escalated <> TRUE
    AND is_defect = TRUE
    AND COALESCE(is_abandoned_, FALSE) <> TRUE
    AND unique_defect_count = TRUE
    AND is_valid = TRUE
    AND synthetic = FALSE
    AND lead_days >= 0
    AND level_2 NOT IN ('Help with another issue', 'Order never arrived', 'Product return')
    AND order_date::DATE = %(target_date)s
),
dr_cte AS (
  SELECT
    CASE WHEN warehouseid = 117 THEN 'BR117N' ELSE KEYWH END AS KEYWH,
    COUNT(DISTINCT CASE WHEN dr_type = 'OPS' THEN ORDER_ID END) AS dr_ops
  FROM defect_base
  WHERE COUNTRY_CODE = 'BR'
  GROUP BY 1
),
stockout_cte AS (
  SELECT
    KEYWH,
    COUNT(DISTINCT CASE WHEN stockout_type IN ('Partial Ops', 'Total Ops') THEN ORDER_ID END) AS stockout_ops
  FROM RP_SILVER_DB_PROD.TURBO_CORE.GLOBAL_STOCKOUT_ORDERS
  WHERE COUNTRY = 'BR'
    AND ORDER_CREATED_AT::DATE = %(target_date)s
  GROUP BY 1
)
SELECT
  r.warehousename,
  r.orders_rappi,
  COALESCE(z.orders_ze, 0) AS orders_ze,
  ROUND(COALESCE(c.cancel_ops, 0) / NULLIF(r.orders_rappi, 0) * 100, 2) AS cancel,
  ROUND(COALESCE(d.dr_ops, 0) / NULLIF(r.orders_rappi, 0) * 100, 2) AS defect,
  ROUND(COALESCE(s.stockout_ops, 0) / NULLIF(r.orders_rappi, 0) * 100, 2) AS stockout,
  ROUND(COALESCE(o.instore, 0), 2) AS instore,
  ROUND((r.orders_rappi + COALESCE(z.orders_ze, 0)) / NULLIF(cs.conections, 0), 2) AS productivity,
  ROUND(COALESCE(o.assign, 0), 2) AS assign,
  ROUND(COALESCE(o.picking, 0), 2) AS picking,
  ROUND(COALESCE(o.packing, 0), 2) AS packing,
  ROUND(COALESCE(o.handoff, 0), 2) AS handoff,
  ROUND(COALESCE(o.to_user, 0), 2) AS to_user,
  ROUND(COALESCE(o.total, 0), 2) AS total
FROM rappi r
LEFT JOIN ze z ON r.KEYWH = z.KEYWH
LEFT JOIN ops_store o ON r.KEYWH = o.KEYWH
LEFT JOIN productivity cs ON r.KEYWH = cs.KEYWH
LEFT JOIN cancel_cte c ON r.KEYWH = c.KEYWH
LEFT JOIN dr_cte d ON r.KEYWH = d.KEYWH
LEFT JOIN stockout_cte s ON r.KEYWH = s.KEYWH
ORDER BY r.warehousename
"""


SQL_DAILY_CONNECTIVITY = """
WITH wh AS (
  SELECT DISTINCT
    KEYWH,
    CASE
      WHEN WAREHOUSENAME = 'Buritis' THEN 'Estoril'
      WHEN WAREHOUSENAME = 'Sagrada Familia' THEN 'Santa Efigênia'
      WHEN WAREHOUSENAME = 'Centro' THEN 'Catete II'
      ELSE WAREHOUSENAME
    END AS warehousename
  FROM FIVETRAN.CPGS_TURBO_DS_PUBLIC.BR_WAREHOUSE_NEW
),
base_orders_metrics AS (
  SELECT
    KEYWH,
    ORDER_CREATED_AT::DATE AS order_date,
    HOUR(ORDER_CREATED_AT) AS order_hour,
    COUNT(DISTINCT ORDER_ID) AS orders_count
  FROM RP_SILVER_DB_PROD.TURBO_CORE.BR_DELIVERY_TIMES
  WHERE COUNTRY = 'BR'
    AND ORDER_CREATED_AT::DATE = %(target_date)s
    AND ORDER_ID <> '2216319964'
  GROUP BY 1, 2, 3
),
forecast AS (
  SELECT
    A.KEYWH,
    COALESCE(W.warehousename, A.KEYWH) AS WAREHOUSENAME,
    A.MAIN_DATE AS order_date,
    A.HORA AS order_hour,
    A.PICKERS_NEEDED,
    A.PICKERS_SCHEDULED
  FROM RP_GOLD_DB_PROD.TURBO_CORE.GLOBAL_FORECAST_OPS_PICKERS A
  LEFT JOIN wh W
    ON A.KEYWH = W.KEYWH
  WHERE A.COUNTRY = 'BR'
    AND A.MAIN_DATE = %(target_date)s
),
nitro_base AS (
  SELECT
    KEYWH,
    KEYPICKER,
    SESSION_ID,
    TRIM(MODULE) AS MODULE,
    ACTIVITY_STARTED_AT AS start_ts,
    COALESCE(ACTIVITY_ENDED_AT_FIX, ACTIVITY_ENDED_AT, SESSION_ENDED_AT) AS end_ts,
    ID
  FROM RP_SILVER_DB_PROD.TURBO_CORE.GLOBAL_PICKER_NITRO_ACTIVITY_RESUME
  WHERE ROLE_NAME = 'Picker'
    AND KEYWH LIKE 'BR%%'
    AND COALESCE(ACTIVITY_ENDED_AT_FIX, ACTIVITY_ENDED_AT, SESSION_ENDED_AT) > %(target_date)s::TIMESTAMP_NTZ
    AND ACTIVITY_STARTED_AT < DATEADD(DAY, 1, %(target_date)s::TIMESTAMP_NTZ)
),
nitro_hour_exploded AS (
  SELECT
    N.KEYWH,
    N.KEYPICKER,
    N.SESSION_ID,
    N.MODULE,
    DATEADD(HOUR, G.hour_offset, DATE_TRUNC('HOUR', N.start_ts)) AS hour_start,
    N.start_ts,
    N.end_ts
  FROM nitro_base N,
    LATERAL (
      SELECT ROW_NUMBER() OVER (ORDER BY SEQ4()) - 1 AS hour_offset
      FROM TABLE(GENERATOR(ROWCOUNT => 24))
    ) G
  WHERE DATEADD(HOUR, G.hour_offset, DATE_TRUNC('HOUR', N.start_ts)) < N.end_ts
),
nitro_picker_hour AS (
  SELECT
    KEYWH,
    hour_start::DATE AS order_date,
    HOUR(hour_start) AS order_hour,
    KEYPICKER,
    SUM(DATEDIFF('SECOND', GREATEST(start_ts, hour_start), LEAST(end_ts, DATEADD(HOUR, 1, hour_start)))) AS active_seconds,
    SUM(CASE
      WHEN MODULE IN ('picking_activity', 'picker_action')
      THEN DATEDIFF('SECOND', GREATEST(start_ts, hour_start), LEAST(end_ts, DATEADD(HOUR, 1, hour_start)))
      ELSE 0
    END) AS picking_seconds,
    SUM(CASE
      WHEN MODULE IN ('Pausa - comida ou descanso', 'Receso -comida o descanso', 'Receso comida o descanso')
      THEN DATEDIFF('SECOND', GREATEST(start_ts, hour_start), LEAST(end_ts, DATEADD(HOUR, 1, hour_start)))
      ELSE 0
    END) AS rest_seconds,
    SUM(CASE
      WHEN MODULE IN ('reception_activity', 'receptions_refill_activity')
      THEN DATEDIFF('SECOND', GREATEST(start_ts, hour_start), LEAST(end_ts, DATEADD(HOUR, 1, hour_start)))
      ELSE 0
    END) AS reception_seconds,
    SUM(CASE
      WHEN MODULE NOT IN (
        'picking_activity',
        'picker_action',
        'Pausa - comida ou descanso',
        'Receso -comida o descanso',
        'Receso comida o descanso',
        'reception_activity',
        'receptions_refill_activity'
      )
      THEN DATEDIFF('SECOND', GREATEST(start_ts, hour_start), LEAST(end_ts, DATEADD(HOUR, 1, hour_start)))
      ELSE 0
    END) AS other_seconds
  FROM nitro_hour_exploded
  GROUP BY 1, 2, 3, 4
),
nitro_gap_base AS (
  SELECT
    KEYWH,
    KEYPICKER,
    SESSION_ID,
    COALESCE(ACTIVITY_ENDED_AT_FIX, ACTIVITY_ENDED_AT, SESSION_ENDED_AT) AS gap_start,
    LEAD(ACTIVITY_STARTED_AT) OVER (PARTITION BY KEYWH, KEYPICKER, SESSION_ID ORDER BY ACTIVITY_STARTED_AT, ID) AS gap_end
  FROM RP_SILVER_DB_PROD.TURBO_CORE.GLOBAL_PICKER_NITRO_ACTIVITY_RESUME
  WHERE ROLE_NAME = 'Picker'
    AND KEYWH LIKE 'BR%%'
    AND COALESCE(ACTIVITY_ENDED_AT_FIX, ACTIVITY_ENDED_AT, SESSION_ENDED_AT) > %(target_date)s::TIMESTAMP_NTZ
    AND ACTIVITY_STARTED_AT < DATEADD(DAY, 1, %(target_date)s::TIMESTAMP_NTZ)
),
nitro_gap_exploded AS (
  SELECT
    G.KEYWH,
    G.KEYPICKER,
    DATEADD(HOUR, H.hour_offset, DATE_TRUNC('HOUR', G.gap_start)) AS hour_start,
    G.gap_start,
    G.gap_end
  FROM nitro_gap_base G,
    LATERAL (
      SELECT ROW_NUMBER() OVER (ORDER BY SEQ4()) - 1 AS hour_offset
      FROM TABLE(GENERATOR(ROWCOUNT => 24))
    ) H
  WHERE G.gap_end IS NOT NULL
    AND DATEDIFF('SECOND', G.gap_start, G.gap_end) > 1800
    AND DATEADD(HOUR, H.hour_offset, DATE_TRUNC('HOUR', G.gap_start)) < G.gap_end
),
nitro_gap_hour AS (
  SELECT
    KEYWH,
    hour_start::DATE AS order_date,
    HOUR(hour_start) AS order_hour,
    KEYPICKER,
    SUM(DATEDIFF('SECOND', GREATEST(gap_start, hour_start), LEAST(gap_end, DATEADD(HOUR, 1, hour_start)))) AS disconnected_seconds
  FROM nitro_gap_exploded
  GROUP BY 1, 2, 3, 4
),
nitro_hourly AS (
  SELECT
    P.KEYWH,
    P.order_date,
    P.order_hour,
    ROUND(SUM(P.active_seconds) / 3600, 2) AS pickers_total_connected,
    ROUND(SUM(P.picking_seconds) / 3600, 2) AS pickers_in_picking,
    ROUND(SUM(P.rest_seconds) / 3600, 2) AS pickers_in_rest,
    ROUND(SUM(P.reception_seconds) / 3600, 2) AS pickers_in_reception,
    ROUND(SUM(P.other_seconds) / 3600, 2) AS pickers_in_other_activities,
    ROUND(SUM(COALESCE(G.disconnected_seconds, 0)) / 3600, 2) AS pickers_disconnection
  FROM nitro_picker_hour P
  LEFT JOIN nitro_gap_hour G
    ON P.KEYWH = G.KEYWH
    AND P.order_date = G.order_date
    AND P.order_hour = G.order_hour
    AND P.KEYPICKER = G.KEYPICKER
  GROUP BY 1, 2, 3
)
SELECT
  F.KEYWH,
  F.WAREHOUSENAME,
  F.order_hour AS HORA,
  COALESCE(OM.orders_count, 0) AS ORDERS_HISTORIC,
  COALESCE(F.PICKERS_NEEDED, 0) AS PICKERS_NEEDED,
  COALESCE(F.PICKERS_SCHEDULED, 0) AS PICKERS_SCHEDULED,
  COALESCE(NH.pickers_total_connected, 0) AS PICKERS_TOTAL_CONNECTED,
  COALESCE(NH.pickers_in_picking, 0) AS PICKERS_IN_PICKING,
  COALESCE(NH.pickers_in_rest, 0) AS PICKERS_IN_REST,
  COALESCE(NH.pickers_in_reception, 0) AS PICKERS_IN_RECEPTION,
  COALESCE(NH.pickers_in_other_activities, 0) AS PICKERS_IN_OTHER_ACTIVITIES,
  COALESCE(NH.pickers_disconnection, 0) AS PICKERS_DISCONNECTION
FROM forecast F
LEFT JOIN base_orders_metrics OM
  ON F.KEYWH = OM.KEYWH
  AND F.order_hour = OM.order_hour
LEFT JOIN nitro_hourly NH
  ON F.KEYWH = NH.KEYWH
  AND F.order_hour = NH.order_hour
ORDER BY 2, 3
"""


SQL_DAILY_PICKERS = """
WITH wh AS (
  SELECT DISTINCT
    KEYWH,
    CASE
      WHEN WAREHOUSENAME = 'Buritis' THEN 'Estoril'
      WHEN WAREHOUSENAME = 'Sagrada Familia' THEN 'Santa Efigênia'
      WHEN WAREHOUSENAME = 'Centro' THEN 'Catete II'
      ELSE WAREHOUSENAME
    END AS warehousename
  FROM FIVETRAN.CPGS_TURBO_DS_PUBLIC.BR_WAREHOUSE_NEW
)
SELECT
  COALESCE(W.warehousename, DT.KEYWH) AS WAREHOUSENAME,
  TO_VARCHAR(DT.KEYPICK) AS KEYPICK,
  TO_VARCHAR(DT.KEYPICK) AS PICKER_NAME,
  COUNT(DISTINCT DT.ORDER_ID) AS ORDERS,
  ROUND(AVG(COALESCE(DT.ASSING_TO_PICKER, 0)), 2) AS ASSIGN,
  ROUND(AVG(COALESCE(DT.PICKING, 0)), 2) AS PICKING,
  ROUND(AVG(COALESCE(DT.PACKING, 0)), 2) AS PACKING,
  ROUND(AVG(COALESCE(DT.ASSING_TO_PICKER, 0) + COALESCE(DT.PICKING, 0) + COALESCE(DT.PACKING, 0)), 2) AS INSTORE
FROM RP_SILVER_DB_PROD.TURBO_CORE.BR_DELIVERY_TIMES DT
LEFT JOIN wh W
  ON DT.KEYWH = W.KEYWH
WHERE DT.COUNTRY = 'BR'
  AND DT.ORDER_CREATED_AT::DATE = %(target_date)s
  AND DT.ORDER_ID <> '2216319964'
  AND DT.KEYPICK IS NOT NULL
GROUP BY 1, 2, 3
ORDER BY 1, ORDERS DESC, INSTORE DESC
"""


def env(name, default=None):
    value = os.environ.get(name, default)
    return default if value == "" else value


def normalize_store(value):
    aliases = {
        "barra da tijuca 2": "barra da tijuca 2",
        "barra 2": "barra da tijuca 2",
        "barra da tijuca 3": "barra da tijuca 3",
        "barra 3": "barra da tijuca 3",
        "santa cecilia": "santa cecília",
        "santa efigenia": "santa efigênia",
        "bonfinglioli": "bonfinglioli",
        "cambui": "cambui",
    }
    cleaned = (
        str(value or "")
        .strip()
        .lower()
        .replace("ã", "a")
        .replace("á", "a")
        .replace("â", "a")
        .replace("é", "e")
        .replace("ê", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ô", "o")
        .replace("õ", "o")
        .replace("ú", "u")
        .replace("ç", "c")
    )
    return aliases.get(cleaned, cleaned)


def extract_window_var(content, name, default):
    match = re.search(rf"window\.{name} = (.*?);\n(?:\n|$)", content, re.S)
    return json.loads(match.group(1)) if match else default


def parse_existing_daily():
    content = (Path(__file__).parent / "dashboard" / "daily_data.js").read_text(encoding="utf-8")
    daily_data = extract_window_var(content, "DAILY_DATA", {"date": None, "stores": []})
    times_data = extract_window_var(content, "DAILY_STORES_TIMES", {})
    pickers_data = extract_window_var(content, "DAILY_PICKERS", [])
    return daily_data, times_data, pickers_data


def picker_need(orders):
    if orders <= 0:
        return 0
    return math.ceil((orders * 4) / 55 + 0.25)


def compliance_row(orders, needed, scheduled, compliant_slots, total_slots, store=None):
    compliance = (compliant_slots / total_slots * 100) if total_slots else 0
    row = {
        "orders": orders,
        "needed": round(needed, 2),
        "scheduled": round(scheduled, 2),
        "compliantSlots": int(compliant_slots),
        "totalSlots": int(total_slots),
        "compliance": round(compliance, 2),
    }
    if store is not None:
        row["store"] = store
    return row


def main():
    sao_paulo = ZoneInfo("America/Sao_Paulo")
    target_date = (datetime.now(sao_paulo).date() - timedelta(days=1)).isoformat()
    params = {
        "account": env("SNOWFLAKE_ACCOUNT", "HG51401"),
        "user": env("SNOWFLAKE_USER", "jose.de@rappi.com"),
        "authenticator": env("SNOWFLAKE_AUTHENTICATOR", "externalbrowser"),
        "role": env("SNOWFLAKE_ROLE", "TURBO_ROLE"),
        "warehouse": env("SNOWFLAKE_WAREHOUSE", "RP_PERSONALUSER_WH"),
    }

    old_daily, old_times, _old_pickers = parse_existing_daily()
    old_store_map = {normalize_store(row.get("store")): row for row in old_daily.get("stores", [])}

    with snowflake.connector.connect(**params) as conn:
        with conn.cursor(snowflake.connector.DictCursor) as cur:
            cur.execute(SQL_STORES, {"target_date": target_date})
            store_rows = cur.fetchall()
            cur.execute(SQL_DAILY_CONNECTIVITY, {"target_date": target_date})
            connectivity_rows = cur.fetchall()
            cur.execute(SQL_DAILY_PICKERS, {"target_date": target_date})
            picker_rows = cur.fetchall()

    stores = []
    times = {}
    for row in store_rows:
        store_name = str(row["WAREHOUSENAME"]).strip()
        if store_name == "Santa Cecilia Farma" or store_name.startswith("Turbo X,"):
            continue
        key = normalize_store(store_name)
        previous = old_store_map.get(key, {})
        if not previous:
            continue
        rappi = int(float(row["ORDERS_RAPPI"] or 0))
        ze = int(float(row["ORDERS_ZE"] or 0))
        orders = rappi + ze
        stores.append(
            {
                "coord": previous.get("coord", "Sem coord"),
                "store": store_name,
                "rappi": rappi,
                "ze": ze,
                "orders": orders,
                "defect": float(row["DEFECT"] or 0),
                "cancel": float(row["CANCEL"] or 0),
                "availability": float(previous.get("availability", 100.0)),
                "stockout": float(row["STOCKOUT"] or 0),
                "inStore": float(row["INSTORE"] or 0),
                "productivity": float(row["PRODUCTIVITY"] or 0),
                "okrs": float(previous.get("okrs", 0)),
            }
        )
        previous_times = old_times.get(previous.get("store", store_name), {})
        times[store_name] = {
            "assign": float(row["ASSIGN"] or 0),
            "picking": float(row["PICKING"] or 0),
            "packing": float(row["PACKING"] or 0),
            "handoff": float(row["HANDOFF"] or 0),
            "inStore": float(row["INSTORE"] or 0),
            "toUser": float(row["TO_USER"] or previous_times.get("toUser", 0)),
            "total": float(row["TOTAL"] or previous_times.get("total", 0)),
        }

    br_by_hour = {hour: {"hour": hour, "orders": 0, "needed": 0.0, "scheduled": 0.0, "connected": 0.0, "inPicking": 0.0, "inRest": 0.0, "inReception": 0.0, "otherActivities": 0.0, "disconnection": 0.0} for hour in range(24)}
    compliance_by_store = {}
    for row in connectivity_rows:
        store_name = str(row["WAREHOUSENAME"] or "").strip()
        if not store_name or store_name == "Santa Cecilia Farma":
            continue
        hour = int(float(row["HORA"] or 0))
        orders = int(float(row["ORDERS_HISTORIC"] or 0))
        needed_scale = float(row["PICKERS_NEEDED"] or 0)
        scheduled = float(row["PICKERS_SCHEDULED"] or 0)
        connected = float(row["PICKERS_TOTAL_CONNECTED"] or 0)
        picking = float(row["PICKERS_IN_PICKING"] or 0)
        rest = float(row["PICKERS_IN_REST"] or 0)
        reception = float(row["PICKERS_IN_RECEPTION"] or 0)
        other = float(row["PICKERS_IN_OTHER_ACTIVITIES"] or 0)
        disconnected = float(row["PICKERS_DISCONNECTION"] or 0)

        bucket = br_by_hour[hour]
        bucket["orders"] += orders
        bucket["needed"] += needed_scale
        bucket["scheduled"] += scheduled
        bucket["connected"] += connected
        bucket["inPicking"] += picking
        bucket["inRest"] += rest
        bucket["inReception"] += reception
        bucket["otherActivities"] += other
        bucket["disconnection"] += disconnected

        current = compliance_by_store.get(store_name) or {
            "store": store_name,
            "orders": 0,
            "needed": 0.0,
            "scheduled": 0.0,
            "compliantSlots": 0,
            "totalSlots": 0,
        }
        current["orders"] += orders
        current["needed"] += needed_scale
        current["scheduled"] += scheduled
        if needed_scale > 0:
            current["totalSlots"] += 1
            if scheduled >= needed_scale:
                current["compliantSlots"] += 1
        compliance_by_store[store_name] = current

    br_connectivity = []
    for hour in range(24):
        row = br_by_hour[hour]
        br_connectivity.append(
            {
                "hour": hour,
                "orders": row["orders"],
                "needed": round(row["needed"], 2),
                "scheduled": round(row["scheduled"], 2),
                "connected": round(row["connected"], 2),
                "inPicking": round(row["inPicking"], 2),
                "inRest": round(row["inRest"], 2),
                "inReception": round(row["inReception"], 2),
                "otherActivities": round(row["otherActivities"], 2),
                "disconnection": round(row["disconnection"], 2),
                "delta": round(row["scheduled"] - row["needed"], 2),
            }
        )

    store_compliance_rows = [
        compliance_row(
            row["orders"],
            row["needed"],
            row["scheduled"],
            row["compliantSlots"],
            row["totalSlots"],
            store=row["store"],
        )
        for row in compliance_by_store.values()
        if row["orders"] > 0 or row["totalSlots"] > 0
    ]
    store_compliance_rows.sort(key=lambda item: (item["compliance"], -item["orders"], item["store"]))

    br_orders = sum(row["orders"] for row in store_compliance_rows)
    br_needed = sum(row["needed"] for row in store_compliance_rows)
    br_scheduled = sum(row["scheduled"] for row in store_compliance_rows)
    br_compliant_slots = sum(row["compliantSlots"] for row in store_compliance_rows)
    br_total_slots = sum(row["totalSlots"] for row in store_compliance_rows)

    daily_picking_compliance = {
        "br": compliance_row(br_orders, br_needed, br_scheduled, br_compliant_slots, br_total_slots),
        "stores": store_compliance_rows,
    }

    daily_pickers = []
    for row in picker_rows:
        store_name = str(row["WAREHOUSENAME"] or "").strip()
        if not store_name or store_name == "Santa Cecilia Farma":
            continue
        daily_pickers.append(
            {
                "store": store_name,
                "keypick": str(row["KEYPICK"] or ""),
                "name": str(row["PICKER_NAME"] or row["KEYPICK"] or ""),
                "orders": int(float(row["ORDERS"] or 0)),
                "assign": float(row["ASSIGN"] or 0),
                "picking": float(row["PICKING"] or 0),
                "packing": float(row["PACKING"] or 0),
                "inStore": float(row["INSTORE"] or 0),
            }
        )

    out = Path(__file__).parent / "dashboard" / "daily_data.js"
    out.write_text(
        "window.DAILY_DATA_UPDATED_AT = "
        + json.dumps(datetime.now(sao_paulo).isoformat(timespec="seconds"), ensure_ascii=False)
        + ";\n"
        + "window.DAILY_DATA = "
        + json.dumps({"date": target_date, "stores": stores}, ensure_ascii=False)
        + ";\n\n"
        + "window.DAILY_STORES_TIMES = "
        + json.dumps(times, ensure_ascii=False)
        + ";\n\n"
        + "window.DAILY_BR_CONNECTIVITY = "
        + json.dumps(br_connectivity, ensure_ascii=False)
        + ";\n\n"
        + "window.DAILY_PICKING_COMPLIANCE = "
        + json.dumps(daily_picking_compliance, ensure_ascii=False)
        + ";\n\n"
        + "window.DAILY_PICKERS = "
        + json.dumps(daily_pickers, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {len(stores)} stores and {len(daily_pickers)} pickers to {out} for {target_date}")


if __name__ == "__main__":
    main()
