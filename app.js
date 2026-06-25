const PERIODS = {
  month: "Abril MTD",
  week: "20/04 a 26/04",
};

const brMonth = {
  orders: 506100,
  okrs: 98.37,
  defect: 0.89,
  cancel: 0.06,
  availability: 97.16,
  stockout: 0.1,
  inStore: 2.29,
  productivity: 64.49,
  damaged: 0.07,
  hotDrink: 2.91,
};

const brWeek = {
  orders: 130099,
  okrs: 99.56,
  defect: 0.88,
  cancel: 0.26,
  availability: 97.47,
  stockout: 0.08,
  inStore: 0,
  productivity: 60.79,
  damaged: 0.07,
  hotDrink: 2.3,
};

const indicatorDefs = [
  { key: "orders", label: "Orders", type: "int", target: null, direction: "up" },
  { key: "okrs", label: "OKRS", type: "pct", target: 90, direction: "up" },
  { key: "defect", label: "DR", type: "pct", target: 1, direction: "down" },
  { key: "cancel", label: "Cancel", type: "pct", target: 0.15, direction: "down" },
  { key: "availability", label: "SO / Availability", type: "pct", target: 97, direction: "up" },
  { key: "stockout", label: "Stockout", type: "pct", target: 0.1, direction: "down" },
  { key: "inStore", label: "InStore", type: "num", target: 2.65, direction: "down" },
  { key: "productivity", label: "Produtividade", type: "num", target: 69, direction: "up" },
  { key: "damaged", label: "Danificados", type: "pct", target: 0.08, direction: "down" },
  { key: "hotDrink", label: "Bebida quente", type: "pct", target: 2.4, direction: "down" },
];

const coordinators = [
  {
    name: "Henrique Brasil",
    short: "Henrique",
    region: "São Paulo - 1",
    month: { orders: 137156, okrs: 97.82, defect: 0.9, cancel: 0.06, availability: 98.43, stockout: 0.09, inStore: 2.41, productivity: 68.99, damaged: 0.06, hotDrink: 3.36 },
    week: { orders: 34639, okrs: 96.43, defect: 0.92, cancel: 0.02, availability: 97.39, stockout: 0.05, inStore: 0, productivity: 64.38, damaged: 0.14, hotDrink: 2.18 },
    scale: "Vila Mascote -5; Brooklin II -4; Bela Vista -2",
    suggestions: [
      "Recalibrar Vila Mascote por hora e travar cobertura mínima nos picos de orders reais.",
      "Atacar bebida quente em Bela Vista e Alto do Ipiranga com rotina de separação e handoff.",
      "Brooklin II precisa de leitura por produtividade: o gap de -4 pode estar sendo escondido por pickers mais eficientes.",
    ],
  },
  {
    name: "Caique Alves",
    short: "Caique",
    region: "São Paulo - 2",
    month: { orders: 68299, okrs: 87.63, defect: 0.93, cancel: 0.07, availability: 96.71, stockout: 0.11, inStore: 2.08, productivity: 62.54, damaged: 0.24, hotDrink: 1.76 },
    week: { orders: 18537, okrs: 95.14, defect: 0.93, cancel: 0.03, availability: 98.58, stockout: 0.1, inStore: 0, productivity: 60.58, damaged: 0.16, hotDrink: 1.82 },
    scale: "Vila Clementino -5; Vila Prudente -3",
    suggestions: [
      "Vila Clementino pede plano combinado: recompor cobertura e reduzir danificados.",
      "Bonfinglioli precisa de rotina de produtividade antes de aumentar headcount.",
      "Carrão está positivo em pickers, mas sem converter em produtividade; validar presença ativa e tempo conectado.",
    ],
  },
  {
    name: "Everton Souza",
    short: "Everton",
    region: "São Paulo - 3",
    month: { orders: 132127, okrs: 95.51, defect: 0.85, cancel: 0.06, availability: 98.15, stockout: 0.13, inStore: 2.44, productivity: 69.07, damaged: 0.03, hotDrink: 4.15 },
    week: { orders: 33605, okrs: 99.86, defect: 0.84, cancel: 0.02, availability: 97.92, stockout: 0.08, inStore: 0, productivity: 62.58, damaged: 0.03, hotDrink: 4.66 },
    scale: "Santa Cecília -5; Cambuí -2; Moema -2",
    suggestions: [
      "Santa Cecília tem volume e gap relevante; priorizar ajuste de grade antes de mexer em lojas menores.",
      "Cambuí combina baixa qualidade com subcobertura: abrir ação diária de estoque/defect.",
      "Lapa e Santo Amaro pedem tratativa específica de cancelamento e stockout.",
    ],
  },
  {
    name: "Guaracyaba Leite",
    short: "Guaracyaba",
    region: "Rio de Janeiro",
    month: { orders: 76552, okrs: 97.29, defect: 0.93, cancel: 0.04, availability: 97.94, stockout: 0.13, inStore: 2.37, productivity: 64.06, damaged: 0.07, hotDrink: 2.57 },
    week: { orders: 19194, okrs: 99.23, defect: 0.93, cancel: 0.02, availability: 96.71, stockout: 0.12, inStore: 0, productivity: 59.79, damaged: 0.08, hotDrink: 0.35 },
    scale: "Catete II +2; Botafogo II está equilibrado",
    suggestions: [
      "Tijuca e Leblon precisam de plano de ruptura/abastecimento com leitura por horário.",
      "Catete II tem sobra de pickers, mas InStore alto; investigar fluxo de loja e recebimento.",
      "Reforçar produtividade nos dias de maior aderência de forecast para evitar aumento artificial de HC.",
    ],
  },
  {
    name: "Francisco Felipe",
    short: "Francisco",
    region: "BH, Sul e Nordeste",
    month: { orders: 91966, okrs: 92.83, defect: 0.86, cancel: 0.07, availability: 95.06, stockout: 0.07, inStore: 2.01, productivity: 58.69, damaged: 0.1, hotDrink: 1.95 },
    week: { orders: 24124, okrs: 98.77, defect: 0.83, cancel: 0.05, availability: 97.2, stockout: 0.07, inStore: 0, productivity: 57.03, damaged: 0.07, hotDrink: 1.33 },
    scale: "Recife Sul +2; Aldeota +1; Estoril -1",
    suggestions: [
      "Produtividade é o principal tema da regional: Recife Sul e Aldeota têm HC, mas não performam.",
      "Separar planos de escala e processo; adicionar picker onde há gap não resolve baixa eficiência.",
      "Castelo precisa de ação de qualidade apesar de produtividade alta.",
    ],
  },
];

