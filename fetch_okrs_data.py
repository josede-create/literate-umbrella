import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".deps"))

import snowflake.connector


SQL = """
WITH periods AS (
  SELECT
    'month' AS period,
    DATE_TRUNC('month', CURRENT_DATE)::DATE AS start_date,
    CURRENT_DATE::DATE AS end_date
  UNION ALL
  SELECT
    'week' AS period,
    DATE_TRUNC('week', DATEADD('week', -1, CURRENT_DATE))::DATE AS start_date,
    DATE_TRUNC('week', CURRENT_DATE)::DATE AS end_date
),
wh AS (
  SELECT DISTINCT
    KEYWH,
    WAREHOUSEID,
    CASE
      WHEN WAREHOUSENAME = 'Buritis' THEN 'Estoril'
      WHEN WAREHOUSENAME = 'Sagrada Familia' THEN 'Santa Efigênia'
      WHEN WAREHOUSENAME = 'Centro' THEN 'Catete II'
      ELSE TRIM(WAREHOUSENAME)
    END AS WAREHOUSENAME,
    CITY_NAME
  FROM FIVETRAN.CPGS_TURBO_DS_PUBLIC.BR_WAREHOUSE_NEW
),
store_map AS (
  SELECT DISTINCT STORE_ID, WAREHOUSE_ID
  FROM FIVETRAN.CPGS_TURBO_DS_PUBLIC.GLOBAL_WAREHOUSE_STORE
  WHERE COUNTRY_CODE = 'BR'
    AND NEW_ARCH = 'true'
),
orders_rappi AS (
  SELECT
    P.period,
    P.start_date AS date_day,
    W.KEYWH,
    W.WAREHOUSENAME,
    W.CITY_NAME,
    SUM(O.total_value) AS gmv,
    COUNT(DISTINCT O.order_id) AS total_orders_count_gmv
  FROM periods P
  JOIN RP_SILVER_DB_PROD.DES_PROD.ORDERS_BR O
    ON O.created_at::DATE >= P.start_date
   AND O.created_at::DATE < P.end_date
  JOIN store_map S
    ON S.STORE_ID = O.STORE_ID
  JOIN wh W
    ON W.WAREHOUSEID = S.WAREHOUSE_ID
  WHERE O.is_finished = TRUE
    AND O.state IN ('pending_review', 'finished')
    AND O.country = 'BR'
    AND UPPER(O.vertical_sub_group) = 'TURBO'
    AND O.created_at::DATE <> CURRENT_DATE
    AND COALESCE(O.store_type_store, '') NOT IN ('turbo_veinticuatro_nc', 'retailers_cargo')
  GROUP BY 1, 2, 3, 4, 5
),
orders_ze AS (
  SELECT
    P.period,
    P.start_date AS date_day,
    CONCAT('BR', Z.warehouse_id, 'N') AS KEYWH,
    COUNT(DISTINCT Z.order_id) AS orders_ze,
    SUM(Z.gmv) AS gmv_ze
  FROM periods P
  JOIN RP_SILVER_DB_PROD.TURBO_CORE.ORDERS_ZE_DELIVERY Z
    ON Z.created_at::DATE >= P.start_date
   AND Z.created_at::DATE < P.end_date
  WHERE Z.country = 'BR'
    AND Z.state = 'pending_review'
    AND Z.created_at::DATE <> CURRENT_DATE
  GROUP BY 1, 2, 3
),
delivery AS (
  SELECT
    P.period,
    P.start_date AS date_day,
    T.KEYWH,
    COUNT(DISTINCT T.ORDER_ID) AS orders,
    SUM(COALESCE(T.PICKING, 0)) AS avg_picking,
    SUM(COALESCE(T.ASSING_TO_PICKER, 0)) AS avg_assign_picker,
    SUM(COALESCE(T.PACKING, 0)) AS avg_packing,
    SUM(COALESCE(T.PICKING, 0) + COALESCE(T.ASSING_TO_PICKER, 0) + COALESCE(T.PACKING, 0)) AS in_store
  FROM periods P
  JOIN RP_SILVER_DB_PROD.TURBO_CORE.BR_DELIVERY_TIMES T
    ON T.ORDER_CREATED_AT::DATE >= P.start_date
   AND T.ORDER_CREATED_AT::DATE < P.end_date
  WHERE T.country = 'BR'
    AND T.order_id <> '2214580093'
    AND T.ORDER_CREATED_AT::DATE <> CURRENT_DATE
  GROUP BY 1, 2, 3
),
cancel AS (
  SELECT
    P.period,
    P.start_date AS date_day,
    CASE WHEN A.warehouse_id = 117 THEN 'BR117N' ELSE A.KEYWH END AS KEYWH,
    COUNT(DISTINCT A.order_id) AS cancel
  FROM periods P
  JOIN RP_SILVER_DB_PROD.TURBO_CORE.GLOBAL_CANCEL_RATE_OPS A
    ON A._date::DATE >= P.start_date
   AND A._date::DATE < P.end_date
  WHERE A.category IS NOT NULL
    AND A.country = 'BR'
    AND A.vertical = 'TURBO'
    AND A._date::DATE <> CURRENT_DATE
  GROUP BY 1, 2, 3
),
damaged AS (
  SELECT
    P.period,
    P.start_date AS date_day,
    A.KEYWH,
    SUM(A.amount) AS merma_damaged
  FROM periods P
  JOIN RP_SILVER_DB_PROD.TURBO_CORE.GLOBAL_FINANCE_SHRINKAGE A
    ON A.main_date::DATE >= P.start_date
   AND A.main_date::DATE < P.end_date
  WHERE A.country_code = 'BR'
    AND A.reason = 'SHRINKAGE-DAMAGED'
    AND A.main_date::DATE <> CURRENT_DATE
  GROUP BY 1, 2, 3
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
    AND main_date::DATE <> CURRENT_DATE
),
defect AS (
  SELECT
    P.period,
    P.start_date AS date_day,
    CASE WHEN A.warehouseid = 117 THEN 'BR117N' ELSE A.KEYWH END AS KEYWH,
    COUNT(DISTINCT CASE WHEN A.dr_type = 'OPS' THEN A.order_id END) AS dr_ops
  FROM periods P
  JOIN defect_base A
    ON A.order_date::DATE >= P.start_date
   AND A.order_date::DATE < P.end_date
  WHERE A.country_code = 'BR'
  GROUP BY 1, 2, 3
),
stockout AS (
  SELECT
    P.period,
    P.start_date AS date_day,
    A.KEYWH,
    COUNT(DISTINCT CASE WHEN A.stockout_type IN ('Partial Ops', 'Total Ops') THEN A.order_id END) AS stockout_ops
  FROM periods P
  JOIN RP_SILVER_DB_PROD.TURBO_CORE.GLOBAL_STOCKOUT_ORDERS A
    ON A.order_created_at::DATE >= P.start_date
   AND A.order_created_at::DATE < P.end_date
  WHERE A.country = 'BR'
    AND A.order_created_at::DATE <> CURRENT_DATE
  GROUP BY 1, 2, 3
),
store_availability AS (
  SELECT
    P.period,
    P.start_date AS date_day,
    A.KEYWH,
    1 - (SUM(COALESCE(A.MINUTES_CLOSED, 0)) / NULLIF(SUM(A.SCHEDULED_TIME), 0)) AS store_avl
  FROM periods P
  JOIN RP_GOLD_DB_PROD.TURBO_CORE.GLOBAL_SHUTDOWN_AFFECTANCE_V2 A
    ON A.MAIN_DATE::DATE >= P.start_date
   AND A.MAIN_DATE::DATE < P.end_date
  WHERE A.MAIN_HOUR NOT IN ('23', '0', '1', '2', '3', '4', '5', '6')
  GROUP BY 1, 2, 3
),
productivity AS (
  SELECT
    P.period,
    P.start_date AS date_day,
    A.KEYWH,
    SUM(A.num_pickers) AS conections
  FROM periods P
  JOIN RP_GOLD_DB_PROD.TURBO_CORE.GLOBAL_PICKER_PRODUCTIVITY_PBI A
    ON A.main_date::DATE >= P.start_date
   AND A.main_date::DATE < P.end_date
  WHERE A.country = 'BR'
    AND A.main_date::DATE <> CURRENT_DATE
    AND A.duration_range IN ('5:00 - 5:59', '7:00 - 7:59', '6:00 - 6:59', '> 8:00', '4:00 - 4:59')
    AND A.role_name IN ('Store Lead / Picker support', 'Picker')
  GROUP BY 1, 2, 3
)
SELECT
  R.period,
  R.date_day,
  DATEADD('day', -1, P.end_date)::DATE AS end_date,
  R.KEYWH,
  R.WAREHOUSENAME,
  R.CITY_NAME,
  R.total_orders_count_gmv,
  COALESCE(Z.orders_ze, 0) AS orders_ze,
  R.gmv,
  COALESCE(Z.gmv_ze, 0) AS gmv_ze,
  COALESCE(D.in_store, 0) AS in_store,
  COALESCE(D.avg_assign_picker, 0) AS assign,
  COALESCE(D.avg_picking, 0) AS picking,
  COALESCE(D.avg_packing, 0) AS packing,
  COALESCE(C.cancel, 0) AS cancel,
  COALESCE(DF.dr_ops, 0) AS dr_ops,
  COALESCE(S.stockout_ops, 0) AS stockout_ops,
  COALESCE(DMG.merma_damaged, 0) AS merma_damaged,
  COALESCE(SA.store_avl, 0) AS store_avl,
  COALESCE(PR.conections, 0) AS conections
FROM orders_rappi R
JOIN periods P
  ON R.period = P.period
LEFT JOIN orders_ze Z
  ON R.period = Z.period AND R.KEYWH = Z.KEYWH
LEFT JOIN delivery D
  ON R.period = D.period AND R.KEYWH = D.KEYWH
LEFT JOIN cancel C
  ON R.period = C.period AND R.KEYWH = C.KEYWH
LEFT JOIN defect DF
  ON R.period = DF.period AND R.KEYWH = DF.KEYWH
LEFT JOIN stockout S
  ON R.period = S.period AND R.KEYWH = S.KEYWH
LEFT JOIN damaged DMG
  ON R.period = DMG.period AND R.KEYWH = DMG.KEYWH
LEFT JOIN store_availability SA
  ON R.period = SA.period AND R.KEYWH = SA.KEYWH
LEFT JOIN productivity PR
  ON R.period = PR.period AND R.KEYWH = PR.KEYWH
WHERE R.WAREHOUSENAME IS NOT NULL
ORDER BY R.period, R.WAREHOUSENAME
"""


