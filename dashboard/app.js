const PERIODS = {
  month: "Maio MTD",
  week: "04/05 a 10/05",
};

const brMonth = {
  orders: 524410,
  okrs: 99.05,
  defect: 0.91,
  cancel: 0.06,
  availability: 97.26,
  stockout: 0.1,
  inStore: 2.29,
  productivity: 66.02,
  damaged: 0.07,
  hotDrink: 2.87,
};

const brWeek = {
  orders: 142957,
  okrs: 99.93,
  defect: 0.94,
  cancel: 0.06,
  availability: 99.61,
  stockout: 0.09,
  inStore: 2.27,
  productivity: 66.77,
  damaged: 0.03,
  hotDrink: 2.75,
};

if (window.OKRS_DATA?.month) {
  Object.assign(brMonth, window.OKRS_DATA.month);
}

if (window.OKRS_DATA?.week) {
  Object.assign(brWeek, window.OKRS_DATA.week);
}

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

let coordinators = [
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

let storeResults = [
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

let extraStoreResults = [
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

if (Array.isArray(window.OKRS_DATA?.coordinators)) {
  coordinators = window.OKRS_DATA.coordinators.map((coord) => ({
    ...coord,
    scale: coord.scale || "Atualizado via base semanal",
    suggestions: coord.suggestions || [
      "Priorizar lojas com InStore e cancel acima da meta.",
      "Cruzar escala por hora com picos de orders e presença conectada.",
      "Separar causa de processo de loja versus execução de picker.",
    ],
  }));
}

if (Array.isArray(window.OKRS_DATA?.stores)) {
  storeResults = window.OKRS_DATA.stores.map((store) => ({
    ...store,
    okrsMonth: store.okrsMonth ?? store.okrsWeek,
  }));
  extraStoreResults = [];
}

if (Array.isArray(window.OKRS_DATA?.coordinators)) {
  coordinators = window.OKRS_DATA.coordinators.map((coord) => ({
    ...coord,
    scale: coord.scale || "Atualizado via base semanal",
    suggestions: coord.suggestions || [
      "Priorizar lojas com InStore e cancel acima da meta.",
      "Cruzar escala por hora com picos de orders e presença conectada.",
      "Separar causa de processo de loja versus execução de picker.",
    ],
  }));
}

const allStores = [...storeResults, ...extraStoreResults].sort((a, b) => a.store.localeCompare(b.store));
const scaleQueryRows = Array.isArray(window.SCALE_QUERY_ROWS) ? window.SCALE_QUERY_ROWS : [];
const dailyStores = Array.isArray(window.DAILY_DATA?.stores) ? [...window.DAILY_DATA.stores].sort((a, b) => a.store.localeCompare(b.store)) : [];
const dailyOps = window.DAILY_OPS || {};
const dailyPickers = Array.isArray(window.DAILY_PICKERS) ? window.DAILY_PICKERS : [];

const hourlyCurve = [0.01, 0.01, 0.006, 0.005, 0.004, 0.005, 0.012, 0.025, 0.04, 0.05, 0.055, 0.063, 0.067, 0.067, 0.064, 0.059, 0.062, 0.07, 0.078, 0.09, 0.09, 0.073, 0.045, 0.021];
const shiftCoverage = [0.22, 0.18, 0.14, 0.11, 0.09, 0.12, 0.2, 0.38, 0.56, 0.66, 0.72, 0.76, 0.78, 0.76, 0.77, 0.75, 0.78, 0.84, 0.92, 1, 0.98, 0.88, 0.66, 0.4];
const weekDays = [
  { label: "Segunda", date: "04/05/2026", orderShare: 0.18, attendance: 0.89, programFactor: 1.04 },
  { label: "Terça", date: "05/05/2026", orderShare: 0.15, attendance: 0.91, programFactor: 1 },
  { label: "Quarta", date: "06/05/2026", orderShare: 0.16, attendance: 0.93, programFactor: 1.03 },
  { label: "Quinta", date: "07/05/2026", orderShare: 0.16, attendance: 0.9, programFactor: 0.98 },
  { label: "Sexta", date: "08/05/2026", orderShare: 0.18, attendance: 0.87, programFactor: 1.06 },
  { label: "Sábado", date: "09/05/2026", orderShare: 0.11, attendance: 0.82, programFactor: 0.82 },
  { label: "Domingo", date: "10/05/2026", orderShare: 0.06, attendance: 0.78, programFactor: 0.62 },
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

function storeHref(store) {
  return `#daily-store=${encodeURIComponent(store)}`;
}

function storeLink(store) {
  return `<a class="store-link" href="${storeHref(store)}">${store}</a>`;
}

function deltaText(week, month, def) {
  const delta = week - month;
  const signal = delta > 0 ? "+" : "";
  if (def.type === "int") return `${signal}${fmtInt(delta)} vs mês`;
  return `${signal}${delta.toFixed(2)}${def.type === "pct" ? " p.p." : ""} vs mês`;
}

function pickerNeed(orders, receiving = 0, time = 3.27, h6 = 1) {
  if (orders === 0) return 0;
  const base = (time * (orders + (orders * 0.5) / 60) + (orders * 0.25) / 2 + orders / 5) / (60 * h6);
  const roundedBase = Math.ceil(base);
  const need = Math.ceil(base + roundedBase / 7.33);
  return Math.max(2, need) + receiving;
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

function renderMonthKpis() {
  document.querySelector("#month-kpis").innerHTML = indicatorDefs
    .map((def) => {
      const month = brMonth[def.key];
      const className = statusClass(month, def.key === "productivity" ? "prod" : def.key, def.direction, def.target);
      return `<article class="kpi ${className}">
        <p class="label">${def.label}</p>
        <p class="value">${fmtMetric(month, def)}</p>
        <p class="sub"><strong>${PERIODS.month}</strong> · resultado acumulado do mês</p>
        <p class="sub">${def.target !== null ? `Meta: ${def.type === "pct" ? `${def.target.toFixed(2)}%` : def.target}` : "Total BR consolidado"}</p>
      </article>`;
    })
    .join("");
}

function renderInsights() {
  const insights = [
    `OKRS BR segue forte na última semana (${fmtMetric(brWeek.okrs, indicatorDefs.find((d) => d.key === "okrs"))}), com produtividade em ${fmtMetric(brWeek.productivity, indicatorDefs.find((d) => d.key === "productivity"))} contra ${fmtMetric(brMonth.productivity, indicatorDefs.find((d) => d.key === "productivity"))} no mês.`,
    `Orders fecharam em ${fmtInt(brWeek.orders)} na semana e ${fmtInt(brMonth.orders)} no mês. A leitura usa Orders Rappi + Orders Zé como total.`,
    `Cancel ficou estável em ${fmtMetric(brWeek.cancel, indicatorDefs.find((d) => d.key === "cancel"))}; DR subiu para ${fmtMetric(brWeek.defect, indicatorDefs.find((d) => d.key === "defect"))}. Prioridade: atacar lojas com DR acima da meta antes de mexer só em escala.`,
    `InStore semanal corrigido para ${fmtMetric(brWeek.inStore, indicatorDefs.find((d) => d.key === "inStore"))}, ponderando o tempo por orders da loja na query semanal.`,
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

function dailyInsight(row) {
  const signals = [];
  if (row.okrs < 85) signals.push("OKRS abaixo de 85");
  if (row.cancel > 0.5) signals.push("cancel acima da meta D-1");
  if (row.defect > 0.78) signals.push("DR acima da meta D-1");
  if (row.stockout > 0.13) signals.push("stockout pressionando");
  if (row.inStore > 2.19) signals.push("InStore acima da meta");
  if (row.productivity < 62.5) signals.push("produtividade abaixo da meta");
  return signals.length ? signals.join(", ") : "sem ofensor crítico no D-1";
}

function findDailyStore(storeName) {
  const normalized = normalizeStore(storeName);
  const aliases = {
    "barra 2": "barra da tijuca 2",
    "barra 3": "barra da tijuca 3",
  };
  const canonical = aliases[normalized] || normalized;
  return (
    dailyStores.find((row) => normalizeStore(row.store) === canonical) ||
    dailyStores.find((row) => normalizeStore(row.store).includes(canonical) || canonical.includes(normalizeStore(row.store))) ||
    dailyStores[0]
  );
}

function detailCell(label, value, sub = "") {
  return `<div>
    <span>${label}</span>
    <strong>${value}</strong>
    ${sub ? `<small>${sub}</small>` : ""}
  </div>`;
}

function renderDailyTable() {
  const head = ["Loja", "Coord.", "Orders", "OKRS", "DR", "Cancel", "SA", "Stockout", "InStore", "Prod.", "Leitura"];
  document.querySelector("#daily-table").innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${[...dailyStores]
      .sort((a, b) => a.okrs - b.okrs || b.orders - a.orders)
      .map(
        (row) => `<tr>
          <td><strong>${storeLink(row.store)}</strong></td>
          <td>${row.coord}</td>
          <td>${fmtInt(row.orders)}</td>
          <td>${status(row.okrs.toFixed(2), "okrs", "%")}</td>
          <td>${status(row.defect.toFixed(2), "defect", "%", "down", 0.78)}</td>
          <td>${status(row.cancel.toFixed(2), "cancel", "%", "down", 0.5)}</td>
          <td>${status(row.availability.toFixed(2), "availability", "%", "up", 99.5)}</td>
          <td>${status(row.stockout.toFixed(2), "stockout", "%", "down", 0.13)}</td>
          <td>${status(row.inStore.toFixed(2), "inStore", "", "down", 2.19)}</td>
          <td>${status(row.productivity.toFixed(2), "prod")}</td>
          <td>${dailyInsight(row)}</td>
        </tr>`,
      )
      .join("")}</tbody>`;
}

function renderDailyStore(storeName) {
  if (!dailyStores.length) return;
  const row = findDailyStore(storeName);
  const ops = dailyOps[row.store];
  const select = document.querySelector("#daily-store-select");
  select.value = row.store;
  document.querySelector("#daily-date-pill").textContent = window.DAILY_DATA?.date ? `D-1 · ${window.DAILY_DATA.date}` : "D-1";
  const kpis = [
    ["Orders", fmtInt(row.orders), `${fmtInt(row.rappi)} Rappi · ${fmtInt(row.ze)} Zé`, "neutral"],
    ["OKRS", `${row.okrs.toFixed(2)}%`, dailyInsight(row), statusClass(row.okrs, "okrs")],
    ["DR", `${row.defect.toFixed(2)}%`, "meta D-1: 0,78%", statusClass(row.defect, "defect", "down", 0.78)],
    ["Cancel", `${row.cancel.toFixed(2)}%`, "meta D-1: 0,50%", statusClass(row.cancel, "cancel", "down", 0.5)],
    ["SA", `${row.availability.toFixed(2)}%`, "meta D-1: 99,50%", statusClass(row.availability, "availability", "up", 99.5)],
    ["Stockout", `${row.stockout.toFixed(2)}%`, "meta D-1: 0,13%", statusClass(row.stockout, "stockout", "down", 0.13)],
    ["InStore", row.inStore.toFixed(2), "meta D-1: 2,19", statusClass(row.inStore, "inStore", "down", 2.19)],
    ["Prod.", row.productivity.toFixed(2), "meta D-1: 62,50", statusClass(row.productivity, "prod")],
  ];
  document.querySelector("#daily-kpis").innerHTML = kpis
    .map(
      ([label, value, sub, tone]) => `<article class="kpi ${tone === "neutral" ? "" : tone}">
        <p class="label">${label}</p>
        <p class="value">${value}</p>
        <p class="sub">${sub}</p>
      </article>`,
    )
    .join("");
  document.querySelector("#daily-store-detail").innerHTML = `
    <div class="detail-band">
      ${detailCell("Coordenador", row.coord)}
      ${detailCell("Prioridade do dia", dailyInsight(row))}
      ${detailCell(
        "Saturação semanal",
        "A aba Saturação veio filtrada por loja no Sheets",
        "Painel pronto para receber a matriz por loja quando o export trouxer WAREHOUSENAME em todas as linhas.",
      )}
    </div>
    <div class="ops-grid">
      ${ops
        ? [
            ["Assign", ops.assign, "min"],
            ["Picking", ops.picking, "min"],
            ["Packing", ops.packing, "min"],
            ["Handoff", ops.handoff, "min"],
            ["InStore", ops.inStore, "min"],
            ["To User", ops.toUser, "min"],
            ["Total", ops.total, "min"],
          ]
            .map(([label, value, suffix]) => detailCell(label, Number(value).toFixed(2), suffix))
            .join("")
        : detailCell("Indicadores D-1", "Sem detalhe operacional no recorte lido", "A loja aparece no OKRS D-1, mas não no bloco operacional lido.")}
    </div>`;
  renderDailySaturation(row.store);
  renderDailyStoreScale(row.store);
  renderDailyPickers(row.store);
}

function pickerScore(row) {
  const orders = Number(row.orders || 0);
  const volumeWeight = 0.5 + 0.5 * Math.min(1, orders / 50);
  const base =
    Number(row.inStore || 0) * 2
    + Number(row.assign || 0) * 0.35
    + Number(row.picking || 0) * 0.35
    + Number(row.packing || 0) * 0.35;
  return base * volumeWeight;
}

function pickerInsight(row) {
  if (row.inStore >= 3) return "InStore alto; observar execução e aderência ao processo.";
  if (row.picking >= 2.4) return "Picking alto; revisar layout, ruptura e familiaridade com loja.";
  if (row.assign >= 1.2) return "Assign alto; checar distribuição/aceite e latência operacional.";
  if (row.packing >= 0.8) return "Packing alto; checar conferência, embalagem e gargalos no fechamento.";
  return "Monitorar na próxima atualização.";
}

function renderDailyPickers(storeName) {
  const table = document.querySelector("#daily-picker-table");
  if (!table) return;
  const store = findDailyStore(storeName);
  const rows = dailyPickers
    .filter((row) => normalizeStore(row.store) === normalizeStore(store.store))
    .sort((a, b) => pickerScore(b) - pickerScore(a) || Number(b.orders || 0) - Number(a.orders || 0))
    .slice(0, 10);
  if (!rows.length) {
    table.innerHTML = `<tbody><tr><td>Sem dados de picker para esta loja no recorte carregado.</td></tr></tbody>`;
    return;
  }
  const head = ["Picker", "Pedidos", "Assign", "Picking", "Packing", "InStore", "Leitura"];
  table.innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (row) => `<tr>
          <td><strong>${row.name}</strong><br><span>${row.keypick}</span></td>
          <td>${fmtInt(row.orders)}</td>
          <td>${Number(row.assign).toFixed(2)}</td>
          <td>${Number(row.picking).toFixed(2)}</td>
          <td>${Number(row.packing).toFixed(2)}</td>
          <td>${status(Number(row.inStore).toFixed(2), "inStore", "", "down", 2.19)}</td>
          <td>${pickerInsight(row)}</td>
        </tr>`,
      )
      .join("")}</tbody>`;
}

function storeRowsFromQuery(storeName) {
  const target = normalizeStore(findDailyStore(storeName).store);
  return scaleQueryRows.filter((row) => normalizeStore(row.WAREHOUSENAME) === target);
}

function renderDailySaturation(storeName) {
  const table = document.querySelector("#daily-saturation-table");
  if (!table) return;
  const rows = storeRowsFromQuery(storeName);
  if (!rows.length) {
    table.innerHTML = `<tbody><tr><td>Sem dados de saturação para esta loja na query horária carregada.</td></tr></tbody>`;
    return;
  }
  const byDay = getQueryDays().map((day) => {
    const dayRows = rows.filter((row) => dateKey(row.DATE) === day.date);
    const ordersByHour = aggregateQueryByHour(dayRows, (row) => Number(row.TOTAL_ORDENES_HISTORICO || row.ORDERS || 0));
    const connectedByHour = aggregateQueryByHour(dayRows, (row) => Number(row.PICKERS_CONECTED || row.PICKERS_CONNECTED || 0));
    const scheduledByHour = aggregateQueryByHour(dayRows, (row) => Number(row.PICKERS_SCHEDULED || 0));
    const neededByHour = ordersByHour.map((orders) => pickerNeed(orders, 0, 3.27, 1));
    const orders = sum(ordersByHour);
    const inStoreNumerator = dayRows.reduce((acc, row) => acc + Number(row.IN_STORE || 0), 0);
    const inStore = orders > 0 ? inStoreNumerator / orders : 0;
    const peak = Math.max(...ordersByHour);
    const peakHour = ordersByHour.indexOf(peak);
    return {
      ...day,
      orders,
      peak,
      peakHour,
      needed: sum(neededByHour),
      scheduled: sum(scheduledByHour),
      connected: sum(connectedByHour),
      delta: sum(connectedByHour) - sum(neededByHour),
      inStore,
    };
  });
  const head = ["Dia", "Orders", "Pico/h", "Need", "Prog.", "Conect.", "Delta", "InStore"];
  table.innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${byDay
      .map(
        (day) => `<tr>
          <td><strong>${day.label}</strong><br><span>${day.date}</span></td>
          <td>${fmtInt(day.orders)}</td>
          <td>${fmtInt(day.peak)} às ${day.peakHour}h</td>
          <td>${fmtInt(day.needed)}</td>
          <td>${fmtInt(day.scheduled)}</td>
          <td>${fmtInt(day.connected)}</td>
          <td>${status(day.delta, "delta")}</td>
          <td>${status(day.inStore.toFixed(2), "inStore", "", "down", 2.19)}</td>
        </tr>`,
      )
      .join("")}</tbody>`;
}

function renderDailyStoreScale(storeName) {
  const table = document.querySelector("#daily-store-scale-table");
  if (!table) return;
  const store = findDailyStore(storeName);
  const days = getQueryDays();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const metrics = [
    ["real", "Orders real"],
    ["needed", "Pickers necessários"],
    ["scheduled", "Pickers programados"],
    ["connected", "Pickers conectados"],
    ["delta", "Delta"],
  ];
  table.innerHTML = `
    <thead>
      <tr><th>Dia</th><th>Métrica</th><th>Total</th>${hours.map((hour) => `<th>${hour}</th>`).join("")}</tr>
    </thead>
    <tbody>${days
      .map((day) => {
        const profile = scaleQueryRows.length
          ? buildStoreHourlyProfileFromQuery(store.store, day.date)
          : buildStoreHourlyProfile({ ...store, plan: 1, real: 1, diff: 0, prod: store.productivity, orders: store.orders, inStore: store.inStore }, day);
        return metrics
          .map(([key, label], index) => {
            const values = profile[key];
            return `<tr>
              ${index === 0 ? `<td class="day-cell" rowspan="${metrics.length}"><strong>${day.label}</strong><span>Dia ${day.date}</span></td>` : ""}
              <td class="metric-cell">${label}</td>
              <td class="total-cell">${fmtInt(sum(values))}</td>
              ${values.map((value) => `<td class="${key === "delta" ? heatClass(value) : ""}">${fmtInt(value)}</td>`).join("")}
            </tr>`;
          })
          .join("");
      })
      .join("")}</tbody>`;
}

function renderDaily() {
  if (!dailyStores.length) return;
  const select = document.querySelector("#daily-store-select");
  select.innerHTML = dailyStores.map((row) => `<option value="${row.store}">${row.store}</option>`).join("");
  select.addEventListener("change", () => {
    history.replaceState(null, "", storeHref(select.value));
    renderDailyStore(select.value);
    document.querySelector("#daily").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  renderDailyTable();
  renderDailyStore(dailyStores[0].store);
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
          <td><strong>${storeLink(r.store)}</strong></td>
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
                  ${index === 0 ? `<td class="day-cell" rowspan="${metrics.length}"><strong>${storeLink(store.store)}</strong><span>${day.label} · ${day.date}</span><span>${store.coord} · InStore ${store.inStore.toFixed(2)}</span></td>` : ""}
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
    const needed = aggregateQueryByHour(rows, (row) => pickerNeed(Number(row.TOTAL_ORDENES_HISTORICO || row.ORDERS || 0), 0, 3.27, 1));
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
  const needed = real.map((orders, hour) => pickerNeed(orders, hour >= 8 && hour <= 21 ? 1 : 0, 3.27, 1));
  const delta = connected.map((value, hour) => value - needed[hour]);
  return { forecast, real, scheduled, connected, needed, delta };
}

function aggregateQueryByHour(rows, mapper) {
  const values = Array.from({ length: 24 }, () => 0);
  rows.forEach((row) => {
    const hour = Number(row.HORA);
    if (Number.isInteger(hour) && hour >= 0 && hour <= 23) values[hour] += Math.round(mapper(row));
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
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
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
  const needed = real.map((orders, hour) => pickerNeed(orders, hour >= 8 && hour <= 21 ? 1 : 0, 3.27, 1));
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
          <td><strong>${storeLink(row.store)}</strong></td>
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
                    <td>${storeLink(row.store)}</td>
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

function pageForHash(hash = window.location.hash) {
  if (hash.startsWith("#daily")) return "daily";
  if (["#br", "#escala", "#coords"].includes(hash)) return "gerencial";
  return "home";
}

function updateActiveNav(page) {
  document.querySelectorAll(".tabs a").forEach((link) => {
    const targetPage = pageForHash(link.getAttribute("href"));
    link.classList.toggle("active", targetPage === page);
  });
}

function handleHashNavigation() {
  const page = pageForHash();
  document.body.dataset.page = page;
  updateActiveNav(page);
  const match = window.location.hash.match(/^#daily-store=(.*)$/);
  if (match) {
    const store = decodeURIComponent(match[1] || "");
    renderDailyStore(store);
    requestAnimationFrame(() => document.querySelector("#daily")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return;
  }
  const section = window.location.hash && document.querySelector(window.location.hash);
  if (section) requestAnimationFrame(() => section.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function latestUpdateStamp() {
  const dates = [window.OKRS_DATA_UPDATED_AT, window.DAILY_DATA_UPDATED_AT, window.SCALE_DATA_UPDATED_AT]
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));
  if (!dates.length) return null;
  return new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString();
}

function init() {
  const updatedAt = latestUpdateStamp();
  document.querySelector("#data-updated-at").textContent = `Última atualização dos dados: ${fmtDateTime(updatedAt)}`;
  document.querySelector("#home-update-card").textContent = `Atualizado em ${fmtDateTime(updatedAt)}`;
  renderMonthKpis();
  renderKpis();
  renderInsights();
  renderCompareTable();
  renderOffenders();
  renderDaily();
  renderScaleTable();
  renderHourlyMatrix();
  renderPickerGapTable();
  renderCoordinatorCards();
  renderCharts();
  handleHashNavigation();
}

window.addEventListener("resize", () => {
  clearTimeout(window.__resizeTimer);
  window.__resizeTimer = setTimeout(renderCharts, 120);
});

window.addEventListener("hashchange", handleHashNavigation);

init();