const storeResults = [
  { store: "Vila Madalena", coord: "Henrique", plan: 25, real: 27, diff: 2, prod: 72.4, orders: 39820, okrsMonth: 98.8, okrsWeek: 99.1, defect: 0.74, cancel: 0.04, availability: 98.6, stockout: 0.06, inStore: 2.22 },
  { store: "Bela Vista", coord: "Henrique", plan: 18, real: 16, diff: -2, prod: 74.48, orders: 28420, okrsMonth: 89.53, okrsWeek: 98.12, defect: 0.92, cancel: 0.12, availability: 97.8, stockout: 0.08, inStore: 3.01 },
  { store: "Brooklin II", coord: "Henrique", plan: 17, real: 13, diff: -4, prod: 81.0, orders: 25776, okrsMonth: 94.1, okrsWeek: 97.9, defect: 0.88, cancel: 0.06, availability: 98.2, stockout: 0.09, inStore: 2.57 },
  { store: "Vila Mascote", coord: "Henrique", plan: 12, real: 7, diff: -5, prod: 64.69, orders: 19380, okrsMonth: 64.57, okrsWeek: 93.86, defect: 1.24, cancel: 0.18, availability: 94.1, stockout: 0.18, inStore: 3.3 },
  { store: "Alto do Ipiranga", coord: "Henrique", plan: 9, real: 7, diff: -2, prod: 77.81, orders: 14360, okrsMonth: 89.63, okrsWeek: 93.56, defect: 0.95, cancel: 0.07, availability: 96.2, stockout: 0.13, inStore: 2.76 },
  { store: "Vila Clementino", coord: "Caique", plan: 14, real: 9, diff: -5, prod: 63.64, orders: 20493, okrsMonth: 75.64, okrsWeek: 99.89, defect: 0.99, cancel: 0.07, availability: 96.9, stockout: 0.14, inStore: 2.38 },
  { store: "Vila Prudente", coord: "Caique", plan: 13, real: 10, diff: -3, prod: 57.29, orders: 17814, okrsMonth: 88.3, okrsWeek: 95.4, defect: 0.94, cancel: 0.06, availability: 97.3, stockout: 0.11, inStore: 2.18 },
  { store: "Bonfinglioli", coord: "Caique", plan: 8, real: 8, diff: 0, prod: 57.29, orders: 11480, okrsMonth: 79.7, okrsWeek: 85.88, defect: 1.04, cancel: 0.07, availability: 95.9, stockout: 0.13, inStore: 2.11 },
  { store: "Carrão", coord: "Caique", plan: 8, real: 9, diff: 1, prod: 60.79, orders: 12340, okrsMonth: 92.41, okrsWeek: 89.99, defect: 1.01, cancel: 0.04, availability: 97.6, stockout: 0.08, inStore: 2.02 },
  { store: "Alphaville", coord: "Caique", plan: 6, real: 6, diff: 0, prod: 69.4, orders: 9700, okrsMonth: 96.5, okrsWeek: 98.2, defect: 0.83, cancel: 0.05, availability: 97.2, stockout: 0.07, inStore: 2.23 },
  { store: "Santa Cecília", coord: "Everton", plan: 30, real: 25, diff: -5, prod: 71.0, orders: 48314, okrsMonth: 94.9, okrsWeek: 99.6, defect: 0.79, cancel: 0.05, availability: 98.1, stockout: 0.11, inStore: 3.07 },
  { store: "Cambui", coord: "Everton", plan: 9, real: 7, diff: -2, prod: 64.86, orders: 12418, okrsMonth: 69.6, okrsWeek: 94.56, defect: 1.15, cancel: 0.11, availability: 95.1, stockout: 0.18, inStore: 2.51 },
  { store: "Moema", coord: "Everton", plan: 18, real: 16, diff: -2, prod: 60.0, orders: 27897, okrsMonth: 92.9, okrsWeek: 98.7, defect: 0.84, cancel: 0.06, availability: 98.3, stockout: 0.12, inStore: 2.42 },
  { store: "Santo Amaro", coord: "Everton", plan: 10, real: 9, diff: -1, prod: 72.01, orders: 14890, okrsMonth: 76.78, okrsWeek: 95.57, defect: 0.87, cancel: 0.05, availability: 95.6, stockout: 0.2, inStore: 2.21 },
  { store: "Lapa", coord: "Everton", plan: 10, real: 9, diff: -1, prod: 65.2, orders: 13240, okrsMonth: 81.57, okrsWeek: 93.49, defect: 0.82, cancel: 0.14, availability: 96.4, stockout: 0.08, inStore: 2.15 },
  { store: "Tijuca", coord: "Guaracyaba", plan: 8, real: 7, diff: -1, prod: 64.55, orders: 15360, okrsMonth: 79.5, okrsWeek: 88.99, defect: 0.96, cancel: 0.05, availability: 95.7, stockout: 0.21, inStore: 2.39 },
  { store: "Leblon", coord: "Guaracyaba", plan: 12, real: 12, diff: 0, prod: 66.66, orders: 18670, okrsMonth: 87.03, okrsWeek: 87.52, defect: 0.91, cancel: 0.04, availability: 96.2, stockout: 0.19, inStore: 2.65 },
  { store: "Catete II", coord: "Guaracyaba", plan: 8, real: 10, diff: 2, prod: 70.51, orders: 13416, okrsMonth: 95.35, okrsWeek: 97.76, defect: 0.82, cancel: 0.03, availability: 97.5, stockout: 0.09, inStore: 2.89 },
  { store: "Botafogo II", coord: "Guaracyaba", plan: 14, real: 14, diff: 0, prod: 67.2, orders: 19100, okrsMonth: 96.4, okrsWeek: 99.1, defect: 0.86, cancel: 0.03, availability: 98.1, stockout: 0.08, inStore: 2.33 },
  { store: "Aldeota", coord: "Francisco", plan: 10, real: 11, diff: 1, prod: 48.44, orders: 16945, okrsMonth: 77.34, okrsWeek: 87.36, defect: 0.88, cancel: 0.07, availability: 92.7, stockout: 0.18, inStore: 1.94 },
  { store: "Recife Sul", coord: "Francisco", plan: 10, real: 12, diff: 2, prod: 50.55, orders: 15178, okrsMonth: 85.41, okrsWeek: 96.32, defect: 0.85, cancel: 0.12, availability: 96.1, stockout: 0.08, inStore: 2.05 },
  { store: "Castelo", coord: "Francisco", plan: 7, real: 6, diff: -1, prod: 86.19, orders: 11760, okrsMonth: 89.63, okrsWeek: 98.62, defect: 1.05, cancel: 0.09, availability: 97.6, stockout: 0.07, inStore: 2.12 },
  { store: "Estoril", coord: "Francisco", plan: 11, real: 10, diff: -1, prod: 58.7, orders: 14280, okrsMonth: 93.2, okrsWeek: 98.4, defect: 0.8, cancel: 0.05, availability: 97.9, stockout: 0.06, inStore: 2.01 },
];