COORD_META = {
    "Henrique": {"name": "Henrique Brasil", "region": "São Paulo - 1"},
    "Caique": {"name": "Caique Alves", "region": "São Paulo - 2"},
    "Everton": {"name": "Everton Souza", "region": "São Paulo - 3"},
    "Guaracyaba": {"name": "Guaracyaba Leite", "region": "Rio de Janeiro"},
    "Francisco": {"name": "Francisco Felipe", "region": "BH, Sul e Nordeste"},
}


def env(name, default=None):
    value = os.environ.get(name, default)
    return default if value == "" else value


def normalize_store(value):
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
    aliases = {
        "buritis": "estoril",
        "sagrada familia": "santa efigenia",
        "centro": "catete ii",
        "barra 2": "barra da tijuca 2",
        "barra 3": "barra da tijuca 3",
    }
    return aliases.get(cleaned, cleaned)


def parse_existing_okrs():
    path = Path(__file__).parent / "dashboard" / "okrs_data.js"
    if not path.exists():
        return {}
    content = path.read_text(encoding="utf-8")
    match = re.search(r"window\.OKRS_DATA = (\{.*\});\s*$", content, re.S)
    return json.loads(match.group(1)) if match else {}


def ratio(numerator, denominator, scale=100):
    denominator = float(denominator or 0)
    return 0 if not denominator else (float(numerator or 0) / denominator) * scale


