import json
import os
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".deps"))

import snowflake.connector


SQL_CONNECTIVITY = """
WITH params AS (
  SELECT
    DATE_TRUNC('WEEK', DATEADD('WEEK', -1, CURRENT_DATE()))::DATE AS previous_week_start,
    LEAST(DATE_TRUNC('WEEK', CURRENT_DATE())::DATE, DATEADD('DAY', -1, CURRENT_DATE())::DATE) AS current_week_start,
    DATEADD('DAY', -1, CURRENT_DATE())::DATE AS current_week_cutoff,
    DATEADD('DAY', -1, DATE_TRUNC('WEEK', CURRENT_DATE()))::DATE AS previous_week_end
),
wh AS (
  SELECT DISTINCT
    KEYWH,
    CITY_NAME,
    CASE
      WHEN WAREHOUSENAME = 'Buritis' THEN 'Estoril'
      WHEN WAREHOUSENAME = 'Sagrada Familia' THEN 'Santa Efigênia'
      WHEN WAREHOUSENAME = 'Centro' THEN 'Catete II'
      ELSE WAREHOUSENAME
    END AS warehousename
  FROM FIVETRAN.CPGS_TURBO_DS_PUBLIC.BR_WAREHOUSE_NEW
),
forecast_base AS (
  SELECT
    A.KEYWH,
    COALESCE(NULLIF(TRIM(W.warehousename), ''), A.KEYWH) AS WAREHOUSENAME,
    COALESCE(W.CITY_NAME, A.CITY_NAME) AS CITY_NAME,
    A.MAIN_DATE AS DATE,
    DAYNAME(A.MAIN_DATE) AS DAY_NAME,
    A.HORA,
    A.MAIN_WEEK,
    CASE
      WHEN A.MAIN_DATE BETWEEN P.previous_week_start AND P.previous_week_end THEN 'previous'
      WHEN A.MAIN_DATE BETWEEN P.current_week_start AND P.current_week_cutoff THEN 'current'
      ELSE NULL
    END AS WEEK_TYPE,
    A.ORDENES_PRONOSTICADAS_HORA,
    A.PICKERS_NEEDED,
    A.PICKERS_IN_NITRO,
    A.PICKERS_SCHEDULED,
    A.ASSING_TO_PICKER_HISTORIC,
    A.PICKING_HISTORIC,
    A.PACKING_HISTORIC
  FROM RP_GOLD_DB_PROD.TURBO_CORE.GLOBAL_FORECAST_OPS_PICKERS A
  CROSS JOIN params P
  LEFT JOIN wh W ON A.KEYWH = W.KEYWH
  WHERE A.COUNTRY = 'BR'
    AND (
      A.MAIN_DATE BETWEEN P.previous_week_start AND P.previous_week_end
      OR A.MAIN_DATE BETWEEN P.current_week_start AND P.current_week_cutoff
    )
),
base_orders_metrics AS (
  SELECT
    KEYWH,
    ORDER_CREATED_AT::DATE AS order_date,
    HOUR(ORDER_CREATED_AT) AS order_hour,
    COUNT(DISTINCT ORDER_ID) AS orders_count,
    ROUND(SUM(COALESCE(picking, 0) + COALESCE(assing_to_picker, 0) + COALESCE(packing, 0)), 1) AS in_store,
    ROUND(AVG(handling_to_storekeeper), 1) AS avg_thd
  FROM RP_SILVER_DB_PROD.TURBO_CORE.BR_DELIVERY_TIMES
  CROSS JOIN params P
  WHERE COUNTRY = 'BR'
    AND ORDER_CREATED_AT::DATE BETWEEN P.previous_week_start AND P.current_week_cutoff
  GROUP BY 1, 2, 3
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
  CROSS JOIN params P
  WHERE ROLE_NAME = 'Picker'
    AND KEYWH LIKE 'BR%%'
    AND COALESCE(ACTIVITY_ENDED_AT_FIX, ACTIVITY_ENDED_AT, SESSION_ENDED_AT) > P.previous_week_start::TIMESTAMP_NTZ
    AND ACTIVITY_STARTED_AT < DATEADD(DAY, 1, P.current_week_cutoff)::TIMESTAMP_NTZ
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
      FROM TABLE(GENERATOR(ROWCOUNT => 24 * 14))
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
  CROSS JOIN params P
  WHERE ROLE_NAME = 'Picker'
    AND KEYWH LIKE 'BR%%'
    AND COALESCE(ACTIVITY_ENDED_AT_FIX, ACTIVITY_ENDED_AT, SESSION_ENDED_AT) > P.previous_week_start::TIMESTAMP_NTZ
    AND ACTIVITY_STARTED_AT < DATEADD(DAY, 1, P.current_week_cutoff)::TIMESTAMP_NTZ
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
      FROM TABLE(GENERATOR(ROWCOUNT => 24 * 14))
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
),
picker_week_hours AS (
  SELECT
    CASE
      WHEN P.order_date BETWEEN PR.current_week_start AND PR.current_week_cutoff THEN 'current'
      WHEN P.order_date BETWEEN PR.previous_week_start AND PR.previous_week_end THEN 'previous'
      ELSE NULL
    END AS WEEK_TYPE,
    COALESCE(NULLIF(TRIM(W.warehousename), ''), P.KEYWH) AS WAREHOUSENAME,
    P.KEYWH,
    P.KEYPICKER,
    P.order_date,
    SUM(P.active_seconds) / 3600 AS active_hours,
    SUM(P.picking_seconds) / 3600 AS picking_hours,
    SUM(P.rest_seconds) / 3600 AS rest_hours,
    SUM(P.reception_seconds) / 3600 AS reception_hours,
    SUM(P.other_seconds) / 3600 AS other_hours,
    SUM(COALESCE(G.disconnected_seconds, 0)) / 3600 AS disconnected_hours
  FROM nitro_picker_hour P
  CROSS JOIN params PR
  LEFT JOIN nitro_gap_hour G
    ON P.KEYWH = G.KEYWH
    AND P.order_date = G.order_date
    AND P.order_hour = G.order_hour
    AND P.KEYPICKER = G.KEYPICKER
  LEFT JOIN wh W ON P.KEYWH = W.KEYWH
  WHERE P.order_date BETWEEN PR.previous_week_start AND PR.current_week_cutoff
  GROUP BY 1, 2, 3, 4, 5
),
picker_week_rollup AS (
  SELECT
    WEEK_TYPE,
    WAREHOUSENAME,
    KEYWH,
    KEYPICKER,
    COUNT(DISTINCT order_date) AS active_days,
    ROUND(SUM(active_hours), 2) AS active_hours,
    ROUND(SUM(picking_hours), 2) AS picking_hours,
    ROUND(SUM(rest_hours), 2) AS rest_hours,
    ROUND(SUM(reception_hours), 2) AS reception_hours,
    ROUND(SUM(other_hours), 2) AS other_hours,
    ROUND(SUM(disconnected_hours), 2) AS disconnected_hours,
    ROUND(SUM(picking_hours) / NULLIF(SUM(active_hours), 0) * 100, 1) AS picking_share
  FROM picker_week_hours
  WHERE WEEK_TYPE IS NOT NULL
  GROUP BY 1, 2, 3, 4
)
SELECT
  'connectivity' AS RECORD_TYPE,
  F.KEYWH,
  F.CITY_NAME,
  F.WAREHOUSENAME,
  F.DATE,
  F.DAY_NAME,
  F.HORA,
  F.MAIN_WEEK,
  F.WEEK_TYPE,
  P.current_week_cutoff AS CURRENT_WEEK_CUTOFF,
  F.ORDENES_PRONOSTICADAS_HORA,
  COALESCE(OM.orders_count, 0) AS TOTAL_ORDENES_HISTORICO,
  F.PICKERS_NEEDED,
  COALESCE(NH.pickers_total_connected, 0) AS PICKERS_TOTAL_CONNECTED,
  COALESCE(NH.pickers_in_picking, 0) AS PICKERS_IN_PICKING,
  COALESCE(NH.pickers_in_rest, 0) AS PICKERS_IN_REST,
  COALESCE(NH.pickers_disconnection, 0) AS PICKERS_DISCONNECTION,
  COALESCE(NH.pickers_in_reception, 0) AS PICKERS_IN_RECEPTION,
  COALESCE(NH.pickers_in_other_activities, 0) AS PICKERS_IN_OTHER_ACTIVITIES,
  F.PICKERS_IN_NITRO,
  F.PICKERS_SCHEDULED,
  F.ASSING_TO_PICKER_HISTORIC,
  F.PICKING_HISTORIC,
  F.PACKING_HISTORIC,
  OM.in_store,
  COALESCE(OM.orders_count, 0) AS orders,
  OM.avg_thd,
  NULL AS KEYPICKER,
  NULL AS ACTIVE_DAYS,
  NULL AS ACTIVE_HOURS,
  NULL AS PICKING_HOURS,
  NULL AS REST_HOURS,
  NULL AS RECEPTION_HOURS,
  NULL AS OTHER_HOURS,
  NULL AS DISCONNECTED_HOURS,
  NULL AS PICKING_SHARE
FROM forecast_base F
CROSS JOIN params P
LEFT JOIN base_orders_metrics OM
  ON F.KEYWH = OM.KEYWH
  AND F.HORA = OM.order_hour
  AND F.DATE = OM.order_date
LEFT JOIN nitro_hourly NH
  ON F.KEYWH = NH.KEYWH
  AND F.HORA = NH.order_hour
  AND F.DATE = NH.order_date
WHERE F.WEEK_TYPE IS NOT NULL

UNION ALL

SELECT
  'picker_offender' AS RECORD_TYPE,
  P.KEYWH,
  NULL AS CITY_NAME,
  P.WAREHOUSENAME,
  NULL AS DATE,
  NULL AS DAY_NAME,
  NULL AS HORA,
  NULL AS MAIN_WEEK,
  P.WEEK_TYPE,
  PR.current_week_cutoff AS CURRENT_WEEK_CUTOFF,
  NULL AS ORDENES_PRONOSTICADAS_HORA,
  NULL AS TOTAL_ORDENES_HISTORICO,
  NULL AS PICKERS_NEEDED,
  NULL AS PICKERS_TOTAL_CONNECTED,
  NULL AS PICKERS_IN_PICKING,
  NULL AS PICKERS_IN_REST,
  NULL AS PICKERS_DISCONNECTION,
  NULL AS PICKERS_IN_RECEPTION,
  NULL AS PICKERS_IN_OTHER_ACTIVITIES,
  NULL AS PICKERS_IN_NITRO,
  NULL AS PICKERS_SCHEDULED,
  NULL AS ASSING_TO_PICKER_HISTORIC,
  NULL AS PICKING_HISTORIC,
  NULL AS PACKING_HISTORIC,
  NULL AS in_store,
  NULL AS orders,
  NULL AS avg_thd,
  P.KEYPICKER,
  P.ACTIVE_DAYS,
  P.ACTIVE_HOURS,
  P.PICKING_HOURS,
  P.REST_HOURS,
  P.RECEPTION_HOURS,
  P.OTHER_HOURS,
  P.DISCONNECTED_HOURS,
  P.PICKING_SHARE
FROM picker_week_rollup P
CROSS JOIN params PR
WHERE P.WEEK_TYPE = 'current'
  AND P.ACTIVE_DAYS > 4
ORDER BY RECORD_TYPE, WEEK_TYPE, DATE, HORA, WAREHOUSENAME, KEYPICKER
"""