const extraStoreResults = [
  { store: "Aflitos", coord: "Francisco", plan: 16, real: 16, diff: 0, prod: 61.8, orders: 18520, okrsMonth: 94.7, okrsWeek: 97.8, defect: 0.86, cancel: 0.06, availability: 97.4, stockout: 0.08, inStore: 2.18 },
  { store: "Vila Izabel", coord: "Francisco", plan: 8, real: 8, diff: 0, prod: 59.4, orders: 9360, okrsMonth: 91.8, okrsWeek: 96.1, defect: 0.83, cancel: 0.05, availability: 96.8, stockout: 0.07, inStore: 2.08 },
  { store: "Ipanema", coord: "Guaracyaba", plan: 9, real: 8, diff: -1, prod: 62.7, orders: 10980, okrsMonth: 92.4, okrsWeek: 96.9, defect: 0.9, cancel: 0.04, availability: 97.1, stockout: 0.12, inStore: 2.42 },
  { store: "Barra 3", coord: "Guaracyaba", plan: 7, real: 6, diff: -1, prod: 63.2, orders: 10110, okrsMonth: 93.1, okrsWeek: 97.2, defect: 0.87, cancel: 0.04, availability: 97.6, stockout: 0.1, inStore: 2.31 },
  { store: "Jardins", coord: "Henrique", plan: 18, real: 16, diff: -2, prod: 70.4, orders: 24680, okrsMonth: 96.7, okrsWeek: 98.4, defect: 0.78, cancel: 0.05, availability: 98.4, stockout: 0.07, inStore: 2.58 },
  { store: "Santana", coord: "Everton", plan: 9, real: 8, diff: -1, prod: 64.9, orders: 12680, okrsMonth: 92.7, okrsWeek: 96.8, defect: 0.89, cancel: 0.06, availability: 97.2, stockout: 0.12, inStore: 2.36 },
  { store: "Barra 2", coord: "Guaracyaba", plan: 7, real: 7, diff: 0, prod: 65.1, orders: 11240, okrsMonth: 94.2, okrsWeek: 98.1, defect: 0.84, cancel: 0.03, availability: 97.8, stockout: 0.09, inStore: 2.22 },
  { store: "Alto do XV", coord: "Francisco", plan: 6, real: 7, diff: 1, prod: 56.9, orders: 8200, okrsMonth: 90.4, okrsWeek: 95.8, defect: 0.88, cancel: 0.06, availability: 96.9, stockout: 0.08, inStore: 2.95 },
  { store: "PA Centro", coord: "Francisco", plan: 7, real: 7, diff: 0, prod: 57.6, orders: 8700, okrsMonth: 91.2, okrsWeek: 96.4, defect: 0.82, cancel: 0.05, availability: 97.1, stockout: 0.07, inStore: 2.16 },
  { store: "Vila Olimpia", coord: "Henrique", plan: 26, real: 24, diff: -2, prod: 74.8, orders: 36200, okrsMonth: 97.4, okrsWeek: 99.0, defect: 0.73, cancel: 0.04, availability: 98.8, stockout: 0.05, inStore: 2.44 },
  { store: "Morumbi", coord: "Henrique", plan: 16, real: 16, diff: 0, prod: 72.2, orders: 23210, okrsMonth: 96.1, okrsWeek: 98.7, defect: 0.81, cancel: 0.05, availability: 98.1, stockout: 0.08, inStore: 2.39 },
  { store: "Aclimação", coord: "Caique", plan: 9, real: 7, diff: -2, prod: 61.6, orders: 11860, okrsMonth: 90.7, okrsWeek: 95.2, defect: 0.96, cancel: 0.07, availability: 96.7, stockout: 0.1, inStore: 2.26 },
  { store: "Santo André", coord: "Caique", plan: 8, real: 7, diff: -1, prod: 62.1, orders: 10770, okrsMonth: 92.0, okrsWeek: 96.0, defect: 0.9, cancel: 0.06, availability: 97.0, stockout: 0.09, inStore: 2.19 },
  { store: "Santa Efigênia", coord: "Everton", plan: 11, real: 11, diff: 0, prod: 66.8, orders: 15140, okrsMonth: 95.2, okrsWeek: 98.5, defect: 0.81, cancel: 0.04, availability: 98.0, stockout: 0.06, inStore: 2.28 },
  { store: "Nova Recreio", coord: "Guaracyaba", plan: 5, real: 5, diff: 0, prod: 61.2, orders: 6980, okrsMonth: 91.9, okrsWeek: 96.3, defect: 0.91, cancel: 0.05, availability: 96.9, stockout: 0.1, inStore: 2.32 },
];

const allStores = [...storeResults, ...extraStoreResults].sort((a, b) => a.store.localeCompare(b.store));
const scaleQueryRows = Array.isArray(window.SCALE_QUERY_ROWS) ? window.SCALE_QUERY_ROWS : [];
const connectionAuditRows = Array.isArray(window.CONNECTION_AUDIT_SUMMARY) ? window.CONNECTION_AUDIT_SUMMARY : [];
const peakUniqueRows = Array.isArray(window.PEAK_UNIQUE_CONNECTED) ? window.PEAK_UNIQUE_CONNECTED : [];

const hourlyCurve = [0.01, 0.01, 0.006, 0.005, 0.004, 0.005, 0.012, 0.025, 0.04, 0.05, 0.055, 0.063, 0.067, 0.067, 0.064, 0.059, 0.062, 0.07, 0.078, 0.09, 0.09, 0.073, 0.045, 0.021];
const shiftCoverage = [0.22, 0.18, 0.14, 0.11, 0.09, 0.12, 0.2, 0.38, 0.56, 0.66, 0.72, 0.76, 0.78, 0.76, 0.77, 0.75, 0.78, 0.84, 0.92, 1, 0.98, 0.88, 0.66, 0.4];
const weekDays = [
  { label: "Segunda", date: "20/04/2026", orderShare: 0.18, attendance: 0.89, programFactor: 1.04 },
  { label: "Terça", date: "21/04/2026", orderShare: 0.15, attendance: 0.91, programFactor: 1 },
  { label: "Quarta", date: "22/04/2026", orderShare: 0.16, attendance: 0.93, programFactor: 1.03 },
  { label: "Quinta", date: "23/04/2026", orderShare: 0.16, attendance: 0.9, programFactor: 0.98 },
  { label: "Sexta", date: "24/04/2026", orderShare: 0.18, attendance: 0.87, programFactor: 1.06 },
  { label: "Sábado", date: "25/04/2026", orderShare: 0.11, attendance: 0.82, programFactor: 0.82 },
  { label: "Domingo", date: "26/04/2026", orderShare: 0.06, attendance: 0.78, programFactor: 0.62 },
];

function fmtInt(value) {
  return new Intl.NumberFormat("pt-BR").format(Math.round(value));
}

function fmtDateTime(value) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function fmtMetric(value, def) {
  if (def.type === "int") return fmtInt(value);
  if (def.type === "pct") return `${Number(value).toFixed(2)}%`;
  return Number(value).toFixed(2);
}

function fmtNum(value, digits = 1) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value || 0));
}

function fmtPct(value, digits = 1) {
  return `${fmtNum(value, digits)}%`;
}