def metric_from_totals(row):
    orders_rappi = float(row.get("ordersRappi", 0) or 0)
    orders_ze = float(row.get("ordersZe", 0) or 0)
    orders_total = orders_rappi + orders_ze
    return {
        "orders": round(orders_total),
        "ordersRappi": round(orders_rappi),
        "ordersZe": round(orders_ze),
        "defect": round(ratio(row.get("drOps"), orders_rappi), 4),
        "cancel": round(ratio(row.get("cancel"), orders_rappi), 4),
        "availability": round(ratio(row.get("availabilityNumerator"), row.get("availabilityDenominator"), 100), 4),
        "stockout": round(ratio(row.get("stockoutOps"), orders_rappi), 4),
        "inStore": round(ratio(row.get("inStore"), orders_rappi, 1), 4),
        "productivity": round(ratio(orders_total, row.get("conections"), 1), 4),
        "damaged": round(ratio(row.get("mermaDamaged"), row.get("gmv")), 4),
        "_raw": {
            "gmv": float(row.get("gmv", 0) or 0),
            "inStore": float(row.get("inStore", 0) or 0),
            "cancel": round(float(row.get("cancel", 0) or 0)),
            "drOps": round(float(row.get("drOps", 0) or 0)),
            "stockoutOps": round(float(row.get("stockoutOps", 0) or 0)),
            "mermaDamaged": float(row.get("mermaDamaged", 0) or 0),
            "conections": float(row.get("conections", 0) or 0),
        },
    }


