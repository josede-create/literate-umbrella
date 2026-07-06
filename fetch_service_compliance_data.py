import json
import os
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".deps"))

import snowflake.connector


GOALS = {
    "inStore": 2.6,
    "handoffPost": 0.9,
    "handoffPre": 1.5,
    "total": 12.0,
}

DAY_NAMES = {
    "Mon": "Segunda",
    "Tue": "Terca",
    "Wed": "Quarta",
    "Thu": "Quinta",
    "Fri": "Sexta",
    "Sat": "Sabado",
    "Sun": "Domingo",
}


def env(name, default=None):
    value = os.environ.get(name, default)
    return default if value == "" else value


def pick_column(columns, candidates, fallback=None):
    for name in candidates:
        if name.upper() in columns:
            return name.upper()
    return fallback


def metric_template():
    return {
        "orders": 0,
        "inStoreSum": 0.0,
        "handoffPostSum": 0.0,
        "handoffPreSum": 0.0,
        "totalSum": 0.0,
        "inStoreOk": 0,
        "handoffPostOk": 0,
        "handoffPreOk": 0,
    }


def add_order(bucket, row):
    bucket["orders"] += 1
    bucket["inStoreSum"] += row["inStore"]
    bucket["handoffPostSum"] += row["handoffPost"]
    bucket["handoffPreSum"] += row["handoffPre"]
    bucket["totalSum"] += row["total"]
    if row["inStore"] <= GOALS["inStore"]:
        bucket["inStoreOk"] += 1
    if row["handoffPost"] <= GOALS["handoffPost"]:
        bucket["handoffPostOk"] += 1
    if row["handoffPre"] <= GOALS["handoffPre"]:
        bucket["handoffPreOk"] += 1


def pct(ok, total):
    return round(ok / total * 100, 2) if total else 0.0


def avg(total, orders):
    return round(total / orders, 2) if orders else 0.0


def worst_stage(metric):
    gaps = {
        "InStore": avg(metric["inStoreSum"], metric["orders"]) - GOALS["inStore"],
        "Handoff post": avg(metric["handoffPostSum"], metric["orders"]) - GOALS["handoffPost"],
        "Handoff pre": avg(metric["handoffPreSum"], metric["orders"]) - GOALS["handoffPre"],
    }
    offenders = [name for name, gap in gaps.items() if gap > 0]
    if not offenders:
        return "Sem etapa acima da meta"
    return max(offenders, key=lambda name: gaps[name])


def summarize(metric, extra=None):
    orders = metric["orders"]
    result = {
        "orders": orders,
        "inStore": avg(metric["inStoreSum"], orders),
        "handoffPost": avg(metric["handoffPostSum"], orders),
        "handoffPre": avg(metric["handoffPreSum"], orders),
        "total": avg(metric["totalSum"], orders),
        "inStoreCompliance": pct(metric["inStoreOk"], orders),
        "handoffPostCompliance": pct(metric["handoffPostOk"], orders),
        "handoffPreCompliance": pct(metric["handoffPreOk"], orders),
        "offenderStage": worst_stage(metric),
    }
    if extra:
        result.update(extra)
    return result