function fmtSigned(value, digits = 1) {
  return `${Number(value || 0) >= 0 ? "+" : ""}${fmtNum(value, digits)}`;
}

function statusClass(value, metric, direction = "up", target = null) {
  if (metric === "delta") return value < 0 ? "red" : value > 0 ? "amber" : "green";
  if (target !== null) {
    const good = direction === "up" ? value >= target : value <= target;
    const warning = direction === "up" ? value >= target * 0.96 : value <= target * 1.5;
    return good ? "green" : warning ? "amber" : "red";
  }
  if (metric === "okrs") return value >= 90 ? "green" : value >= 80 ? "amber" : "red";
  if (metric === "prod") return value >= 69 ? "green" : value >= 62 ? "amber" : "red";
  return "amber";
}

function status(value, metric, suffix = "", direction = "up", target = null) {
  return `<span class="status ${statusClass(Number(value), metric, direction, target)}">${value}${suffix}</span>`;
}

function deltaText(week, month, def) {
  const delta = week - month;
  const signal = delta > 0 ? "+" : "";
  if (def.type === "int") return `${signal}${fmtInt(delta)} vs mês`;
  return `${signal}${delta.toFixed(2)}${def.type === "pct" ? " p.p." : ""} vs mês`;
}

function pickerNeed(orders, receiving = 0, time = 3, h6 = 1) {
  if (orders <= 0) return 0;
  const minutesPerOrder = time + 1;
  const breakBufferMinutesPerHour = 5;
  const productiveMinutesPerPickerHour = Math.max(1, 60 * h6 - breakBufferMinutesPerHour);
  const basePickers = (orders * minutesPerOrder) / productiveMinutesPerPickerHour;
  const replenishmentCoverage = 0.25 * h6;
  return Math.ceil(basePickers + replenishmentCoverage + receiving);
}

function insightForStore(row) {
  if (row.diff < -2 && row.prod >= 69) return "Repor cobertura nos picos; produtividade boa indica risco de sobrecarga.";
  if (row.diff < 0 && row.prod < 62) return "Tratar escala e processo juntos; aumentar HC sem rotina pode não converter.";
  if (row.diff > 0 && row.prod < 62) return "Validar presença ativa, ociosidade e aderência por hora.";
  if (row.inStore > 2.65) return "Abrir diagnóstico de fila/recebimento e redistribuir breaks.";
  if (row.stockout > 0.15) return "Priorizar ruptura com loja e revisar abastecimento antes dos picos.";
  return "Monitorar curva horária e manter plano atual com checagem semanal.";
}

function renderKpis() {
  document.querySelector("#br-kpis").innerHTML = indicatorDefs
    .map((def) => {
      const month = brMonth[def.key];
      const week = brWeek[def.key];
      const className = statusClass(week, def.key === "productivity" ? "prod" : def.key, def.direction, def.target);
      return `<article class="kpi ${className}">
        <p class="label">${def.label}</p>
        <p class="value">${fmtMetric(week, def)}</p>
        <p class="sub"><strong>${PERIODS.week}</strong> · ${deltaText(week, month, def)}</p>
        <p class="sub">Mês: ${fmtMetric(month, def)}${def.target !== null ? ` · Meta: ${def.type === "pct" ? `${def.target.toFixed(2)}%` : def.target}` : ""}</p>
      </article>`;
    })
    .join("");
}

function renderInsights() {
  const insights = [
    "OKRS BR segue forte na última semana, mas produtividade cai para 60,79 contra 64,49 no mês. O tema urgente é eficiência, não apenas volume.",
    "Cancel subiu de 0,06% no mês para 0,26% na última semana. Prioridade: separar cancel por loja e horário, porque é o maior desvio percentual do bloco BR.",
    "A disponibilidade melhora na semana, porém stockout ainda pressiona coordenadores específicos. Cruce stockout com lojas fora do InStore antes de concluir que o problema é só escala.",
    "O delta de pickers tem dois riscos: falta em lojas grandes como Santa Cecília/Vila Mascote e sobra com baixa produtividade em Recife Sul/Aldeota.",
  ];
  document.querySelector("#br-insights").innerHTML = insights.map((item) => `<li>${item}</li>`).join("");
}

function renderCompareTable() {
  const head = ["Indicador", PERIODS.month, PERIODS.week, "Delta", "Leitura"];
  document.querySelector("#br-compare-table").innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${indicatorDefs
      .map((def) => {
        const month = brMonth[def.key];
        const week = brWeek[def.key];
        const delta = week - month;
        const improved = def.direction === "up" ? delta >= 0 : delta <= 0;
        const deltaLabel = def.type === "int" ? fmtInt(delta) : `${delta > 0 ? "+" : ""}${delta.toFixed(2)}${def.type === "pct" ? " p.p." : ""}`;
        const reading = improved ? "melhorou vs mês" : "piorou vs mês";
        return `<tr>
          <td><strong>${def.label}</strong></td>
          <td>${fmtMetric(month, def)}</td>
          <td>${status(fmtMetric(week, def).replace("%", ""), def.key === "productivity" ? "prod" : def.key, def.type === "pct" ? "%" : "", def.direction, def.target)}</td>
          <td>${status(deltaLabel, improved ? "okrs" : "delta", "", improved ? "up" : "down", improved ? null : 0)}</td>
          <td>${reading}</td>
        </tr>`;
      })
      .join("")}</tbody>`;
}

function renderOffenders() {
  const rows = allStores
    .map((row) => ({
      ...row,
      score: row.okrsMonth + row.okrsWeek + row.prod - Math.abs(Math.min(row.diff, 0)) * 8 - Math.max(row.inStore - 2.65, 0) * 20,
      signal: [row.okrsMonth < 90 ? "OKRS mês" : null, row.okrsWeek < 95 ? "OKRS semana" : null, row.prod < 62 ? "produtividade" : null, row.diff < 0 ? "gap escala" : null, row.inStore > 2.65 ? "InStore" : null].filter(Boolean).join(", "),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 16);
  const head = ["Prioridade", "Coord.", "Loja", "OKRS mês", "OKRS semana", "Prod.", "Delta pickers", "Sinal", "Insight / o que fazer"];
  document.querySelector("#offenders-table").innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (r, i) => `<tr>
          <td>${i + 1}</td>
          <td>${r.coord}</td>
          <td><strong>${r.store}</strong></td>
          <td>${status(r.okrsMonth.toFixed(2), "okrs", "%")}</td>
          <td>${status(r.okrsWeek.toFixed(2), "okrs", "%")}</td>
          <td>${status(r.prod.toFixed(2), "prod")}</td>
          <td>${status(r.diff, "delta")}</td>
          <td>${r.signal || "sem ofensor crítico"}</td>
          <td>${insightForStore(r)}</td>
        </tr>`,
      )
      .join("")}</tbody>`;
}

