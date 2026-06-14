import json
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".deps"))

import snowflake.connector


SQL = """
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
connections_hourly AS (
  SELECT
    KEYWH,
    HOUR(ORDER_CREATED_AT) AS order_hour,
    COUNT(DISTINCT KEYPICK) AS pickers_connected
  FROM RP_SILVER_DB_PROD.TURBO_CORE.BR_DELIVERY_TIMES
  WHERE COUNTRY = 'BR'
    AND ORDER_CREATED_AT::DATE = %(target_date)s
    AND ORDER_ID <> '2216319964'
  GROUP BY 1, 2
),
connections_store AS (
  SELECT
    KEYWH,
    SUM(pickers_connected) / 6.5 AS conections
  FROM connections_hourly
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
dr_cte AS (
  SELECT KEYWH, COUNT(DISTINCT ORDER_ID) AS dr_ops
  FROM FIVETRAN.CPGS_TURBO_DS_PUBLIC.GLOBAL_DEFECT_RATES
  WHERE COUNTRY_CODE = 'BR'
    AND VERTICAL = 'TURBO'
    AND LEVEL_2 IS NOT NULL
    AND COALESCE(IS_DEFECT, TRUE)
    AND ORDER_DATE::DATE = %(target_date)s
  GROUP BY 1
),
stockout_cte AS (
  SELECT KEYWH, COUNT(DISTINCT ORDER_ID) AS stockout_ops
  FROM RP_SILVER_DB_PROD.TURBO_CORE.GLOBAL_STOCKOUT_ORDERS
  WHERE COUNTRY = 'BR'
    AND VERTICAL_SUB_GROUP = 'TURBO'
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
LEFT JOIN connections_store cs ON r.KEYWH = cs.KEYWH
LEFT JOIN cancel_cte c ON r.KEYWH = c.KEYWH
LEFT JOIN dr_cte d ON r.KEYWH = d.KEYWH
LEFT JOIN stockout_cte s ON r.KEYWH = s.KEYWH
ORDER BY r.warehousename
"""

SQL_BR_SCALE = """
WITH base_orders_metrics AS (
  SELECT
    KEYWH,
    ORDER_CREATED_AT::DATE AS order_date,
    HOUR(ORDER_CREATED_AT) AS order_hour,
    COUNT(DISTINCT ORDER_ID) AS orders_count,
    COUNT(DISTINCT KEYPICK) AS pickers_connected
  FROM RP_SILVER_DB_PROD.TURBO_CORE.BR_DELIVERY_TIMES
  WHERE COUNTRY = 'BR'
    AND ORDER_CREATED_AT::DATE = %(target_date)s
    AND ORDER_ID <> '2216319964'
  GROUP BY 1, 2, 3
),
base_forecast AS (
  SELECT
    A.HORA,
    SUM(COALESCE(OM.orders_count, 0)) AS orders_historic,
    SUM(CASE WHEN OM.orders_count >= 3 THEN COALESCE(OM.pickers_connected, 0) ELSE 0 END) AS pickers_connected
  FROM RP_GOLD_DB_PROD.TURBO_CORE.GLOBAL_FORECAST_OPS_PICKERS A
  LEFT JOIN base_orders_metrics OM
    ON A.KEYWH = OM.KEYWH
    AND A.HORA = OM.order_hour
    AND A.MAIN_DATE = OM.order_date
  WHERE A.COUNTRY = 'BR'
    AND A.MAIN_DATE = %(target_date)s
  GROUP BY 1
)
SELECT HORA, orders_historic, pickers_connected
FROM base_forecast
ORDER BY HORA
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


def parse_existing_daily():
    content = (Path(__file__).parent / "dashboard" / "daily_data.js").read_text(encoding="utf-8")
    data_match = re.search(r"window\.DAILY_DATA = (\{.*?\});\n\nwindow\.DAILY_STORES_TIMES =", content, re.S)
    times_match = re.search(r"window\.DAILY_STORES_TIMES = (\{.*?\});\n\nwindow\.DAILY_PICKERS =", content, re.S)
    pickers_match = re.search(r"window\.DAILY_PICKERS = (\[.*\]);\s*$", content, re.S)
    daily_data = json.loads(data_match.group(1)) if data_match else {"date": None, "stores": []}
    times_data = json.loads(times_match.group(1)) if times_match else {}
    pickers_data = json.loads(pickers_match.group(1)) if pickers_match else []
    return daily_data, times_data, pickers_data


def picker_need(orders):
    if orders <= 0:
        return 0
    return __import__("math").ceil((orders * 4) / 55 + 0.25)


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
    old_daily, old_times, old_pickers = parse_existing_daily()
    old_store_map = {normalize_store(row.get("store")): row for row in old_daily.get("stores", [])}
    with snowflake.connector.connect(**params) as conn:
        with conn.cursor(snowflake.connector.DictCursor) as cur:
            cur.execute(SQL, {"target_date": target_date})
            rows = cur.fetchall()
            cur.execute(SQL_BR_SCALE, {"target_date": target_date})
            br_scale_rows = cur.fetchall()

    stores = []
    times = {}
    for row in rows:
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
        stores.append({
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
        })
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

    br_connectivity = []
    for row in br_scale_rows:
      hour = int(float(row["HORA"] or 0))
      orders = int(float(row["ORDERS_HISTORIC"] or 0))
      connected = int(float(row["PICKERS_CONNECTED"] or 0))
      needed = picker_need(orders)
      br_connectivity.append({
          "hour": hour,
          "orders": orders,
          "connected": connected,
          "needed": needed,
          "delta": connected - needed,
      })

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
        + "window.DAILY_PICKERS = "
        + json.dumps(old_pickers, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {len(stores)} stores to {out} for {target_date}")


if __name__ == "__main__":
    main()