def env(name, default=None):
    value = os.environ.get(name, default)
    return default if value == "" else value


def main():
    params = {
        "account": env("SNOWFLAKE_ACCOUNT", "HG51401"),
        "user": env("SNOWFLAKE_USER", "jose.de@rappi.com"),
        "authenticator": env("SNOWFLAKE_AUTHENTICATOR", "externalbrowser"),
        "role": env("SNOWFLAKE_ROLE", "TURBO_ROLE"),
        "warehouse": env("SNOWFLAKE_WAREHOUSE", "RP_PERSONALUSER_WH"),
    }
    out = Path(__file__).parent / "dashboard" / "scale_data.js"
    with snowflake.connector.connect(**params) as conn:
        with conn.cursor(snowflake.connector.DictCursor) as cur:
            cur.execute(SQL_CONNECTIVITY)
            rows = cur.fetchall()

    connectivity_rows = [row for row in rows if row["RECORD_TYPE"] == "connectivity"]
    picker_offenders = [row for row in rows if row["RECORD_TYPE"] == "picker_offender"]
    previous_week_rows = [row for row in connectivity_rows if row["WEEK_TYPE"] == "previous"]
    current_week_rows = [row for row in connectivity_rows if row["WEEK_TYPE"] == "current"]
    current_week_cutoff = None
    if connectivity_rows:
        current_week_cutoff = str(connectivity_rows[0].get("CURRENT_WEEK_CUTOFF") or "")
    if not current_week_rows and current_week_cutoff:
        current_week_rows = [
            {**row, "WEEK_TYPE": "current"}
            for row in previous_week_rows
            if str(row.get("DATE") or "")[:10] == current_week_cutoff
        ]

    out.write_text(
        "window.SCALE_DATA_UPDATED_AT = "
        + json.dumps(datetime.now(ZoneInfo("America/Sao_Paulo")).isoformat(timespec="seconds"), ensure_ascii=False)
        + ";\n"
        + "window.SCALE_QUERY_ROWS = "
        + json.dumps(previous_week_rows, ensure_ascii=False, default=str)
        + ";\n"
        + "window.CONNECTIVITY_DATA = "
        + json.dumps(
            {
                "currentWeekCutoff": current_week_cutoff,
                "currentWeekRows": current_week_rows,
                "previousWeekRows": previous_week_rows,
                "pickerOffenders": picker_offenders,
            },
            ensure_ascii=False,
            default=str,
        )
        + ";\n",
        encoding="utf-8",
    )
    print(
        "wrote "
        f"{len(previous_week_rows)} previous rows, "
        f"{len(current_week_rows)} current rows and "
        f"{len(picker_offenders)} picker offenders to {out}"
    )


if __name__ == "__main__":
    main()
