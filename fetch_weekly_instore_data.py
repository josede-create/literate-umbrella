import json
import os
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".deps"))

import snowflake.connector


SQL = """
WITH date_bounds AS (
  SELECT
    DATE_TRUNC(WEEK, DATEADD(WEEK, -4, CURRENT_DATE))::DATE AS start_date,
    DATE_TRUNC(WEEK, CURRENT_DATE)::DATE AS end_date
),
delivery_base AS (
  SELECT
    DATE_TRUNC(WEEK, DT.ORDER_CREATED_AT)::DATE AS week_start,
    CASE
      WHEN W.WAREHOUSENAME = 'Buritis' THEN 'Estoril'
      WHEN W.WAREHOUSENAME = 'Sagrada Familia' THEN 'Santa Efigênia'
      ELSE COALESCE(W.WAREHOUSENAME, DT.KEYWH)
    END AS warehouse_name,
    COUNT(DISTINCT DT.ORDER_ID) AS orders_rappi,
    SUM(COALESCE(DT.ASSING_TO_PICKER, 0)) AS assign_time,
    SUM(COALESCE(DT.PICKING, 0)) AS picking_time,
    SUM(COALESCE(DT.PACKING, 0)) AS packing_time,
    COUNT(DISTINCT DT.KEYPICK) AS pickers_connected
  FROM RP_SILVER_DB_PROD.TURBO_CORE.BR_DELIVERY_TIMES DT
  LEFT JOIN FIVETRAN.CPGS_TURBO_DS_PUBLIC.BR_WAREHOUSE_NEW W
    ON DT.KEYWH = W.KEYWH
  CROSS JOIN date_bounds B
  WHERE DT.COUNTRY = 'BR'
    AND DT.ORDER_CREATED_AT::DATE >= B.start_date
    AND DT.ORDER_CREATED_AT::DATE < B.end_date
    AND DT.ORDER_ID <> '2216319964'
  GROUP BY 1, 2
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
    END AS WAREHOUSENAME
  FROM FIVETRAN.CPGS_TURBO_DS_PUBLIC.BR_WAREHOUSE_NEW
),
store_map AS (
  SELECT DISTINCT STORE_ID, WAREHOUSE_ID
  FROM FIVETRAN.CPGS_TURBO_DS_PUBLIC.GLOBAL_WAREHOUSE_STORE
  WHERE COUNTRY_CODE = 'BR'
    AND NEW_ARCH = 'true'
),
orders_rappi_official AS (
  SELECT
    DATE_TRUNC(WEEK, O.CREATED_AT)::DATE AS week_start,
    COUNT(DISTINCT O.ORDER_ID) AS orders_rappi
  FROM RP_SILVER_DB_PROD.DES_PROD.ORDERS_BR O
  JOIN store_map S
    ON S.STORE_ID = O.STORE_ID
  JOIN wh W
    ON W.WAREHOUSEID = S.WAREHOUSE_ID
  CROSS JOIN date_bounds B
  WHERE O.CREATED_AT::DATE >= B.start_date
    AND O.CREATED_AT::DATE < B.end_date
    AND O.IS_FINISHED = TRUE
    AND O.STATE IN ('pending_review', 'finished')
    AND O.COUNTRY = 'BR'
    AND UPPER(O.VERTICAL_SUB_GROUP) = 'TURBO'
    AND COALESCE(O.STORE_TYPE_STORE, '') NOT IN ('turbo_veinticuatro_nc', 'retailers_cargo')
  GROUP BY 1
),
connections AS (
  SELECT
    DATE_TRUNC(WEEK, MAIN_DATE)::DATE AS week_start,
    SUM(num_pickers) AS conections
  FROM RP_GOLD_DB_PROD.TURBO_CORE.GLOBAL_PICKER_PRODUCTIVITY_PBI
  CROSS JOIN date_bounds B
  WHERE COUNTRY = 'BR'
    AND MAIN_DATE::DATE >= B.start_date
    AND MAIN_DATE::DATE < B.end_date
    AND duration_range IN ('5:00 - 5:59', '7:00 - 7:59', '6:00 - 6:59', '> 8:00', '4:00 - 4:59')
    AND role_name IN ('Store Lead / Picker support', 'Picker')
  GROUP BY 1
),
orders_ze AS (
  SELECT
    DATE_TRUNC(WEEK, CREATED_AT)::DATE AS week_start,
    COUNT(DISTINCT ORDER_ID) AS orders_ze
  FROM RP_SILVER_DB_PROD.TURBO_CORE.ORDERS_ZE_DELIVERY
  CROSS JOIN date_bounds B
  WHERE COUNTRY = 'BR'
    AND STATE = 'pending_review'
    AND CREATED_AT::DATE >= B.start_date
    AND CREATED_AT::DATE < B.end_date
  GROUP BY 1
)
SELECT
  D.week_start,
  DATEADD(DAY, 6, D.week_start)::DATE AS week_end,
  COALESCE(MAX(O.orders_rappi), SUM(D.orders_rappi)) AS orders_rappi,
  COALESCE(MAX(Z.orders_ze), 0) AS orders_ze,
  COALESCE(MAX(O.orders_rappi), SUM(D.orders_rappi)) + COALESCE(MAX(Z.orders_ze), 0) AS orders_total,
  SUM(D.assign_time) / NULLIF(SUM(D.orders_rappi), 0) AS assign,
  SUM(D.picking_time) / NULLIF(SUM(D.orders_rappi), 0) AS picking,
  SUM(D.packing_time) / NULLIF(SUM(D.orders_rappi), 0) AS packing,
  (SUM(D.assign_time) + SUM(D.picking_time) + SUM(D.packing_time)) / NULLIF(SUM(D.orders_rappi), 0) AS instore,
  COUNT_IF((D.assign_time + D.picking_time + D.packing_time) / NULLIF(D.orders_rappi, 0) <= 2.57) AS stores_in_goal,
  COUNT_IF(D.orders_rappi > 0) AS stores_total,
  (COALESCE(MAX(O.orders_rappi), SUM(D.orders_rappi)) + COALESCE(MAX(Z.orders_ze), 0)) / NULLIF(MAX(C.conections), 0) AS productivity
FROM delivery_base D
LEFT JOIN orders_ze Z
  ON D.week_start = Z.week_start
LEFT JOIN orders_rappi_official O
  ON D.week_start = O.week_start
LEFT JOIN connections C
  ON D.week_start = C.week_start
GROUP BY 1
ORDER BY 1
"""