function coveragePct(row) {
  return Number(row.avg_needed || 0) > 0 ? (Number(row.avg_connected || 0) / Number(row.avg_needed || 0)) * 100 : 0;
}

function preGameAuditRows() {
  return connectionAuditRows
    .filter((row) => row.window_type === "pre_game_4h")
    .sort((a, b) => String(a.date_day).localeCompare(String(b.date_day)));
}

function latestGameId() {
  const rows = preGameAuditRows();
  return rows.length ? rows[rows.length - 1].game_id : null;
}

function findPeakRow(gameId) {
  return peakUniqueRows.find((row) => row.game_id === gameId) || {};
}

function connectivityDeltaStatus(value) {
  const className = value >= 0 ? "green" : value >= -40 ? "amber" : "red";
  return `<span class="status ${className}">${fmtSigned(value)}</span>`;
}

function aggregateConnectivityRows(rows) {
  return rows.reduce(
    (acc, row) => {
      acc.forecast += Number(row.ORDENES_PRONOSTICADAS_HORA || 0);
      acc.orders += Number(row.TOTAL_ORDENES_HISTORICO || row.ORDERS || 0);
      acc.needed += Number(row.PICKERS_NEEDED || 0);
      acc.scheduled += Number(row.PICKERS_SCHEDULED || 0);
      acc.connected += Number(row.PICKERS_CONECTED || row.PICKERS_CONNECTED || 0);
      acc.picking += Number(row.PICKERS_IN_PICKING || 0);
      acc.rest += Number(row.PICKERS_IN_REST || 0);
      acc.reception += Number(row.PICKERS_IN_RECEPTION || 0);
      acc.other += Number(row.PICKERS_IN_OTHER_ACTIVITIES || 0);
      acc.instoreNumerator += Number(row.IN_STORE || 0);
      return acc;
    },
    { forecast: 0, orders: 0, needed: 0, scheduled: 0, connected: 0, picking: 0, rest: 0, reception: 0, other: 0, instoreNumerator: 0 },
  );
}

function renderConnectivityKpis() {
  const target = document.querySelector("#connectivity-kpis");
  if (!target) return;
  const rows = preGameAuditRows();
  const latest = rows[rows.length - 1] || {};
  const previous = rows[rows.length - 2] || {};
  const peak = findPeakRow(latest.game_id);
  const coverage = coveragePct(latest);
  const previousCoverage = coveragePct(previous);
  const latestStoreRows = scaleQueryRows.filter((row) => row.GAME_ID === latest.game_id);
  const totals = aggregateConnectivityRows(latestStoreRows);
  const deltaPh = Number(latest.connected_ph || 0) - Number(latest.needed_ph || 0);
  const kpis = [
    {
      label: "Cobertura conectada",
      value: fmtPct(coverage),
      sub: `${latest.game_label || "Último jogo"} · ${coverage - previousCoverage >= 0 ? "+" : ""}${fmtNum(coverage - previousCoverage)} p.p. vs jogo anterior`,
      className: coverage >= 100 ? "green" : coverage >= 90 ? "amber" : "red",
    },
    {
      label: "Média conectada",
      value: fmtNum(latest.avg_connected),
      sub: `Necessidade média ${fmtNum(latest.avg_needed)} pickers`,
      className: Number(latest.avg_connected || 0) >= Number(latest.avg_needed || 0) ? "green" : "amber",
    },
    {
      label: "Delta picker-hora",
      value: fmtSigned(deltaPh),
      sub: `${fmtNum(latest.connected_ph)} conectado vs ${fmtNum(latest.needed_ph)} necessário`,
      className: deltaPh >= 0 ? "green" : deltaPh >= -80 ? "amber" : "red",
    },
    {
      label: "Pico conectado",
      value: fmtInt(peak.unique_pickers_any_store || 0),
      sub: `Hora ${peak.peak_hour ?? "-"} · ${fmtInt(peak.stores_with_connection || 0)} lojas com conexão`,
      className: "green",
    },
    {
      label: "Orders janela",
      value: fmtInt(totals.orders),
      sub: `${fmtNum(totals.connected)} picker-hora conectado · ${fmtNum(totals.picking)} em picking`,
      className: totals.connected >= totals.needed ? "green" : "amber",
    },
  ];
  target.innerHTML = kpis
    .map(
      (item) => `<article class="kpi ${item.className}">
        <p class="label">${item.label}</p>
        <p class="value">${item.value}</p>
        <p class="sub">${item.sub}</p>
      </article>`,
    )
    .join("");
}

function renderConnectivitySummaryTable() {
  const target = document.querySelector("#connectivity-summary-table");
  if (!target) return;
  const head = ["Jogo", "Janela", "Conectado médio", "Necessário médio", "Cobertura", "Delta PH", "Pico únicos", "Lojas"];
  target.innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${preGameAuditRows()
      .map((row) => {
        const peak = findPeakRow(row.game_id);
        const delta = Number(row.connected_ph || 0) - Number(row.needed_ph || 0);
        const coverage = coveragePct(row);
        return `<tr>
          <td><strong>${row.game_label}</strong><span class="muted-cell">${row.date_day}</span></td>
          <td>${row.window_label}</td>
          <td>${fmtNum(row.avg_connected)}</td>
          <td>${fmtNum(row.avg_needed)}</td>
          <td><span class="status ${coverage >= 100 ? "green" : coverage >= 90 ? "amber" : "red"}">${fmtPct(coverage)}</span></td>
          <td>${connectivityDeltaStatus(delta)}</td>
          <td>${fmtInt(peak.unique_pickers_any_store || 0)} <span class="muted-cell">h${peak.peak_hour ?? "-"}</span></td>
          <td>${fmtInt(row.stores_with_connection || 0)}</td>
        </tr>`;
      })
      .join("")}</tbody>`;
}

function renderConnectivityHourlyTable() {
  const target = document.querySelector("#connectivity-hourly-table");
  if (!target) return;
  const byGameHour = new Map();
  scaleQueryRows.forEach((row) => {
    const key = `${row.GAME_ID}|${row.HORA}`;
    const current = byGameHour.get(key) || { game: row.GAME_LABEL, date: row.DATE, hour: row.HORA, rows: [] };
    current.rows.push(row);
    byGameHour.set(key, current);
  });
  const rows = [...byGameHour.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)) || Number(a.hour) - Number(b.hour));
  const head = ["Jogo", "Hora", "Forecast", "Orders", "Necess.", "Prog.", "Conect.", "Picking", "Pausa", "Receb.", "Outras", "Delta"];
  target.innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map((item) => {
        const totals = aggregateConnectivityRows(item.rows);
        const delta = totals.connected - totals.needed;
        return `<tr>
          <td class="day-cell"><strong>${item.game}</strong><span>${item.date}</span></td>
          <td class="metric-cell">h${item.hour}</td>
          <td>${fmtInt(totals.forecast)}</td>
          <td>${fmtInt(totals.orders)}</td>
          <td>${fmtNum(totals.needed)}</td>
          <td>${fmtNum(totals.scheduled)}</td>
          <td>${fmtNum(totals.connected)}</td>
          <td>${fmtNum(totals.picking)}</td>
          <td>${fmtNum(totals.rest)}</td>
          <td>${fmtNum(totals.reception)}</td>
          <td>${fmtNum(totals.other)}</td>
          <td class="${heatClass(delta)}">${fmtSigned(delta)}</td>
        </tr>`;
      })
      .join("")}</tbody>`;
}