def empty_total(period_start="", period_end=""):
    return {
        "periodStart": period_start,
        "periodEnd": period_end,
        "ordersRappi": 0,
        "ordersZe": 0,
        "gmv": 0,
        "inStore": 0,
        "assign": 0,
        "picking": 0,
        "packing": 0,
        "cancel": 0,
        "drOps": 0,
        "stockoutOps": 0,
        "mermaDamaged": 0,
        "availabilityNumerator": 0,
        "availabilityDenominator": 0,
        "conections": 0,
    }


def add_row(total, row):
    orders = float(row["TOTAL_ORDERS_COUNT_GMV"] or 0)
    store_avl = float(row["STORE_AVL"] or 0)
    total["ordersRappi"] += orders
    total["ordersZe"] += float(row["ORDERS_ZE"] or 0)
    total["gmv"] += float(row["GMV"] or 0)
    total["inStore"] += float(row["IN_STORE"] or 0)
    total["assign"] += float(row["ASSIGN"] or 0)
    total["picking"] += float(row["PICKING"] or 0)
    total["packing"] += float(row["PACKING"] or 0)
    total["cancel"] += float(row["CANCEL"] or 0)
    total["drOps"] += float(row["DR_OPS"] or 0)
    total["stockoutOps"] += float(row["STOCKOUT_OPS"] or 0)
    total["mermaDamaged"] += float(row["MERMA_DAMAGED"] or 0)
    total["availabilityNumerator"] += store_avl * orders
    total["availabilityDenominator"] += orders
    total["conections"] += float(row["CONECTIONS"] or 0)


def with_preserved(current, previous):
    for key in ("okrs", "hotDrink"):
        if key in previous:
            current[key] = previous[key]
    return current