def main():
    params = {
        "account": env("SNOWFLAKE_ACCOUNT", "HG51401"),
        "user": env("SNOWFLAKE_USER", "jose.de@rappi.com"),
        "authenticator": env("SNOWFLAKE_AUTHENTICATOR", "externalbrowser"),
        "role": env("SNOWFLAKE_ROLE", "TURBO_ROLE"),
        "warehouse": env("SNOWFLAKE_WAREHOUSE", "RP_PERSONALUSER_WH"),
    }

    with snowflake.connector.connect(**params) as conn:
        with conn.cursor(snowflake.connector.DictCursor) as cur:
            cur.execute(
                """
                SELECT column_name
                FROM RP_SILVER_DB_PROD.INFORMATION_SCHEMA.COLUMNS
                WHERE table_schema = 'TURBO_CORE'
                  AND table_name = 'BR_DELIVERY_TIMES'
                """
            )
            columns = {row["COLUMN_NAME"].upper() for row in cur.fetchall()}

            handoff_post_col = pick_column(
                columns,
                [
                    "HANDOFF_POST",
                    "POST_HANDOFF",
                    "HANDOFF_POST_TIME",
                    "POST_HANDOFF_TIME",
                    "HANDLING_TO_STOREKEEPER",
                ],
                "HANDLING_TO_STOREKEEPER",
            )
            handoff_pre_col = pick_column(
                columns,
                [
                    "HANDOFF_PRE",
                    "PRE_HANDOFF",
                    "HANDOFF_PRE_TIME",
                    "PRE_HANDOFF_TIME",
                    "ASSING_TO_PICKER",
                ],
                "ASSING_TO_PICKER",
            )
            total_col = "TOTAL_TIME" if "TOTAL_TIME" in columns else None

            in_store_expr = (
                "COALESCE(DT.ASSING_TO_PICKER, 0) + "
                "COALESCE(DT.PICKING, 0) + "
                "COALESCE(DT.PACKING, 0)"
            )
            handoff_post_expr = f"COALESCE(DT.{handoff_post_col}, 0)"
            handoff_pre_expr = f"COALESCE(DT.{handoff_pre_col}, 0)"
            total_expr = f"COALESCE(DT.{total_col}, 0)" if total_col else f"({in_store_expr} + {handoff_post_expr} + {handoff_pre_expr})"

            sql = f"""
            WITH periods AS (
              SELECT
                DATE_TRUNC('week', DATEADD('week', -1, CURRENT_DATE))::DATE AS start_date,
                DATEADD('day', -1, DATE_TRUNC('week', CURRENT_DATE))::DATE AS end_date,
                DATE_TRUNC('week', CURRENT_DATE)::DATE AS end_exclusive
            ),
            wh AS (
              SELECT DISTINCT
                KEYWH,
                CASE
                  WHEN WAREHOUSENAME = 'Buritis' THEN 'Estoril'
                  WHEN WAREHOUSENAME = 'Sagrada Familia' THEN 'Santa Efigênia'
                  WHEN WAREHOUSENAME = 'Centro' THEN 'Catete II'
                  ELSE TRIM(WAREHOUSENAME)
                END AS WAREHOUSENAME
              FROM FIVETRAN.CPGS_TURBO_DS_PUBLIC.BR_WAREHOUSE_NEW
            ),
            order_stage AS (
              SELECT
                COALESCE(W.WAREHOUSENAME, DT.KEYWH) AS WAREHOUSENAME,
                DT.ORDER_CREATED_AT::DATE AS ORDER_DATE,
                DAYNAME(DT.ORDER_CREATED_AT::DATE) AS DAY_NAME,
                DT.ORDER_ID,
                MAX({in_store_expr}) AS IN_STORE,
                MAX({handoff_post_expr}) AS HANDOFF_POST,
                MAX({handoff_pre_expr}) AS HANDOFF_PRE,
                MAX({total_expr}) AS TOTAL_TIME
              FROM RP_SILVER_DB_PROD.TURBO_CORE.BR_DELIVERY_TIMES DT
              CROSS JOIN periods P
              LEFT JOIN wh W
                ON DT.KEYWH = W.KEYWH
              WHERE DT.COUNTRY = 'BR'
                AND DT.ORDER_CREATED_AT::DATE >= P.start_date
                AND DT.ORDER_CREATED_AT::DATE < P.end_exclusive
                AND DT.ORDER_ID <> '2216319964'
              GROUP BY 1, 2, 3, 4
            )
            SELECT *
            FROM order_stage
            WHERE WAREHOUSENAME IS NOT NULL
              AND WAREHOUSENAME <> 'Santa Cecilia Farma'
            ORDER BY ORDER_DATE, WAREHOUSENAME, ORDER_ID
            """
            cur.execute(sql)
            rows = cur.fetchall()

    br = metric_template()
    by_day = {}
    by_store = {}
    by_store_day = {}
    start_date = None
    end_date = None

    for row in rows:
        store = str(row["WAREHOUSENAME"] or "").strip()
        if not store or store.startswith("Turbo X,"):
            continue
        order_date = str(row["ORDER_DATE"])
        start_date = order_date if start_date is None or order_date < start_date else start_date
        end_date = order_date if end_date is None or order_date > end_date else end_date
        item = {
            "store": store,
            "date": order_date,
            "dayName": DAY_NAMES.get(str(row["DAY_NAME"] or ""), str(row["DAY_NAME"] or "")),
            "inStore": float(row["IN_STORE"] or 0),
            "handoffPost": float(row["HANDOFF_POST"] or 0),
            "handoffPre": float(row["HANDOFF_PRE"] or 0),
            "total": float(row["TOTAL_TIME"] or 0),
        }

        add_order(br, item)

        day_metric = by_day.setdefault(order_date, {"label": item["dayName"], "metric": metric_template()})
        add_order(day_metric["metric"], item)

        store_metric = by_store.setdefault(store, metric_template())
        add_order(store_metric, item)

        store_day_key = (store, order_date)
        store_day_metric = by_store_day.setdefault(store_day_key, {"store": store, "date": order_date, "dayName": item["dayName"], "metric": metric_template()})
        add_order(store_day_metric["metric"], item)

    day_rows = [
        summarize(value["metric"], {"date": date, "dayName": value["label"]})
        for date, value in sorted(by_day.items())
    ]
    store_rows = [
        summarize(metric, {"store": store})
        for store, metric in by_store.items()
    ]
    store_rows.sort(key=lambda row: (row["total"] <= GOALS["total"], -row["total"], row["store"]))

    store_day_rows = [
        summarize(value["metric"], {"store": value["store"], "date": value["date"], "dayName": value["dayName"]})
        for value in by_store_day.values()
    ]
    store_day_rows.sort(key=lambda row: (row["store"], row["date"]))

    offenders = [row for row in store_rows if row["total"] > GOALS["total"]]
    offenders.sort(key=lambda row: (-row["total"], row["store"]))

    data = {
        "goals": GOALS,
        "period": {"start": start_date, "end": end_date},
        "sourceColumns": {
            "inStore": "ASSING_TO_PICKER + PICKING + PACKING",
            "handoffPost": handoff_post_col,
            "handoffPre": handoff_pre_col,
            "total": total_col or "inStore + handoffPost + handoffPre",
        },
        "br": summarize(br),
        "byDay": day_rows,
        "stores": store_rows,
        "storeDays": store_day_rows,
        "offenders": offenders,
    }

    out = Path(__file__).parent / "dashboard" / "service_compliance_data.js"
    out.write_text(
        "window.SERVICE_COMPLIANCE_UPDATED_AT = "
        + json.dumps(datetime.now(ZoneInfo("America/Sao_Paulo")).isoformat(timespec="seconds"), ensure_ascii=False)
        + ";\n"
        + "window.SERVICE_COMPLIANCE_DATA = "
        + json.dumps(data, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print(
        "wrote service compliance: "
        f"{data['br']['orders']} orders, "
        f"{len(day_rows)} days, "
        f"{len(store_rows)} stores, "
        f"{len(offenders)} offenders to {out}"
    )
    print(f"columns: post={handoff_post_col} pre={handoff_pre_col} total={total_col or 'derived'}")


if __name__ == "__main__":
    main()