function renderConnectivityStoreTable() {
  const target = document.querySelector("#connectivity-store-table");
  if (!target) return;
  const gameId = latestGameId();
  const byStore = new Map();
  scaleQueryRows
    .filter((row) => row.GAME_ID === gameId)
    .forEach((row) => {
      const key = normalizeStore(row.WAREHOUSENAME);
      const current = byStore.get(key) || { store: row.WAREHOUSENAME, city: row.CITY_NAME, rows: [] };
      current.rows.push(row);
      byStore.set(key, current);
    });
  const rows = [...byStore.values()]
    .map((item) => ({ ...item, totals: aggregateConnectivityRows(item.rows) }))
    .sort((a, b) => a.totals.connected - a.totals.needed - (b.totals.connected - b.totals.needed))
    .slice(0, 20);
  const head = ["Loja", "Cidade", "Orders", "Necess.", "Prog.", "Conect.", "Picking", "Receb.", "Delta", "InStore", "THD"];
  target.innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map((item) => {
        const totals = item.totals;
        const delta = totals.connected - totals.needed;
        const thdRows = item.rows.map((row) => Number(row.AVG_THD || 0)).filter(Boolean);
        const thd = thdRows.length ? thdRows.reduce((acc, value) => acc + value, 0) / thdRows.length : 0;
        return `<tr>
          <td><strong>${item.store}</strong></td>
          <td>${item.city}</td>
          <td>${fmtInt(totals.orders)}</td>
          <td>${fmtNum(totals.needed)}</td>
          <td>${fmtNum(totals.scheduled)}</td>
          <td>${fmtNum(totals.connected)}</td>
          <td>${fmtNum(totals.picking)}</td>
          <td>${fmtNum(totals.reception)}</td>
          <td>${connectivityDeltaStatus(delta)}</td>
          <td>${totals.orders ? fmtNum(totals.instoreNumerator / totals.orders, 2) : "-"}</td>
          <td>${thd ? fmtNum(thd, 2) : "-"}</td>
        </tr>`;
      })
      .join("")}</tbody>`;
}

function renderScaleTable() {
  const queryStores = scaleQueryRows.length ? topInStoreStoresFromQuery().slice(0, 5) : [];
  const rows = queryStores.length ? queryStores : [...allStores].sort((a, b) => b.inStore - a.inStore).slice(0, 5);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const metrics = [
    ["real", "Orders real"],
    ["needed", "Pickers necessários"],
    ["scheduled", "Pickers programados"],
    ["connected", "Pickers conectados"],
    ["delta", "Delta"],
  ];
  document.querySelector("#scale-priority-table").innerHTML = `
    <thead>
      <tr><th>Loja / dia</th><th>Métrica</th><th>Total</th>${hours.map((hour) => `<th>${hour}</th>`).join("")}</tr>
    </thead>
    <tbody>${rows
      .map((store) =>
        getQueryDays()
          .map((day) => {
            const profile = scaleQueryRows.length ? buildStoreHourlyProfileFromQuery(store.store, day.date) : buildStoreHourlyProfile(store, day);
            return metrics
              .map(([key, label], index) => {
                const values = profile[key];
                return `<tr>
                  ${index === 0 ? `<td class="day-cell" rowspan="${metrics.length}"><strong>${store.store}</strong><span>${day.label} · ${day.date}</span><span>${store.coord} · InStore ${store.inStore.toFixed(2)}</span></td>` : ""}
                  <td class="metric-cell">${label}</td>
                  <td class="total-cell">${fmtInt(sum(values))}</td>
                  ${values.map((value) => `<td class="${key === "delta" ? heatClass(value) : ""}">${fmtInt(value)}</td>`).join("")}
                </tr>`;
              })
              .join("");
          })
          .join(""),
      )
      .join("")}</tbody>`;
}

function buildHourlyRows() {
  if (scaleQueryRows.length) return buildHourlyRowsFromQuery();
  const totalPlan = allStores.reduce((acc, row) => acc + row.plan, 0);
  const totalConnected = allStores.reduce((acc, row) => acc + row.real, 0);
  const connectedCalibration = 141 / (totalConnected * shiftCoverage[17] * weekDays[0].attendance);
  const scheduledCalibration = connectedCalibration * 1.08;
  return weekDays.map((day) => {
    const profiles = allStores.map((store) => buildStoreHourlyProfile(store, day, connectedCalibration, scheduledCalibration));
    const forecast = sumProfiles(profiles, "forecast");
    const real = sumProfiles(profiles, "real");
    const scheduled = sumProfiles(profiles, "scheduled");
    const connected = sumProfiles(profiles, "connected");
    const needed = sumProfiles(profiles, "needed");
    const delta = connected.map((value, hour) => value - needed[hour]);
    return { ...day, forecast, real, scheduled, connected, needed, delta };
  });
}

function buildHourlyRowsFromQuery() {
  return getQueryDays().map((day) => {
    const rows = scaleQueryRows.filter((row) => dateKey(row.DATE) === day.date);
    const forecast = aggregateQueryByHour(rows, (row) => Number(row.ORDENES_PRONOSTICADAS_HORA || 0));
    const real = aggregateQueryByHour(rows, (row) => Number(row.TOTAL_ORDENES_HISTORICO || row.ORDERS || 0));
    const scheduled = aggregateQueryByHour(rows, (row) => Number(row.PICKERS_SCHEDULED || 0));
    const connected = aggregateQueryByHour(rows, (row) => Number(row.PICKERS_CONECTED || row.PICKERS_CONNECTED || 0));
    const needed = aggregateQueryByHour(rows, (row) => Number(row.PICKERS_NEEDED ?? pickerNeed(Number(row.TOTAL_ORDENES_HISTORICO || row.ORDERS || 0), 0, 3, 1)));
    const delta = connected.map((value, hour) => value - needed[hour]);
    return { ...day, forecast, real, scheduled, connected, needed, delta };
  });
}

function buildStoreHourlyProfileFromQuery(storeName, date) {
  const rows = scaleQueryRows.filter((row) => normalizeStore(row.WAREHOUSENAME) === normalizeStore(storeName) && dateKey(row.DATE) === date);
  const forecast = aggregateQueryByHour(rows, (row) => Number(row.ORDENES_PRONOSTICADAS_HORA || 0));
  const real = aggregateQueryByHour(rows, (row) => Number(row.TOTAL_ORDENES_HISTORICO || row.ORDERS || 0));
  const scheduled = aggregateQueryByHour(rows, (row) => Number(row.PICKERS_SCHEDULED || 0));
  const connected = aggregateQueryByHour(rows, (row) => Number(row.PICKERS_CONECTED || row.PICKERS_CONNECTED || 0));
  const needed = aggregateQueryByHour(rows, (row) => Number(row.PICKERS_NEEDED ?? pickerNeed(Number(row.TOTAL_ORDENES_HISTORICO || row.ORDERS || 0), 0, 3, 1)));
  const delta = connected.map((value, hour) => value - needed[hour]);
  return { forecast, real, scheduled, connected, needed, delta };
}

function aggregateQueryByHour(rows, mapper) {
  const values = Array.from({ length: 24 }, () => 0);
  rows.forEach((row) => {
    const hour = Number(row.HORA);
    if (Number.isInteger(hour) && hour >= 0 && hour <= 23) values[hour] += Number(mapper(row) || 0);
  });
  return values;
}

function getQueryDays() {
  if (!scaleQueryRows.length) return weekDays;
  const dates = [...new Set(scaleQueryRows.map((row) => dateKey(row.DATE)).filter(Boolean))].sort();
  return dates.map((date) => ({ label: weekdayPt(date), date }));
}

function topInStoreStoresFromQuery() {
  const byStore = new Map();
  scaleQueryRows.forEach((row) => {
    const store = row.WAREHOUSENAME || "Sem loja";
    const current = byStore.get(store) || { store, coord: "Query", inStoreNumerator: 0, orders: 0, plan: 0, real: 0, diff: 0, prod: 0, inStore: 0 };
    const orders = Number(row.TOTAL_ORDENES_HISTORICO || row.ORDERS || 0);
    current.inStoreNumerator += Number(row.IN_STORE || 0);
    current.orders += orders;
    current.plan += Number(row.PICKERS_SCHEDULED || 0);
    current.real += Number(row.PICKERS_CONECTED || row.PICKERS_CONNECTED || 0);
    byStore.set(store, current);
  });
  return [...byStore.values()]
    .map((row) => ({
      ...row,
      inStore: row.orders > 0 ? row.inStoreNumerator / row.orders : 0,
      diff: row.real - row.plan,
      prod: row.real > 0 ? row.orders / row.real : 0,
    }))
    .sort((a, b) => b.inStore - a.inStore);
}

function normalizeStore(value) {
  return String(value || "").trim().toLowerCase();
}

function dateKey(value) {
  return String(value || "").slice(0, 10);
}

function weekdayPt(date) {
  const [year, month, day] = date.split("-").map(Number);
  const names = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return names[new Date(year, month - 1, day).getDay()];
}

function buildStoreHourlyProfile(store, day = weekDays[0], connectedCalibration = 1, scheduledCalibration = 1) {
  const weeklyOrders = Math.round(store.orders / 4);
  const dayOrders = weeklyOrders * day.orderShare;
  const forecast = hourlyCurve.map((share, hour) => Math.round(dayOrders * share * (hour >= 18 && hour <= 21 ? 1.03 : 0.97)));
  const real = forecast.map((value, hour) => Math.round(value * (hour >= 18 && hour <= 21 ? 1.16 : hour <= 6 ? 1.08 : 1 + (day.orderShare - 0.14))));
  const scheduled = shiftCoverage.map((coverage, hour) => Math.max(hour >= 5 && hour <= 23 ? 1 : 0, Math.round(store.plan * coverage * day.programFactor * scheduledCalibration)));
  const connected = shiftCoverage.map((coverage, hour) => Math.max(hour >= 5 && hour <= 23 ? 1 : 0, Math.round(store.real * coverage * day.attendance * connectedCalibration)));
  const needed = real.map((orders, hour) => pickerNeed(orders, hour >= 8 && hour <= 21 ? 1 : 0, 3, 1));
  const delta = connected.map((value, hour) => value - needed[hour]);
  return { forecast, real, scheduled, connected, needed, delta };
}

function sumProfiles(profiles, key) {
  return Array.from({ length: 24 }, (_, hour) => profiles.reduce((acc, profile) => acc + profile[key][hour], 0));
}

function sum(values) {
  return values.reduce((acc, item) => acc + item, 0);
}

function heatClass(value) {
  if (value < 0) return "heat-bad";
  if (value > 1) return "heat-good";
  return "heat-ok";
}

function renderHourlyMatrix() {
  const days = buildHourlyRows();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const metrics = [
    ["forecast", "Forecast orders"],
    ["real", "Ordens real"],
    ["needed", "Pickers necessários"],
    ["scheduled", "Pickers programados"],
    ["connected", "Pickers conectados"],
    ["delta", "Delta BR"],
  ];
  document.querySelector("#hourly-matrix").innerHTML = `
    <thead>
      <tr><th>Dia</th><th>Métrica</th><th>Total</th>${hours.map((hour) => `<th>${hour}</th>`).join("")}</tr>
    </thead>
    <tbody>${days
      .map((day) =>
        metrics
          .map(([key, label], index) => {
            const values = day[key];
            return `<tr>
              ${index === 0 ? `<td class="day-cell" rowspan="${metrics.length}"><strong>${day.label}</strong><span>Dia ${day.date}</span></td>` : ""}
              <td class="metric-cell">${label}</td>
              <td class="total-cell">${fmtInt(sum(values))}</td>
              ${values.map((value) => `<td class="${key === "delta" ? heatClass(value) : ""}">${fmtInt(value)}</td>`).join("")}
            </tr>`;
          })
          .join(""),
      )
      .join("")}</tbody>`;
}

function renderPickerGapTable() {
  const rows = [...allStores].sort((a, b) => a.diff - b.diff || a.store.localeCompare(b.store));
  const head = ["Loja", "Coord.", "Plan", "Real", "Delta", "Prod.", "InStore", "Leitura"];
  document.querySelector("#picker-gap-table").innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (row) => `<tr>
          <td><strong>${row.store}</strong></td>
          <td>${row.coord}</td>
          <td>${row.plan}</td>
          <td>${row.real}</td>
          <td>${status(row.diff, "delta")}</td>
          <td>${status(row.prod.toFixed(1), "prod")}</td>
          <td>${status(row.inStore.toFixed(2), "inStore", "", "down", 2.65)}</td>
          <td>${insightForStore(row)}</td>
        </tr>`,
      )
      .join("")}</tbody>`;
}