def main():
    params = {
        "account": env("SNOWFLAKE_ACCOUNT", "HG51401"),
        "user": env("SNOWFLAKE_USER", "jose.de@rappi.com"),
        "authenticator": env("SNOWFLAKE_AUTHENTICATOR", "externalbrowser"),
        "role": env("SNOWFLAKE_ROLE", "TURBO_ROLE"),
        "warehouse": env("SNOWFLAKE_WAREHOUSE", "RP_PERSONALUSER_WH"),
    }
    existing = parse_existing_okrs()
    store_meta = {
        normalize_store(row.get("store")): row
        for row in existing.get("stores", [])
    }
    coord_existing = {
        row.get("short"): row
        for row in existing.get("coordinators", [])
    }

    with snowflake.connector.connect(**params) as conn:
        with conn.cursor(snowflake.connector.DictCursor) as cur:
            cur.execute(SQL)
            rows = cur.fetchall()

    periods = {}
    by_store = {}
    coord_totals = {}
    for row in rows:
        period = str(row["PERIOD"]).lower()
        period_total = periods.setdefault(
            period,
            empty_total(str(row["DATE_DAY"]), str(row["END_DATE"])),
        )
        add_row(period_total, row)

        store = str(row["WAREHOUSENAME"] or "").strip()
        if not store or store == "Santa Cecilia Farma" or store.startswith("INACTIVE"):
            continue
        key = normalize_store(store)
        meta = store_meta.get(key, {})
        coord = meta.get("coord", "Sem coord")
        store_total = by_store.setdefault(
            key,
            {
                "store": store,
                "coord": coord,
                "plan": meta.get("plan"),
                "real": meta.get("real"),
                "diff": meta.get("diff", 0),
                "okrsMonth": meta.get("okrsMonth"),
                "okrsWeek": meta.get("okrsWeek"),
                "month": empty_total(),
                "week": empty_total(),
            },
        )
        add_row(store_total[period], row)

        coord_total = coord_totals.setdefault(
            coord,
            {
                "month": empty_total(),
                "week": empty_total(),
            },
        )
        add_row(coord_total[period], row)

    data = {}
    for period, total in periods.items():
        previous = existing.get(period, {})
        metric = metric_from_totals(total)
        metric["periodStart"] = total["periodStart"]
        metric["periodEnd"] = total["periodEnd"]
        data[period] = with_preserved(metric, previous)

    stores = []
    for item in by_store.values():
        month_metric = with_preserved(metric_from_totals(item["month"]), {})
        week_metric = with_preserved(metric_from_totals(item["week"]), {})
        stores.append(
            {
                "store": item["store"],
                "coord": item["coord"],
                "plan": item["plan"],
                "real": item["real"],
                "diff": item["diff"],
                "orders": week_metric["orders"],
                "prod": week_metric["productivity"],
                "okrsMonth": item["okrsMonth"],
                "okrsWeek": item["okrsWeek"],
                "defect": week_metric["defect"],
                "cancel": week_metric["cancel"],
                "availability": week_metric["availability"],
                "stockout": week_metric["stockout"],
                "inStore": week_metric["inStore"],
                "month": month_metric,
                "week": week_metric,
            }
        )
    stores.sort(key=lambda row: (row["coord"], row["store"]))

    coordinators = []
    for coord, totals in coord_totals.items():
        if coord == "Sem coord":
            continue
        meta = COORD_META.get(coord, {"name": coord, "region": ""})
        previous = coord_existing.get(coord, {})
        coord_row = {
            "name": meta["name"],
            "short": coord,
            "region": meta["region"],
            "month": with_preserved(metric_from_totals(totals["month"]), previous.get("month", {})),
            "week": with_preserved(metric_from_totals(totals["week"]), previous.get("week", {})),
            "scale": previous.get("scale", "Atualizado via base semanal"),
            "suggestions": previous.get("suggestions", []),
        }
        coordinators.append(coord_row)
    coordinators.sort(key=lambda row: row["short"])

    data["coordinators"] = coordinators
    data["stores"] = stores

    out = Path(__file__).parent / "dashboard" / "okrs_data.js"
    out.write_text(
        "window.OKRS_DATA_UPDATED_AT = "
        + json.dumps(datetime.now(ZoneInfo("America/Sao_Paulo")).isoformat(timespec="seconds"), ensure_ascii=False)
        + ";\n"
        + "window.OKRS_DATA = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )

    for key in ("month", "week"):
        row = data.get(key, {})
        print(
            f"{key}: orders={row.get('orders')} DR={row.get('defect')} "
            f"cancel={row.get('cancel')} prod={row.get('productivity')} "
            f"inStore={row.get('inStore')} damaged={row.get('damaged')} "
            f"stockout={row.get('stockout')} availability={row.get('availability')}"
        )
    print(f"wrote {len(stores)} stores and {len(coordinators)} coordinators to {out}")


if __name__ == "__main__":
    main()