def env(name, default=None):
    value = os.environ.get(name, default)
    return default if value == "" else value


def to_float(value):
    return None if value is None else float(value)


def main():
    params = {
        "account": env("SNOWFLAKE_ACCOUNT", "HG51401"),
        "user": env("SNOWFLAKE_USER", "jose.de@rappi.com"),
        "authenticator": env("SNOWFLAKE_AUTHENTICATOR", "externalbrowser"),
        "role": env("SNOWFLAKE_ROLE", "TURBO_ROLE"),
        "warehouse": env("SNOWFLAKE_WAREHOUSE", "RP_PERSONALUSER_WH"),
    }
    out = Path(__file__).parent / "dashboard" / "weekly_instore_data.js"
    with snowflake.connector.connect(**params) as conn:
        with conn.cursor(snowflake.connector.DictCursor) as cur:
            cur.execute(SQL)
            rows = cur.fetchall()

    weeks = []
    for row in rows:
        weeks.append(
            {
                "weekStart": str(row["WEEK_START"]),
                "weekEnd": str(row["WEEK_END"]),
                "ordersRappi": int(row["ORDERS_RAPPI"] or 0),
                "ordersZe": int(row["ORDERS_ZE"] or 0),
                "ordersTotal": int(row["ORDERS_TOTAL"] or 0),
                "assign": to_float(row["ASSIGN"]),
                "picking": to_float(row["PICKING"]),
                "packing": to_float(row["PACKING"]),
                "inStore": to_float(row["INSTORE"]),
                "productivity": to_float(row["PRODUCTIVITY"]),
                "storesInGoal": int(row["STORES_IN_GOAL"] or 0),
                "storesTotal": int(row["STORES_TOTAL"] or 0),
            }
        )

    out.write_text(
        "window.WEEKLY_INSTORE_DATA_UPDATED_AT = "
        + json.dumps(datetime.now(ZoneInfo("America/Sao_Paulo")).isoformat(timespec="seconds"), ensure_ascii=False)
        + ";\n"
        + "window.WEEKLY_INSTORE_DATA = "
        + json.dumps({"goal": 2.57, "weeks": weeks}, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {len(weeks)} weeks to {out}")


if __name__ == "__main__":
    main()