function renderCoordinatorCards() {
  document.querySelector("#coord-grid").innerHTML = coordinators
    .map((coord) => {
      const trend = coord.week.okrs - coord.month.okrs;
      const stores = allStores.filter((row) => row.coord === coord.short).sort((a, b) => a.okrsMonth - b.okrsMonth);
      return `<article class="coord-card">
        <div class="coord-top">
          <div>
            <h3>${coord.name}</h3>
            <p>${coord.region}</p>
          </div>
          <span class="pill ${trend < 0 ? "warning" : ""}">Semana x mês: ${trend > 0 ? "+" : ""}${trend.toFixed(2)} p.p.</span>
        </div>
        <div class="coord-body">
          <div class="coord-metrics full">
            ${indicatorDefs
              .map((def) => `<div class="mini-metric">
                <span>${def.label}</span>
                <strong>${fmtMetric(coord.week[def.key], def)}</strong>
                <em>Mês ${fmtMetric(coord.month[def.key], def)}</em>
              </div>`)
              .join("")}
          </div>
          <h4>Resultado por loja</h4>
          <div class="table-wrap slim">
            <table class="compact-table">
              <thead><tr><th>Loja</th><th>OKRS M</th><th>OKRS W</th><th>Prod.</th><th>SO</th><th>DR</th><th>Cancel</th><th>InStore</th><th>Δ</th></tr></thead>
              <tbody>${stores
                .map(
                  (row) => `<tr>
                    <td>${row.store}</td>
                    <td>${status(row.okrsMonth.toFixed(1), "okrs", "%")}</td>
                    <td>${status(row.okrsWeek.toFixed(1), "okrs", "%")}</td>
                    <td>${status(row.prod.toFixed(1), "prod")}</td>
                    <td>${row.availability.toFixed(1)}%</td>
                    <td>${row.defect.toFixed(2)}%</td>
                    <td>${row.cancel.toFixed(2)}%</td>
                    <td>${status(row.inStore.toFixed(2), "inStore", "", "down", 2.65)}</td>
                    <td>${status(row.diff, "delta")}</td>
                  </tr>`,
                )
                .join("")}</tbody>
            </table>
          </div>
          <p><strong>Escala/headcount:</strong> ${coord.scale}</p>
          <h4>Offensores e sugestões</h4>
          <ul class="suggestions">${coord.suggestions.map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
      </article>`;
    })
    .join("");
}

function drawBarChart(canvas, labels, series, options = {}) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, rect.width * dpr);
  canvas.height = Math.max(1, Number(canvas.getAttribute("height")) * dpr);
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = Number(canvas.getAttribute("height"));
  ctx.clearRect(0, 0, width, height);
  const pad = { top: 30, right: 18, bottom: 58, left: options.left || 48 };
  const max = Math.max(...series.flatMap((s) => s.values), options.target || 0) * 1.18;
  const groupW = (width - pad.left - pad.right) / labels.length;
  const barW = Math.max(12, Math.min(28, (groupW - 18) / series.length));
  ctx.font = "10px Inter, sans-serif";
  ctx.strokeStyle = "#d9e0e7";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + ((height - pad.top - pad.bottom) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }
  if (options.target) {
    const y = pad.top + (height - pad.top - pad.bottom) * (1 - options.target / max);
    ctx.strokeStyle = "#17202a";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#17202a";
    ctx.fillText(`meta ${options.target}`, width - pad.right - 68, y - 6);
  }
  series.forEach((s, idx) => {
    ctx.fillStyle = s.color;
    ctx.fillRect(pad.left + idx * 186, 8, 12, 12);
    ctx.fillStyle = "#17202a";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText(s.name, pad.left + 18 + idx * 186, 18);
  });
  labels.forEach((label, i) => {
    const x = pad.left + i * groupW + groupW / 2;
    ctx.fillStyle = "#607080";
    ctx.textAlign = "center";
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText(label, x, height - 38);
    ctx.fillStyle = "#8a98a6";
    ctx.font = "9px Inter, sans-serif";
    ctx.fillText("Mês", x, height - 22);
    ctx.fillText("Sem.", x, height - 9);
    ctx.font = "10px Inter, sans-serif";
    series.forEach((s, j) => {
      const value = s.values[i];
      const barH = (height - pad.top - pad.bottom) * (value / max);
      const bx = pad.left + i * groupW + (j - (series.length - 1) / 2) * (barW + 5) + groupW / 2 - barW / 2;
      const by = height - pad.bottom - barH;
      ctx.fillStyle = s.color;
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = "#17202a";
      ctx.save();
      ctx.translate(bx + barW / 2, Math.max(38, by - 5));
      ctx.rotate(-0.35);
      ctx.textAlign = "center";
      ctx.fillText(s.display[i], 0, 0);
      ctx.restore();
    });
  });
}

function drawHorizontalChart(canvas, rows, key) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const desiredHeight = Math.max(Number(canvas.getAttribute("height")), rows.length * 30 + 52);
  canvas.setAttribute("height", String(desiredHeight));
  canvas.width = rect.width * dpr;
  canvas.height = desiredHeight * dpr;
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = desiredHeight;
  ctx.clearRect(0, 0, width, height);
  const pad = { top: 24, right: 40, bottom: 18, left: 150 };
  const min = Math.min(...rows.map((r) => r[key]), 0);
  const max = Math.max(...rows.map((r) => r[key]), 0);
  const absMax = Math.max(Math.abs(min), Math.abs(max), 1);
  const center = pad.left + (width - pad.left - pad.right) / 2;
  const rowH = (height - pad.top - pad.bottom) / rows.length;
  ctx.strokeStyle = "#17202a";
  ctx.beginPath();
  ctx.moveTo(center, pad.top - 4);
  ctx.lineTo(center, height - pad.bottom + 4);
  ctx.stroke();
  rows.forEach((row, i) => {
    const y = pad.top + i * rowH + rowH * 0.18;
    const value = row[key];
    const barW = ((width - pad.left - pad.right) / 2) * (Math.abs(value) / absMax);
    const x = value < 0 ? center - barW : center;
    ctx.fillStyle = value < 0 ? "#b42318" : value > 0 ? "#b7791f" : "#607080";
    ctx.fillRect(x, y, Math.max(value === 0 ? 2 : barW, 2), rowH * 0.58);
    ctx.fillStyle = "#26323d";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${row.store} (${row.coord})`, 8, y + rowH * 0.42);
    ctx.fillText(String(value), value < 0 ? x - 26 : x + barW + 8, y + rowH * 0.42);
  });
}

function renderCharts() {
  drawHorizontalChart(
    document.querySelector("#pickerGapChart"),
    [...allStores].sort((a, b) => a.diff - b.diff || a.store.localeCompare(b.store)),
    "diff",
  );
}

function init() {
  document.querySelector("#data-updated-at").textContent = `Última atualização dos dados: ${fmtDateTime(window.SCALE_DATA_UPDATED_AT)}`;
  renderKpis();
  renderInsights();
  renderCompareTable();
  renderOffenders();
  renderConnectivityKpis();
  renderConnectivitySummaryTable();
  renderConnectivityHourlyTable();
  renderConnectivityStoreTable();
  renderScaleTable();
  renderHourlyMatrix();
  renderPickerGapTable();
  renderCoordinatorCards();
  renderCharts();
}

window.addEventListener("resize", () => {
  clearTimeout(window.__resizeTimer);
  window.__resizeTimer = setTimeout(renderCharts, 120);
});

init();
