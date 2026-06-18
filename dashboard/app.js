const PERIODS = {
  month: "Mês atual",
  week: "Última semana",
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
const connectivityData = window.CONNECTIVITY_DATA || {};
const connectivityCurrentRows = Array.isArray(connectivityData.currentWeekRows) ? connectivityData.currentWeekRows : [];
const connectivityPreviousRows = Array.isArray(connectivityData.previousWeekRows) ? connectivityData.previousWeekRows : [];
const connectivityPickerOffenders = Array.isArray(connectivityData.pickerOffenders) ? connectivityData.pickerOffenders : [];
const connectivityCurrentCutoff = connectivityData.currentWeekCutoff || "";
const hcGapRows = Array.isArray(window.HC_GAP_DATA?.rows) ? window.HC_GAP_DATA.rows : [];
const dailyStores = Array.isArray(window.DAILY_DATA?.stores) ? [...window.DAILY_DATA.stores].sort((a, b) => a.store.localeCompare(b.store)) : [];
const dailyOps = window.DAILY_STORES_TIMES || window.DAILY_OPS || {};
const dailyBrConnectivity = Array.isArray(window.DAILY_BR_CONNECTIVITY) ? window.DAILY_BR_CONNECTIVITY : [];
const dailyPickingCompliance = window.DAILY_PICKING_COMPLIANCE || { br: null, stores: [] };
const dailyServiceHourly = window.DAILY_SERVICE_HOURLY || { goals: { inStore: 2.19, handoff: 5 }, br: null, brHourly: [], stores: [], storeHourly: {} };
const dailyPickers = Array.isArray(window.DAILY_PICKERS) ? window.DAILY_PICKERS : [];
const weeklyInstoreRows = Array.isArray(window.WEEKLY_INSTORE_DATA?.weeks) ? window.WEEKLY_INSTORE_DATA.weeks : [];
const weeklyInstoreGoal = Number(window.WEEKLY_INSTORE_DATA?.goal || 2.57);

if (hcGapRows.length) {
  const gapByStore = new Map(hcGapRows.map((row) => [normalizeStore(row.store), row]));
  allStores.forEach((store) => {
    const gap = gapByStore.get(normalizeStore(store.store));
    if (!gap) return;
    store.plan = num(gap.plan);
    store.real = num(gap.real);
    store.diff = num(gap.diff, store.real - store.plan);
    store.hcSource = window.HC_GAP_DATA?.source || "Follow up HC Preview";
  });
}

if (window.OKRS_DATA?.month?.periodStart && window.OKRS_DATA?.month?.periodEnd) {
  PERIODS.month = `${shortDate(window.OKRS_DATA.month.periodStart)} a ${shortDate(window.OKRS_DATA.month.periodEnd)}`;
}

if (window.OKRS_DATA?.week?.periodStart && window.OKRS_DATA?.week?.periodEnd) {
  PERIODS.week = `${shortDate(window.OKRS_DATA.week.periodStart)} a ${shortDate(window.OKRS_DATA.week.periodEnd)}`;
}

const hourlyCurve = [0.01, 0.01, 0.006, 0.005, 0.004, 0.005, 0.012, 0.025, 0.04, 0.05, 0.055, 0.063, 0.067, 0.067, 0.064, 0.059, 0.062, 0.07, 0.078, 0.09, 0.09, 0.073, 0.045, 0.021];
const shiftCoverage = [0.22, 0.18, 0.14, 0.11, 0.09, 0.12, 0.2, 0.38, 0.56, 0.66, 0.72, 0.76, 0.78, 0.76, 0.77, 0.75, 0.78, 0.84, 0.92, 1, 0.98, 0.88, 0.66, 0.4];
const stores24h = new Set([
  "vila olimpia",
  "moema",
  "santa cecilia",
  "vila prudente",
  "vila madalena",
  "morumbi",
  "botafogo ii",
  "vila mascote",
]);
const SUNDAY_AVAILABLE_RATE = 0.7;
const HELPPI_DAY_COST = 200;
const FIXED_PICKER_MONTH_COST = 5600;
const WEEKS_PER_MONTH = 4;
const MAX_HELPPI_PER_DAY = 3;
const MAX_HELPPI_PER_WEEK = 6;
const shiftBlocks = [
  { key: "mad", label: "Madrugada", start: "22:00", end: "05:20" },
  { key: "dia", label: "AM", start: "06:00", end: "13:20" },
  { key: "noite", label: "PM", start: "14:00", end: "21:20" },
];
const weekDays = [
  { label: "Segunda", date: "04/05/2026", orderShare: 0.18, attendance: 0.89, programFactor: 1.04 },
  { label: "Terça", date: "05/05/2026", orderShare: 0.15, attendance: 0.91, programFactor: 1 },
  { label: "Quarta", date: "06/05/2026", orderShare: 0.16, attendance: 0.93, programFactor: 1.03 },
  { label: "Quinta", date: "07/05/2026", orderShare: 0.16, attendance: 0.9, programFactor: 0.98 },
  { label: "Sexta", date: "08/05/2026", orderShare: 0.18, attendance: 0.87, programFactor: 1.06 },
  { label: "Sábado", date: "09/05/2026", orderShare: 0.11, attendance: 0.82, programFactor: 0.82 },
  { label: "Domingo", date: "10/05/2026", orderShare: 0.06, attendance: 0.78, programFactor: 0.62 },
];

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function fmtInt(value) {
  return new Intl.NumberFormat("pt-BR").format(Math.round(num(value)));
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
  if (def.type === "pct") return `${num(value).toFixed(2)}%`;
  return num(value).toFixed(2);
}

function fixed(value, digits = 2) {
  return num(value).toFixed(digits);
}

function statusClass(value, metric, direction = "up", target = null) {
  value = num(value);
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
  return `<span class="status ${statusClass(value, metric, direction, target)}">${value}${suffix}</span>`;
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
  return `${signal}${fixed(delta)}${def.type === "pct" ? " p.p." : ""} vs mês`;
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
        const deltaLabel = def.type === "int" ? fmtInt(delta) : `${delta > 0 ? "+" : ""}${fixed(delta)}${def.type === "pct" ? " p.p." : ""}`;
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

function shortDate(value) {
  const [year, month, day] = String(value || "").slice(0, 10).split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}`;
}

function weekLabel(row) {
  return `${shortDate(row.weekStart)} a ${shortDate(row.weekEnd)}`;
}

function renderWeeklyInstore() {
  const canvas = document.querySelector("#weekly-instore-chart");
  const table = document.querySelector("#weekly-instore-table");
  if (!canvas || !table) return;
  if (!weeklyInstoreRows.length) {
    table.innerHTML = `<tbody><tr><td>Sem dados das últimas 4 semanas carregados.</td></tr></tbody>`;
    return;
  }
  drawWeeklyInstoreChart(canvas, weeklyInstoreRows);
  const head = ["Semana", "Orders", "Assign", "Picking", "Packing", "InStore total", "Produtividade", "Lojas dentro da meta"];
  table.innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${weeklyInstoreRows
      .map((row) => {
        const inGoalPct = row.storesTotal ? (num(row.storesInGoal) / num(row.storesTotal)) * 100 : 0;
        return `<tr>
          <td><strong>${weekLabel(row)}</strong></td>
          <td>${fmtInt(row.ordersTotal)}</td>
          <td>${fixed(row.assign, 2)}</td>
          <td>${fixed(row.picking, 2)}</td>
          <td>${fixed(row.packing, 2)}</td>
          <td>${status(fixed(row.inStore, 2), "inStore", "", "down", weeklyInstoreGoal)}</td>
          <td>${status(fixed(row.productivity, 1), "prod", "", "up", 69)}</td>
          <td>${fmtInt(row.storesInGoal)} / ${fmtInt(row.storesTotal)} (${fixed(inGoalPct, 1)}%)</td>
        </tr>`;
      })
      .join("")}</tbody>`;
}

function renderBrPickingCompliance() {
  const table = document.querySelector("#br-picking-compliance-table");
  if (!table) return;
  const rows = connectivityPreviousRows.length ? buildComplianceDayRows(connectivityPreviousRows) : [];
  if (!rows.length) {
    table.innerHTML = `<tbody><tr><td>Sem dados de compliance da última semana fechada.</td></tr></tbody>`;
    return;
  }
  const range = `${rows[0].date} a ${rows[rows.length - 1].date}`;
  document.querySelector("#br-picking-compliance-pill").textContent = `Última semana fechada · ${range}`;
  const total = rows.reduce(
    (acc, row) => {
      acc.orders += row.orders;
      acc.needed += row.needed;
      acc.scheduled += row.scheduled;
      acc.compliantSlots += row.compliantSlots;
      acc.totalSlots += row.totalSlots;
      acc.instoreWeighted += row.instoreCompliance * row.orders;
      return acc;
    },
    { orders: 0, needed: 0, scheduled: 0, compliantSlots: 0, totalSlots: 0, instoreWeighted: 0 },
  );
  const head = ["Dia", "Orders", "Pickers necessários", "Pickers escalados", "Picking compliance", "Slots OK", "InStore compliance"];
  const bodyRows = [
    {
      label: "BR semana",
      date: range,
      orders: total.orders,
      needed: total.needed,
      scheduled: total.scheduled,
      compliantSlots: total.compliantSlots,
      totalSlots: total.totalSlots,
      compliance: compliancePct(total.compliantSlots, total.totalSlots),
      instoreCompliance: total.orders ? total.instoreWeighted / total.orders : 0,
    },
    ...rows,
  ];
  table.innerHTML = `
    <thead><tr>${head.map((item) => `<th>${item}</th>`).join("")}</tr></thead>
    <tbody>${bodyRows
      .map(
        (row) => `<tr>
          <td><strong>${row.label}</strong>${row.date ? `<br><span>${row.date}</span>` : ""}</td>
          <td>${fmtInt(row.orders)}</td>
          <td>${fixed(row.needed, 1)}</td>
          <td>${fixed(row.scheduled, 1)}</td>
          <td>${status(`${fixed(row.compliance, 1)}%`, "prod", "", "up", 55)}</td>
          <td>${fmtInt(row.compliantSlots)} / ${fmtInt(row.totalSlots)}</td>
          <td>${status(`${fixed(row.instoreCompliance, 1)}%`, "prod", "", "up", 70)}</td>
        </tr>`,
      )
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
    buritis: "estoril",
    "sagrada familia": "santa efigenia",
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

function queryPickerTotal(row) {
  return num(row.PICKERS_TOTAL_CONNECTED ?? row.PICKERS_IN_NITRO ?? row.PICKERS_CONECTED ?? row.PICKERS_CONNECTED);
}

function queryPickerPicking(row) {
  return num(row.PICKERS_IN_PICKING ?? row.PICKERS_CONECTED ?? row.PICKERS_CONNECTED);
}

function queryPickerRest(row) {
  return num(row.PICKERS_IN_REST);
}

function queryPickerDisconnection(row) {
  return num(row.PICKERS_DISCONNECTION);
}

function queryPickerOther(row) {
  return num(row.PICKERS_IN_OTHER_ACTIVITIES);
}

function queryPickerReception(row) {
  return num(row.PICKERS_IN_RECEPTION);
}

function queryInStoreAvg(row) {
  const orders = num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS);
  return orders > 0 ? num(row.IN_STORE) / orders : 0;
}

function coordinatorForStore(storeName) {
  const normalized = normalizeStore(storeName);
  return (
    allStores.find((row) => normalizeStore(row.store) === normalized)?.coord ||
    dailyStores.find((row) => normalizeStore(row.store) === normalized)?.coord ||
    "Sem coord"
  );
}

function compliancePct(compliant, total) {
  return total > 0 ? (compliant / total) * 100 : 0;
}

function formatHours(value) {
  return fixed(value, 1);
}

function buildComplianceDayRows(rows) {
  return connectivityDays(rows).map((day) => {
    const dayRows = rows.filter((row) => dateKey(row.DATE) === day.date);
    const orders = dayRows.reduce((acc, row) => acc + num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS), 0);
    const needed = dayRows.reduce((acc, row) => acc + num(row.PICKERS_NEEDED), 0);
    const scheduled = dayRows.reduce((acc, row) => acc + num(row.PICKERS_SCHEDULED), 0);
    const activeSlots = dayRows.filter((row) => num(row.PICKERS_NEEDED) > 0);
    const compliantSlots = activeSlots.filter((row) => num(row.PICKERS_SCHEDULED) >= num(row.PICKERS_NEEDED)).length;
    const instoreRows = dayRows.filter((row) => num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS) > 0);
    const instoreCompliantOrders = instoreRows.reduce((acc, row) => {
      const rowOrders = num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS);
      return acc + (queryInStoreAvg(row) <= weeklyInstoreGoal ? rowOrders : 0);
    }, 0);
    return {
      ...day,
      orders,
      needed,
      scheduled,
      compliantSlots,
      totalSlots: activeSlots.length,
      compliance: compliancePct(compliantSlots, activeSlots.length),
      instoreCompliance: compliancePct(instoreCompliantOrders, orders),
    };
  });
}

function buildCoordinatorComplianceRows(rows) {
  const byCoord = new Map();
  rows.forEach((row) => {
    const store = String(row.WAREHOUSENAME || "").trim();
    if (!store || /^inactive/i.test(store)) return;
    const coord = coordinatorForStore(store);
    const current = byCoord.get(coord) || {
      coord,
      stores: new Set(),
      orders: 0,
      needed: 0,
      scheduled: 0,
      compliantSlots: 0,
      totalSlots: 0,
      instoreCompliantOrders: 0,
    };
    current.stores.add(store);
    const orders = num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS);
    const needed = num(row.PICKERS_NEEDED);
    const scheduled = num(row.PICKERS_SCHEDULED);
    current.orders += orders;
    current.needed += needed;
    current.scheduled += scheduled;
    if (needed > 0) {
      current.totalSlots += 1;
      if (scheduled >= needed) current.compliantSlots += 1;
    }
    if (orders > 0 && queryInStoreAvg(row) <= weeklyInstoreGoal) {
      current.instoreCompliantOrders += orders;
    }
    byCoord.set(coord, current);
  });
  return [...byCoord.values()]
    .map((row) => ({
      ...row,
      storesCount: row.stores.size,
      compliance: compliancePct(row.compliantSlots, row.totalSlots),
      instoreCompliance: compliancePct(row.instoreCompliantOrders, row.orders),
    }))
    .sort((a, b) => a.compliance - b.compliance || b.orders - a.orders);
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
          <td>${status(fixed(row.okrs), "okrs", "%")}</td>
          <td>${status(fixed(row.defect), "defect", "%", "down", 0.78)}</td>
          <td>${status(fixed(row.cancel), "cancel", "%", "down", 0.5)}</td>
          <td>${status(fixed(row.availability), "availability", "%", "up", 99.5)}</td>
          <td>${status(fixed(row.stockout), "stockout", "%", "down", 0.13)}</td>
          <td>${status(fixed(row.inStore), "inStore", "", "down", 2.19)}</td>
          <td>${status(fixed(row.productivity), "prod")}</td>
          <td>${dailyInsight(row)}</td>
        </tr>`,
      )
      .join("")}</tbody>`;
}

function aggregateDailyBr() {
  const connectivityOrders = dailyBrConnectivity.reduce((acc, row) => acc + num(row.orders), 0);
  const totals = dailyStores.reduce(
    (acc, row) => {
      acc.rappi += num(row.rappi);
      acc.ze += num(row.ze);
      acc.orders += num(row.orders);
      acc.defect += num(row.defect) * num(row.rappi);
      acc.cancel += num(row.cancel) * num(row.rappi);
      acc.availability += num(row.availability) * num(row.rappi);
      acc.stockout += num(row.stockout) * num(row.rappi);
      acc.inStore += num(row.inStore) * num(row.orders);
      acc.productivity += num(row.productivity) * num(row.orders);
      acc.okrs += num(row.okrs) * num(row.orders);
      return acc;
    },
    { rappi: 0, ze: 0, orders: 0, defect: 0, cancel: 0, availability: 0, stockout: 0, inStore: 0, productivity: 0, okrs: 0 },
  );
  return {
    ...totals,
    orders: Math.max(totals.orders, connectivityOrders),
    ordersFromConnectivity: connectivityOrders,
    defect: totals.rappi ? totals.defect / totals.rappi : 0,
    cancel: totals.rappi ? totals.cancel / totals.rappi : 0,
    availability: totals.rappi ? totals.availability / totals.rappi : 0,
    stockout: totals.rappi ? totals.stockout / totals.rappi : 0,
    inStore: totals.orders ? totals.inStore / totals.orders : 0,
    productivity: totals.orders ? totals.productivity / totals.orders : 0,
    okrs: totals.orders ? totals.okrs / totals.orders : 0,
  };
}

function renderDailyBr() {
  const target = document.querySelector("#daily-br-kpis");
  if (!target || !dailyStores.length) return;
  const br = aggregateDailyBr();
  const ordersSubtext =
    br.ordersFromConnectivity > br.rappi + br.ze
      ? `${fmtInt(br.ordersFromConnectivity)} consolidado hora a hora BR`
      : `${fmtInt(br.rappi)} Rappi · ${fmtInt(br.ze)} Zé`;
  document.querySelector("#daily-br-date-pill").textContent = window.DAILY_DATA?.date ? `D-1 · ${window.DAILY_DATA.date}` : "D-1";
  const kpis = [
    ["Orders", fmtInt(br.orders), ordersSubtext, "neutral"],
    ["OKRS", `${fixed(br.okrs)}%`, "Resultado ponderado por orders", statusClass(br.okrs, "okrs")],
    ["DR", `${fixed(br.defect)}%`, "meta D-1: 0,78%", statusClass(br.defect, "defect", "down", 0.78)],
    ["Cancel", `${fixed(br.cancel)}%`, "meta D-1: 0,50%", statusClass(br.cancel, "cancel", "down", 0.5)],
    ["SA", `${fixed(br.availability)}%`, "meta D-1: 99,50%", statusClass(br.availability, "availability", "up", 99.5)],
    ["Stockout", `${fixed(br.stockout)}%`, "meta D-1: 0,13%", statusClass(br.stockout, "stockout", "down", 0.13)],
    ["InStore", fixed(br.inStore), "meta D-1: 2,19", statusClass(br.inStore, "inStore", "down", 2.19)],
    ["Prod.", fixed(br.productivity), "meta D-1: 62,50", statusClass(br.productivity, "prod")],
  ];
  target.innerHTML = kpis
    .map(([label, value, sub, cls]) => `<article class="kpi ${cls}"><p class="label">${label}</p><p class="value">${value}</p><p class="sub">${sub}</p></article>`)
    .join("");
}

function serviceGoals() {
  return {
    inStore: num(dailyServiceHourly.goals?.inStore || 2.19),
    handoff: num(dailyServiceHourly.goals?.handoff || 5),
  };
}

function serviceRowSignal(row) {
  const goals = serviceGoals();
  const issues = [];
  if (num(row.inStore) > goals.inStore) issues.push(`InStore > ${fixed(goals.inStore)}`);
  if (num(row.handoff) > goals.handoff) issues.push(`Handoff > ${fixed(goals.handoff)}`);
  return issues.length ? issues.join(", ") : "Dentro da referência";
}

function renderDailyServiceCompliance() {
  const target = document.querySelector("#daily-service-compliance-kpis");
  if (!target) return;
  const pill = document.querySelector("#daily-service-compliance-pill");
  if (pill) pill.textContent = window.DAILY_DATA?.date ? `D-1 · ${window.DAILY_DATA.date}` : "D-1";
  const goals = serviceGoals();
  const br = dailyServiceHourly.br || {};
  const brHourly = Array.isArray(dailyServiceHourly.brHourly) ? dailyServiceHourly.brHourly : [];
  const orders = num(br.orders) || brHourly.reduce((acc, row) => acc + num(row.orders), 0);
  const inStoreWeighted = brHourly.reduce((acc, row) => acc + num(row.inStore) * num(row.orders), 0);
  const handoffWeighted = brHourly.reduce((acc, row) => acc + num(row.handoff) * num(row.orders), 0);
  const inStore = orders ? inStoreWeighted / orders : aggregateDailyBr().inStore;
  const handoff = orders ? handoffWeighted / orders : 0;
  const inStoreCompliance = num(br.inStoreCompliance);
  const handoffCompliance = num(br.handoffCompliance);
  const kpis = [
    ["Orders", fmtInt(orders), "Base horária D-1", "neutral"],
    ["InStore médio", fixed(inStore), `Meta: ${fixed(goals.inStore)} min`, statusClass(inStore, "inStore", "down", goals.inStore)],
    ["InStore compliance", `${fixed(inStoreCompliance, 1)}%`, "% de orders em horas dentro da meta", statusClass(inStoreCompliance, "prod", "up", 70)],
    ["Handoff médio", fixed(handoff), `Meta: ${fixed(goals.handoff)} min`, handoff <= goals.handoff ? "green" : "red"],
    ["Handoff compliance", `${fixed(handoffCompliance, 1)}%`, "% de orders em horas dentro da meta", statusClass(handoffCompliance, "prod", "up", 70)],
  ];
  target.innerHTML = kpis
    .map(([label, value, sub, cls]) => `<article class="kpi ${cls === "neutral" ? "" : cls}"><p class="label">${label}</p><p class="value">${value}</p><p class="sub">${sub}</p></article>`)
    .join("");
}

function renderDailyBrHourly() {
  const table = document.querySelector("#daily-br-hourly-table");
  if (!table) return;
  const rows = Array.isArray(dailyServiceHourly.brHourly) ? dailyServiceHourly.brHourly : [];
  if (!rows.length) {
    table.innerHTML = `<tbody><tr><td>Sem dados horários de InStore e Handoff para o D-1.</td></tr></tbody>`;
    return;
  }
  const goals = serviceGoals();
  const head = ["Hora", "Orders", "InStore", "Handoff", "Leitura"];
  table.innerHTML = `
    <thead><tr>${head.map((item) => `<th>${item}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map((row) => `<tr>
        <td><strong>${row.hour}h</strong></td>
        <td>${fmtInt(row.orders)}</td>
        <td>${status(fixed(row.inStore), "inStore", "", "down", goals.inStore)}</td>
        <td>${status(fixed(row.handoff), "handoff", "", "down", goals.handoff)}</td>
        <td>${serviceRowSignal(row)}</td>
      </tr>`)
      .join("")}</tbody>`;
}

function renderDailyStoreComplianceTable() {
  const table = document.querySelector("#daily-store-compliance-table");
  if (!table) return;
  const rows = Array.isArray(dailyServiceHourly.stores) ? dailyServiceHourly.stores : [];
  if (!rows.length) {
    table.innerHTML = `<tbody><tr><td>Sem dados de compliance por loja para o D-1.</td></tr></tbody>`;
    return;
  }
  const goals = serviceGoals();
  const head = ["Loja", "Coord.", "Orders", "InStore", "InStore compliance", "Handoff", "Handoff compliance", "Leitura"];
  table.innerHTML = `
    <thead><tr>${head.map((item) => `<th>${item}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map((row) => {
        const daily = dailyStores.find((store) => normalizeStore(store.store) === normalizeStore(row.store));
        return `<tr>
          <td><strong>${storeLink(row.store)}</strong></td>
          <td>${daily?.coord || "-"}</td>
          <td>${fmtInt(row.orders)}</td>
          <td>${status(fixed(row.inStore), "inStore", "", "down", goals.inStore)}</td>
          <td>${status(`${fixed(row.inStoreCompliance, 1)}%`, "prod", "", "up", 70)}</td>
          <td>${status(fixed(row.handoff), "handoff", "", "down", goals.handoff)}</td>
          <td>${status(`${fixed(row.handoffCompliance, 1)}%`, "prod", "", "up", 70)}</td>
          <td>${serviceRowSignal(row)}</td>
        </tr>`;
      })
      .join("")}</tbody>`;
}

function renderDailyStoreHourly(storeName) {
  const table = document.querySelector("#daily-store-hourly-table");
  if (!table) return;
  const store = findDailyStore(storeName);
  const pill = document.querySelector("#daily-store-hourly-pill");
  if (pill) pill.textContent = `${store.store} · D-1`;
  const rows = dailyServiceHourly.storeHourly?.[store.store] || [];
  if (!rows.length) {
    table.innerHTML = `<tbody><tr><td>Sem dados horários de InStore e Handoff para ${store.store}.</td></tr></tbody>`;
    return;
  }
  const goals = serviceGoals();
  const head = ["Hora", "Orders", "InStore", "Handoff", "Leitura"];
  table.innerHTML = `
    <thead><tr>${head.map((item) => `<th>${item}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map((row) => `<tr>
        <td><strong>${row.hour}h</strong></td>
        <td>${fmtInt(row.orders)}</td>
        <td>${status(fixed(row.inStore), "inStore", "", "down", goals.inStore)}</td>
        <td>${status(fixed(row.handoff), "handoff", "", "down", goals.handoff)}</td>
        <td>${row.orders ? serviceRowSignal(row) : "Sem orders na hora"}</td>
      </tr>`)
      .join("")}</tbody>`;
}

function findServiceStore(storeName) {
  const normalized = normalizeStore(storeName);
  return (Array.isArray(dailyServiceHourly.stores) ? dailyServiceHourly.stores : []).find((row) => normalizeStore(row.store) === normalized);
}

function renderDailyStore(storeName) {
  if (!dailyStores.length) return;
  const row = findDailyStore(storeName);
  const ops = dailyOps[row.store];
  const serviceStore = findServiceStore(row.store);
  const select = document.querySelector("#daily-store-select");
  select.value = row.store;
  document.querySelector("#daily-date-pill").textContent = window.DAILY_DATA?.date ? `D-1 · ${window.DAILY_DATA.date}` : "D-1";
  const kpis = [
    ["Orders", fmtInt(row.orders), `${fmtInt(row.rappi)} Rappi · ${fmtInt(row.ze)} Zé`, "neutral"],
    ["OKRS", `${fixed(row.okrs)}%`, dailyInsight(row), statusClass(row.okrs, "okrs")],
    ["DR", `${fixed(row.defect)}%`, "meta D-1: 0,78%", statusClass(row.defect, "defect", "down", 0.78)],
    ["Cancel", `${fixed(row.cancel)}%`, "meta D-1: 0,50%", statusClass(row.cancel, "cancel", "down", 0.5)],
    ["SA", `${fixed(row.availability)}%`, "meta D-1: 99,50%", statusClass(row.availability, "availability", "up", 99.5)],
    ["Stockout", `${fixed(row.stockout)}%`, "meta D-1: 0,13%", statusClass(row.stockout, "stockout", "down", 0.13)],
    ["InStore", fixed(row.inStore), "meta D-1: 2,19", statusClass(row.inStore, "inStore", "down", 2.19)],
    ["InStore comp.", serviceStore ? `${fixed(serviceStore.inStoreCompliance, 1)}%` : "-", "Orders em horas dentro da meta", serviceStore ? statusClass(serviceStore.inStoreCompliance, "prod", "up", 70) : "amber"],
    ["Handoff comp.", serviceStore ? `${fixed(serviceStore.handoffCompliance, 1)}%` : "-", "Orders em horas dentro da meta", serviceStore ? statusClass(serviceStore.handoffCompliance, "prod", "up", 70) : "amber"],
    ["Prod.", fixed(row.productivity), "meta D-1: 62,50", statusClass(row.productivity, "prod")],
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
        "Conectividade semanal",
        "A leitura de conectividade ficou concentrada na aba nova",
        "Use a aba Conectividade para ver semana atual D+2, semana passada e o recorte por loja.",
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
            .map(([label, value, suffix]) => detailCell(label, num(value).toFixed(2), suffix))
            .join("")
        : detailCell("Indicadores D-1", "Sem detalhe operacional no recorte lido", "A loja aparece no OKRS D-1, mas não no bloco operacional lido.")}
    </div>`;
  renderDailyPickingCompliance(row.store);
  renderDailyStoreHourly(row.store);
  renderDailyPickers(row.store);
}

function pickerScore(row) {
  const orders = num(row.orders);
  const volumeWeight = 0.5 + 0.5 * Math.min(1, orders / 50);
  const base =
    num(row.inStore) * 2
    + num(row.assign) * 0.35
    + num(row.picking) * 0.35
    + num(row.packing) * 0.35;
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
    .sort((a, b) => pickerScore(b) - pickerScore(a) || num(b.orders) - num(a.orders))
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
          <td>${num(row.assign).toFixed(2)}</td>
          <td>${num(row.picking).toFixed(2)}</td>
          <td>${num(row.packing).toFixed(2)}</td>
          <td>${status(num(row.inStore).toFixed(2), "inStore", "", "down", 2.19)}</td>
          <td>${pickerInsight(row)}</td>
        </tr>`,
      )
      .join("")}</tbody>`;
}

function renderDailyPickingCompliance(selectedStoreName = "") {
  const table = document.querySelector("#daily-picking-compliance-table");
  if (!table) return;
  document.querySelector("#daily-picking-compliance-pill").textContent = window.DAILY_DATA?.date ? `D-1 · ${window.DAILY_DATA.date}` : "D-1";
  const storeRows = Array.isArray(dailyPickingCompliance.stores) ? [...dailyPickingCompliance.stores] : [];
  if (!dailyPickingCompliance.br && !storeRows.length) {
    table.innerHTML = `<tbody><tr><td>Sem dados de compliance de picking para o D-1 carregado.</td></tr></tbody>`;
    return;
  }
  const selectedStore = selectedStoreName ? normalizeStore(selectedStoreName) : "";
  const topRows = storeRows
    .sort((a, b) => num(a.compliance) - num(b.compliance) || num(b.orders) - num(a.orders))
    .slice(0, 12);
  const selectedRow = selectedStore ? storeRows.find((row) => normalizeStore(row.store) === selectedStore) : null;
  const dailyInstoreRows = dailyStores.map((row) => ({
    store: row.store,
    orders: num(row.orders),
    compliance: num(row.inStore) <= weeklyInstoreGoal ? 100 : 0,
  }));
  const dailyInstoreBrOrders = dailyInstoreRows.reduce((acc, row) => acc + row.orders, 0);
  const dailyInstoreBrOkOrders = dailyInstoreRows.reduce((acc, row) => acc + (row.compliance >= 100 ? row.orders : 0), 0);
  const dailyInstoreByStore = new Map(dailyInstoreRows.map((row) => [normalizeStore(row.store), row]));
  const displayRows = [
    dailyPickingCompliance.br ? { scope: "BR", ...dailyPickingCompliance.br } : null,
    selectedRow ? { scope: "Loja selecionada", ...selectedRow } : null,
    ...topRows.map((row) => ({ scope: "Loja", ...row })),
  ].filter(Boolean);
  const seen = new Set();
  const uniqueRows = displayRows.filter((row) => {
    const key = `${row.scope}-${normalizeStore(row.store || row.scope)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const head = ["Escopo", "Orders", "Pickers necessários", "Pickers escalados", "Picking compliance", "Slots OK", "InStore compliance"];
  table.innerHTML = `
    <thead><tr>${head.map((item) => `<th>${item}</th>`).join("")}</tr></thead>
    <tbody>${uniqueRows
      .map((row) => {
        const instoreRow = row.scope === "BR"
          ? { compliance: compliancePct(dailyInstoreBrOkOrders, dailyInstoreBrOrders) }
          : dailyInstoreByStore.get(normalizeStore(row.store));
        return `<tr>
          <td><strong>${row.scope === "Loja" ? row.store : row.scope}</strong>${row.scope === "Loja selecionada" && row.store ? `<br><span>${row.store}</span>` : ""}</td>
          <td>${fmtInt(row.orders)}</td>
          <td>${fixed(row.needed, 1)}</td>
          <td>${fixed(row.scheduled, 1)}</td>
          <td>${status(`${fixed(row.compliance, 1)}%`, "prod", "", "up", 55)}</td>
          <td>${fmtInt(row.compliantSlots)} / ${fmtInt(row.totalSlots)}</td>
          <td>${status(`${fixed(instoreRow?.compliance || 0, 1)}%`, "prod", "", "up", 70)}</td>
        </tr>`;
      })
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
    const ordersByHour = aggregateQueryByHour(dayRows, (row) => num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS));
    const totalByHour = aggregateQueryByHour(dayRows, queryPickerTotal);
    const pickingByHour = aggregateQueryByHour(dayRows, queryPickerPicking);
    const restByHour = aggregateQueryByHour(dayRows, queryPickerRest);
    const disconnectionByHour = aggregateQueryByHour(dayRows, queryPickerDisconnection);
    const otherByHour = aggregateQueryByHour(dayRows, queryPickerOther);
    const scheduledByHour = aggregateQueryByHour(dayRows, (row) => num(row.PICKERS_SCHEDULED));
    const neededByHour = ordersByHour.map((orders) => pickerNeed(orders, 0, 3, 1));
    const orders = sum(ordersByHour);
    const inStoreNumerator = dayRows.reduce((acc, row) => acc + num(row.IN_STORE), 0);
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
      totalConnected: sum(totalByHour),
      inPicking: sum(pickingByHour),
      inRest: sum(restByHour),
      disconnection: sum(disconnectionByHour),
      otherActivities: sum(otherByHour),
      delta: sum(pickingByHour) - sum(neededByHour),
      inStore,
    };
  });
  const head = ["Dia", "Orders", "Pico/h", "Need", "Prog.", "No Nitro", "In picking", "In rest", "Disconnection", "Other + reception", "Delta", "InStore"];
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
          <td>${fmtInt(day.totalConnected)}</td>
          <td>${fmtInt(day.inPicking)}</td>
          <td>${fmtInt(day.inRest)}</td>
          <td>${fmtInt(day.disconnection)}</td>
          <td>${fmtInt(day.otherActivities)}</td>
          <td>${status(day.delta, "delta")}</td>
          <td>${status(fixed(day.inStore), "inStore", "", "down", 2.19)}</td>
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
    ["active", "Pickers no Nitro"],
    ["picking", "Pickers in picking"],
    ["rest", "Pickers in rest"],
    ["disconnected", "Pickers disconnection"],
    ["other", "Pickers other + reception"],
    ["delta", "Delta"],
  ];
  const colgroup = `<colgroup><col class="day-col"><col class="metric-col"><col class="total-col">${hours.map(() => `<col class="hour-col">`).join("")}</colgroup>`;
  table.innerHTML = `
    ${colgroup}
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
  renderDailyBr();
  renderDailyServiceCompliance();
  renderDailyBrHourly();
  renderDailyStoreComplianceTable();
  renderDailyPickingCompliance(dailyStores[0].store);
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
          <td>${status(fixed(r.okrsMonth), "okrs", "%")}</td>
          <td>${status(fixed(r.okrsWeek), "okrs", "%")}</td>
          <td>${status(fixed(r.prod), "prod")}</td>
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
    ["active", "Pickers no Nitro"],
    ["picking", "Pickers in picking"],
    ["rest", "Pickers in rest"],
    ["disconnected", "Pickers disconnection"],
    ["other", "Pickers other + reception"],
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
                  ${index === 0 ? `<td class="day-cell" rowspan="${metrics.length}"><strong>${storeLink(store.store)}</strong><span>${day.label} · ${day.date}</span><span>${store.coord} · InStore ${fixed(store.inStore)}</span></td>` : ""}
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
  const active = sumProfiles(profiles, "active");
  const picking = sumProfiles(profiles, "picking");
  const rest = sumProfiles(profiles, "rest");
  const disconnected = sumProfiles(profiles, "disconnected");
  const other = sumProfiles(profiles, "other");
  const needed = sumProfiles(profiles, "needed");
  const delta = picking.map((value, hour) => value - needed[hour]);
  return { ...day, forecast, real, scheduled, active, picking, rest, disconnected, other, connected: picking, needed, delta };
  });
}

function buildHourlyRowsFromQuery() {
  return getQueryDays().map((day) => {
    const rows = scaleQueryRows.filter((row) => dateKey(row.DATE) === day.date);
    const forecast = aggregateQueryByHour(rows, (row) => num(row.ORDENES_PRONOSTICADAS_HORA));
    const real = aggregateQueryByHour(rows, (row) => num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS));
    const scheduled = aggregateQueryByHour(rows, (row) => num(row.PICKERS_SCHEDULED));
    const active = aggregateQueryByHour(rows, queryPickerTotal);
    const picking = aggregateQueryByHour(rows, queryPickerPicking);
    const rest = aggregateQueryByHour(rows, queryPickerRest);
    const disconnected = aggregateQueryByHour(rows, queryPickerDisconnection);
    const other = aggregateQueryByHour(rows, queryPickerOther);
    const needed = aggregateQueryByHour(rows, (row) => pickerNeed(num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS), 0, 3, 1));
    const delta = picking.map((value, hour) => value - needed[hour]);
    return { ...day, forecast, real, scheduled, active, picking, rest, disconnected, other, connected: picking, needed, delta };
  });
}

function buildStoreHourlyProfileFromQuery(storeName, date) {
  const rows = scaleQueryRows.filter((row) => normalizeStore(row.WAREHOUSENAME) === normalizeStore(storeName) && dateKey(row.DATE) === date);
  const forecast = aggregateQueryByHour(rows, (row) => num(row.ORDENES_PRONOSTICADAS_HORA));
  const real = aggregateQueryByHour(rows, (row) => num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS));
  const scheduled = aggregateQueryByHour(rows, (row) => num(row.PICKERS_SCHEDULED));
  const active = aggregateQueryByHour(rows, queryPickerTotal);
  const picking = aggregateQueryByHour(rows, queryPickerPicking);
  const rest = aggregateQueryByHour(rows, queryPickerRest);
  const disconnected = aggregateQueryByHour(rows, queryPickerDisconnection);
  const other = aggregateQueryByHour(rows, queryPickerOther);
  const needed = real.map((orders, hour) => pickerNeed(orders, hour >= 8 && hour <= 21 ? 1 : 0, 3, 1));
  const delta = picking.map((value, hour) => value - needed[hour]);
  return { forecast, real, scheduled, active, picking, rest, disconnected, other, connected: picking, needed, delta };
}

function aggregateQueryByHour(rows, mapper) {
  const values = Array.from({ length: 24 }, () => 0);
  rows.forEach((row) => {
    const hour = num(row.HORA, -1);
    const value = num(mapper(row));
    if (Number.isInteger(hour) && hour >= 0 && hour <= 23) values[hour] += value;
  });
  return values;
}

function getQueryDays() {
  if (!scaleQueryRows.length) return weekDays;
  const dates = [...new Set(scaleQueryRows.map((row) => dateKey(row.DATE)).filter(Boolean))].sort();
  return dates.map((date) => ({ label: weekdayPt(date), date }));
}

function connectivityDays(rows) {
  const dates = [...new Set(rows.map((row) => dateKey(row.DATE)).filter(Boolean))].sort();
  return dates.map((date) => ({ label: weekdayPt(date), date }));
}

function connectivityStoreOptions() {
  const stores = [...new Set([...connectivityCurrentRows, ...connectivityPreviousRows]
    .map((row) => String(row.WAREHOUSENAME || "").trim())
    .filter((store) => store && !/^inactive/i.test(store)))];
  return stores.sort((a, b) => a.localeCompare(b));
}

function buildConnectivityProfile(rows) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const forecast = aggregateQueryByHour(rows, (row) => num(row.ORDENES_PRONOSTICADAS_HORA));
  const real = aggregateQueryByHour(rows, (row) => num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS));
  const scheduled = aggregateQueryByHour(rows, (row) => num(row.PICKERS_SCHEDULED));
  const active = aggregateQueryByHour(rows, queryPickerTotal);
  const picking = aggregateQueryByHour(rows, queryPickerPicking);
  const rest = aggregateQueryByHour(rows, queryPickerRest);
  const disconnected = aggregateQueryByHour(rows, queryPickerDisconnection);
  const reception = aggregateQueryByHour(rows, queryPickerReception);
  const other = aggregateQueryByHour(rows, queryPickerOther);
  const needed = real.map((orders) => pickerNeed(orders, 0, 3, 1));
  const delta = picking.map((value, hour) => value - needed[hour]);
  const instoreNumerator = aggregateQueryByHour(rows, (row) => num(row.IN_STORE));
  const instore = hours.map((hour) => {
    const orders = real[hour];
    return orders > 0 ? instoreNumerator[hour] / orders : 0;
  });
  return { forecast, real, needed, scheduled, active, picking, rest, disconnected, reception, other, delta, instore };
}

function formatConnectivityMetric(key, value) {
  if (key === "instore") return fixed(value);
  if (["forecast", "real", "needed", "scheduled"].includes(key)) return fmtInt(value);
  return fixed(value, 1);
}

function renderConnectivityMatrix(tableId, rows) {
  const table = document.querySelector(tableId);
  if (!table) return;
  const days = connectivityDays(rows);
  if (!days.length) {
    table.innerHTML = `<tbody><tr><td>Sem dados disponíveis para este recorte.</td></tr></tbody>`;
    return;
  }
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const metrics = [
    ["forecast", "Forecast orders"],
    ["real", "Orders real"],
    ["needed", "Pickers necessários"],
    ["scheduled", "Pickers programados"],
    ["active", "Pickers no Nitro"],
    ["picking", "Pickers in picking"],
    ["rest", "Pickers in rest"],
    ["disconnected", "Pickers disconnection"],
    ["reception", "Pickers in reception"],
    ["other", "Pickers other activities"],
    ["delta", "Delta BR"],
    ["instore", "InStore médio"],
  ];
  const colgroup = `<colgroup><col class="day-col"><col class="metric-col"><col class="total-col">${hours.map(() => `<col class="hour-col">`).join("")}</colgroup>`;
  table.innerHTML = `
    ${colgroup}
    <thead>
      <tr><th>Dia</th><th>Métrica</th><th>Total</th>${hours.map((hour) => `<th>${hour}</th>`).join("")}</tr>
    </thead>
    <tbody>${days
      .map((day) => {
        const profile = buildConnectivityProfile(rows.filter((row) => dateKey(row.DATE) === day.date));
        return metrics
          .map(([key, label], index) => {
            const values = profile[key];
            const total =
              key === "instore"
                ? fixed(sum(profile.real) > 0 ? profile.instore.reduce((acc, value, hour) => acc + value * profile.real[hour], 0) / sum(profile.real) : 0)
                : formatConnectivityMetric(key, sum(values));
            return `<tr>
              ${index === 0 ? `<td class="day-cell" rowspan="${metrics.length}"><strong>${day.label}</strong><span>Dia ${day.date}</span></td>` : ""}
              <td class="metric-cell">${label}</td>
              <td class="total-cell">${total}</td>
              ${values.map((value) => `<td class="${key === "delta" ? heatClass(value) : ""}">${formatConnectivityMetric(key, value)}</td>`).join("")}
            </tr>`;
          })
          .join("");
      })
      .join("")}</tbody>`;
}

function renderConnectivityPickerOffenders() {
  const table = document.querySelector("#connectivity-picker-offenders-table");
  if (!table) return;
  if (!connectivityPickerOffenders.length) {
    table.innerHTML = `<tbody><tr><td>Sem ofensores elegíveis na semana atual carregada.</td></tr></tbody>`;
    return;
  }
  const head = ["Loja", "Picker", "Dias", "Horas conectadas", "Horas em picking", "Horas em rest", "Horas em reception", "Horas em others", "Horas desconectado", "% picking"];
  const rows = [...connectivityPickerOffenders]
    .filter((row) => num(row.ACTIVE_DAYS) > 4)
    .sort((a, b) => num(a.PICKING_SHARE, 999) - num(b.PICKING_SHARE, 999) || num(b.ACTIVE_HOURS) - num(a.ACTIVE_HOURS))
    .slice(0, 20);
  table.innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (row) => `<tr>
          <td><strong>${row.WAREHOUSENAME || "Sem loja"}</strong></td>
          <td>${row.KEYPICKER}</td>
          <td>${fmtInt(row.ACTIVE_DAYS)}</td>
          <td>${fixed(num(row.ACTIVE_HOURS), 1)}</td>
          <td>${fixed(num(row.PICKING_HOURS), 1)}</td>
          <td>${fixed(num(row.REST_HOURS), 1)}</td>
          <td>${fixed(num(row.RECEPTION_HOURS), 1)}</td>
          <td>${fixed(num(row.OTHER_HOURS), 1)}</td>
          <td>${fixed(num(row.DISCONNECTED_HOURS), 1)}</td>
          <td>${status(`${fixed(num(row.PICKING_SHARE), 1)}%`, "prod", "", "up", 50)}</td>
        </tr>`,
      )
      .join("")}</tbody>`;
}

function renderConnectivityStoreTable(tableId, rows, storeName) {
  const table = document.querySelector(tableId);
  if (!table) return;
  const storeRows = rows.filter((row) => normalizeStore(row.WAREHOUSENAME) === normalizeStore(storeName));
  const days = connectivityDays(storeRows);
  if (!days.length) {
    table.innerHTML = `<tbody><tr><td>Sem dados para ${storeName} neste recorte.</td></tr></tbody>`;
    return;
  }
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const metrics = [
    ["real", "Orders real"],
    ["needed", "Pickers necessários"],
    ["scheduled", "Pickers programados"],
    ["active", "Pickers no Nitro"],
    ["picking", "Pickers in picking"],
    ["rest", "Pickers in rest"],
    ["disconnected", "Pickers disconnection"],
    ["reception", "Pickers in reception"],
    ["other", "Pickers other activities"],
    ["delta", "Delta loja"],
    ["instore", "InStore médio"],
  ];
  table.innerHTML = `
    <thead>
      <tr><th>Dia</th><th>Métrica</th><th>Total</th>${hours.map((hour) => `<th>${hour}</th>`).join("")}</tr>
    </thead>
    <tbody>${days
      .map((day) => {
        const profile = buildConnectivityProfile(storeRows.filter((row) => dateKey(row.DATE) === day.date));
        return metrics
          .map(([key, label], index) => {
            const values = profile[key];
            const total =
              key === "instore"
                ? fixed(sum(profile.real) > 0 ? profile.instore.reduce((acc, value, hour) => acc + value * profile.real[hour], 0) / sum(profile.real) : 0)
                : formatConnectivityMetric(key, sum(values));
            return `<tr>
              ${index === 0 ? `<td class="day-cell" rowspan="${metrics.length}"><strong>${day.label}</strong><span>${storeName} · ${day.date}</span></td>` : ""}
              <td class="metric-cell">${label}</td>
              <td class="total-cell">${total}</td>
              ${values.map((value) => `<td class="${key === "delta" ? heatClass(value) : ""}">${formatConnectivityMetric(key, value)}</td>`).join("")}
            </tr>`;
          })
          .join("");
      })
      .join("")}</tbody>`;
}

function renderConnectivityStores() {
  const select = document.querySelector("#connectivity-store-filter");
  if (!select) return;
  const stores = connectivityStoreOptions();
  if (!stores.length) {
    select.innerHTML = "";
    renderConnectivityStoreTable("#connectivity-store-current-table", [], "");
    renderConnectivityStoreTable("#connectivity-store-previous-table", [], "");
    return;
  }
  if (!select.options.length) {
    select.innerHTML = stores.map((store) => `<option value="${store}">${store}</option>`).join("");
    select.addEventListener("change", () => {
      renderConnectivityStoreTable("#connectivity-store-current-table", connectivityCurrentRows, select.value);
      renderConnectivityStoreTable("#connectivity-store-previous-table", connectivityPreviousRows, select.value);
    });
  }
  const storeName = select.value || stores[0];
  select.value = storeName;
  renderConnectivityStoreTable("#connectivity-store-current-table", connectivityCurrentRows, storeName);
  renderConnectivityStoreTable("#connectivity-store-previous-table", connectivityPreviousRows, storeName);
}

function renderConnectivity() {
  if (connectivityCurrentCutoff) {
    document.querySelector("#connectivity-current-pill").textContent = `Semana atual · D+2 até ${connectivityCurrentCutoff}`;
    document.querySelector("#connectivity-store-current-pill").textContent = `D+2 até ${connectivityCurrentCutoff}`;
  }
  renderConnectivityMatrix("#connectivity-current-table", connectivityCurrentRows);
  renderConnectivityMatrix("#connectivity-previous-table", connectivityPreviousRows);
  renderConnectivityPickerOffenders();
  renderConnectivityStores();
}

function topInStoreStoresFromQuery() {
  const byStore = new Map();
  scaleQueryRows.forEach((row) => {
    const store = String(row.WAREHOUSENAME || "Sem loja").trim();
    const current = byStore.get(store) || { store, coord: "Query", inStoreNumerator: 0, orders: 0, plan: 0, real: 0, diff: 0, prod: 0, inStore: 0 };
    const orders = num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS);
    current.inStoreNumerator += num(row.IN_STORE);
    current.orders += orders;
    current.plan += num(row.PICKERS_SCHEDULED);
    current.real += queryPickerPicking(row);
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
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  const aliases = {
    buritis: "estoril",
    "sagrada familia": "santa efigenia",
  };
  return aliases[normalized] || normalized;
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
  const zeros = Array.from({ length: 24 }, () => 0);
  return { forecast, real, scheduled, active: connected, picking: connected, rest: zeros, disconnected: zeros, other: zeros, connected, needed, delta };
}

function sumProfiles(profiles, key) {
  return Array.from({ length: 24 }, (_, hour) => profiles.reduce((acc, profile) => acc + profile[key][hour], 0));
}

function sum(values) {
  return values.reduce((acc, item) => acc + num(item), 0);
}

function heatClass(value) {
  value = num(value);
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
    ["active", "Pickers no Nitro"],
    ["picking", "Pickers in picking"],
    ["rest", "Pickers in rest"],
    ["disconnected", "Pickers disconnection"],
    ["other", "Pickers other + reception"],
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

function buildConnectedByDayRows() {
  return buildHourlyRows().map((day) => {
    const active = day.active || Array.from({ length: 24 }, () => 0);
    const picking = day.picking || day.connected || Array.from({ length: 24 }, () => 0);
    const rest = day.rest || Array.from({ length: 24 }, () => 0);
    const disconnected = day.disconnected || Array.from({ length: 24 }, () => 0);
    const other = day.other || Array.from({ length: 24 }, () => 0);
    const scheduled = day.scheduled || Array.from({ length: 24 }, () => 0);
    const needed = day.needed || Array.from({ length: 24 }, () => 0);
    const orders = day.real || Array.from({ length: 24 }, () => 0);
    const totalActive = sum(active);
    const totalPicking = sum(picking);
    const totalRest = sum(rest);
    const totalDisconnected = sum(disconnected);
    const totalOther = sum(other);
    const totalScheduled = sum(scheduled);
    const totalNeeded = sum(needed);
    const totalOrders = sum(orders);
    const activeHours = active.filter((value, hour) => value > 0 || orders[hour] > 0 || scheduled[hour] > 0).length || 24;
    const peakPicking = Math.max(...picking, 0);
    const peakHour = picking.indexOf(peakPicking);
    return {
      ...day,
      totalActive,
      totalPicking,
      totalRest,
      totalDisconnected,
      totalOther,
      totalScheduled,
      totalNeeded,
      totalOrders,
      avgPicking: totalPicking / activeHours,
      peakPicking,
      peakHour,
      delta: totalPicking - totalNeeded,
      adherence: totalScheduled ? (totalPicking / totalScheduled) * 100 : 0,
    };
  });
}

function renderConnectedByDayTable() {
  const table = document.querySelector("#connected-by-day-table");
  if (!table) return;
  const rows = buildConnectedByDayRows();
  const head = ["Dia", "Orders", "No Nitro", "In picking", "In rest", "Disconnection", "Other + reception", "Média picking/h", "Pico picking", "Hora pico", "Programados", "Need", "Delta", "Aderência"];
  table.innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (row) => `<tr>
          <td><strong>${row.label}</strong><br><span>${row.date}</span></td>
          <td>${fmtInt(row.totalOrders)}</td>
          <td>${fmtInt(row.totalActive)}</td>
          <td>${fmtInt(row.totalPicking)}</td>
          <td>${fmtInt(row.totalRest)}</td>
          <td>${fmtInt(row.totalDisconnected)}</td>
          <td>${fmtInt(row.totalOther)}</td>
          <td>${fixed(row.avgPicking, 1)}</td>
          <td>${fmtInt(row.peakPicking)}</td>
          <td>${row.peakHour}h</td>
          <td>${fmtInt(row.totalScheduled)}</td>
          <td>${fmtInt(row.totalNeeded)}</td>
          <td>${status(row.delta, "delta")}</td>
          <td>${fixed(row.adherence, 1)}%</td>
        </tr>`,
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
          <td>${status(fixed(row.prod, 1), "prod")}</td>
          <td>${status(fixed(row.inStore), "inStore", "", "down", 2.65)}</td>
          <td>${insightForStore(row)}</td>
        </tr>`,
      )
      .join("")}</tbody>`;
}

function storeScaleRows(storeName) {
  const target = normalizeStore(storeName);
  return scaleQueryRows.filter((row) => normalizeStore(row.WAREHOUSENAME) === target);
}

function shiftForHour(hour) {
  if (hour >= 22 || hour <= 5) return "mad";
  if (hour >= 6 && hour <= 13) return "dia";
  return "noite";
}

function activeNeedForDay(shifts, is24h) {
  const nightNeed = is24h ? Math.min(Math.max(num(shifts.mad), 3), 4) : 0;
  const amNeed = Math.max(num(shifts.dia), 3);
  const pmNeed = Math.max(num(shifts.noite), 3);
  const peak = Math.max(amNeed, pmNeed);
  const intermediates = Math.min(2, Math.max(0, peak - 8));
  const amBase = Math.max(3, amNeed - intermediates);
  const pmBase = Math.max(3, pmNeed - intermediates);
  return {
    activeNeed: nightNeed + amBase + pmBase + intermediates,
    nightNeed,
    amBase,
    pmBase,
    intermediates,
  };
}

function availableFixedByDay(fixedHc, date) {
  const day = weekdayPt(date);
  const availability = day === "Domingo" ? SUNDAY_AVAILABLE_RATE : day === "Sábado" ? 1 : 0.8;
  return Math.floor(num(fixedHc) * availability);
}

function fixedCoverageForDay(fixedHc, day, is24h) {
  const available = availableFixedByDay(fixedHc, day.date);
  const nightTarget = is24h ? Math.min(Math.max(num(day.shifts.mad), 3), 4) : 0;
  const nightFixed = Math.min(nightTarget, available);
  let remaining = Math.max(0, available - nightFixed);
  const intermediates = Math.min(2, Math.max(0, remaining - 6));
  remaining -= intermediates;
  let amBase = Math.min(Math.max(3, Math.floor(remaining / 2)), remaining);
  let pmBase = Math.max(0, remaining - amBase);
  if (num(day.shifts.noite) > num(day.shifts.dia) && amBase > 3) {
    amBase -= 1;
    pmBase += 1;
  }
  const amCoverage = amBase + intermediates;
  const pmCoverage = pmBase + intermediates;
  const amGap = Math.max(0, num(day.shifts.dia) - amCoverage);
  const pmGap = Math.max(0, num(day.shifts.noite) - pmCoverage);
  const nightGap = Math.max(0, nightTarget - nightFixed);
  const helppi = Math.max(amGap, pmGap) + nightGap;
  return { ...day, fixedAvailable: available, nightFixed, amBase, pmBase, intermediates, amCoverage, pmCoverage, helppi };
}

function helppiWindowsForDay(day, helppiTotal = Infinity) {
  const windows = [];
  let remaining = helppiTotal;
  if (day.intermediates > 0) windows.push({ window: "10:40-18:00", amount: day.intermediates });
  const uncoveredAm = Math.max(0, day.shifts.dia - (day.amBase + day.intermediates));
  const uncoveredPm = Math.max(0, day.shifts.noite - (day.pmBase + day.intermediates));
  if (uncoveredAm > 0) windows.push({ window: "06:00-13:20", amount: uncoveredAm });
  if (uncoveredPm > 0) windows.push({ window: "14:00-21:20", amount: uncoveredPm });
  return windows
    .map((item) => {
      const amount = Math.min(item.amount, remaining);
      remaining -= amount;
      return { ...item, amount };
    })
    .filter((item) => item.amount > 0);
}

function optimizeFixedAndHelppi(shiftNeeds, minimum) {
  const is24h = shiftNeeds.some((day) => day.nightNeed > 0);
  const maxNeed = Math.max(minimum, ...shiftNeeds.map((day) => Math.ceil((day.nightNeed + day.shifts.dia + day.shifts.noite) / (weekdayPt(day.date) === "Domingo" ? SUNDAY_AVAILABLE_RATE : 0.8))));
  let best = null;
  for (let fixed = minimum; fixed <= maxNeed + 8; fixed += 1) {
    const helppiByDay = shiftNeeds.map((day) => fixedCoverageForDay(fixed, day, is24h));
    const weeklyHelppi = sum(helppiByDay.map((day) => day.helppi));
    const feasibleHelppi = weeklyHelppi <= MAX_HELPPI_PER_WEEK && helppiByDay.every((day) => day.helppi <= MAX_HELPPI_PER_DAY);
    if (!feasibleHelppi) continue;
    const monthlyHelppiCost = weeklyHelppi * WEEKS_PER_MONTH * HELPPI_DAY_COST;
    const fixedCost = fixed * FIXED_PICKER_MONTH_COST;
    const totalCost = fixedCost + monthlyHelppiCost;
    if (!best || totalCost < best.totalCost || (totalCost === best.totalCost && weeklyHelppi < best.weeklyHelppi)) {
      best = { fixed, helppiByDay, weeklyHelppi, monthlyHelppiCost, fixedCost, totalCost };
    }
  }
  return best || {
    fixed: maxNeed,
    helppiByDay: shiftNeeds.map((day) => fixedCoverageForDay(maxNeed, day, is24h)),
    weeklyHelppi: 0,
    monthlyHelppiCost: 0,
    fixedCost: maxNeed * FIXED_PICKER_MONTH_COST,
    totalCost: maxNeed * FIXED_PICKER_MONTH_COST,
  };
}

function hcNeedForStore(storeName) {
  const rows = storeScaleRows(storeName);
  const is24h = stores24h.has(normalizeStore(storeName));
  const bySlot = new Map();
  rows.forEach((row) => {
    const date = dateKey(row.DATE);
    const key = `${date}-${num(row.HORA, -1)}`;
    if (!bySlot.has(key)) bySlot.set(key, { date, orders: 0, connected: 0, hour: num(row.HORA, -1) });
    const slot = bySlot.get(key);
    slot.orders += num(row.TOTAL_ORDENES_HISTORICO || row.ORDERS);
    slot.connected += queryPickerPicking(row);
  });
  let neededHours = 0;
  let connectedHours = 0;
  const dayShifts = new Map();
  bySlot.forEach((slot) => {
    let need = pickerNeed(slot.orders, slot.hour >= 8 && slot.hour <= 21 ? 1 : 0, 3, 1);
    if (slot.orders > 0) need = Math.max(3, need);
    if (is24h && slot.hour >= 0 && slot.hour <= 5) need = Math.max(3, need);
    neededHours += need;
    connectedHours += slot.connected;
    const shift = shiftForHour(slot.hour);
    if (!dayShifts.has(slot.date)) dayShifts.set(slot.date, { mad: 0, dia: 0, noite: 0, connectedMad: 0, connectedDia: 0, connectedNoite: 0 });
    const current = dayShifts.get(slot.date);
    current[shift] = Math.max(current[shift], need);
    const connectedKey = `connected${shift.charAt(0).toUpperCase()}${shift.slice(1)}`;
    current[connectedKey] = Math.max(current[connectedKey], slot.connected);
  });
  const shiftNeeds = [...dayShifts.entries()].map(([date, shifts]) => {
    const active = activeNeedForDay(shifts, is24h);
    return {
      date,
      shifts,
      ...active,
      total: active.activeNeed,
      connectedTotal: shifts.connectedMad + shifts.connectedDia + shifts.connectedNoite,
    };
  });
  const weeklyShiftNeed = Math.max(...shiftNeeds.map((day) => day.total), 0);
  const sundayShiftNeed = Math.max(...shiftNeeds.filter((day) => weekdayPt(day.date) === "Domingo").map((day) => day.total), 0);
  const weekdayNeed = Math.max(...shiftNeeds.filter((day) => weekdayPt(day.date) !== "Domingo").map((day) => day.total), 0);
  const hcFrom6x1 = Math.ceil(weekdayNeed / (6 / 7));
  const hcForSunday = Math.ceil(sundayShiftNeed / SUNDAY_AVAILABLE_RATE);
  const minimum = is24h ? 11 : 7;
  const baseHcNeeded = Math.max(minimum, hcFrom6x1, hcForSunday);
  const optimized = optimizeFixedAndHelppi(shiftNeeds, minimum);
  const hcNeeded = optimized.fixed;
  return {
    neededHours,
    connectedHours,
    weeklyShiftNeed,
    sundayShiftNeed,
    shiftNeeds,
    baseHcNeeded,
    fixedHcNeeded: hcNeeded,
    hcNeeded,
    helppiByDay: optimized.helppiByDay,
    weeklyHelppi: optimized.weeklyHelppi,
    monthlyHelppiCost: optimized.monthlyHelppiCost,
    fixedCost: optimized.fixedCost,
    optimizedCost: optimized.totalCost,
    pickerDeltaHours: connectedHours - neededHours,
    is24h,
  };
}

function pearson(rows, xKey, yKey) {
  const data = rows.map((row) => [num(row[xKey]), num(row[yKey])]);
  const n = data.length;
  if (n < 2) return 0;
  const avgX = data.reduce((acc, item) => acc + item[0], 0) / n;
  const avgY = data.reduce((acc, item) => acc + item[1], 0) / n;
  const numerator = data.reduce((acc, item) => acc + (item[0] - avgX) * (item[1] - avgY), 0);
  const denomX = Math.sqrt(data.reduce((acc, item) => acc + (item[0] - avgX) ** 2, 0));
  const denomY = Math.sqrt(data.reduce((acc, item) => acc + (item[1] - avgY) ** 2, 0));
  return denomX && denomY ? numerator / (denomX * denomY) : 0;
}

function buildHcAdjustmentRows() {
  return allStores
    .map((store) => {
      const need = hcNeedForStore(store.store);
      const gapCovered = store.plan >= need.hcNeeded;
      const currentGap = need.hcNeeded - store.real;
      const planGap = need.hcNeeded - store.plan;
      let action = "Manter e monitorar curva horária.";
      if (currentGap > 0 && gapCovered) action = `Cobrir gap atual: recompor ${fmtInt(currentGap)} picker(s) até o plano.`;
      if (currentGap > 0 && !gapCovered) action = `Abrir ask base de ${fmtInt(planGap)} acima do plano e recompor ${fmtInt(Math.max(0, store.plan - store.real))} vaga(s).`;
      if (store.plan - need.hcNeeded >= 2) action = `Plano acima do HC fixo mínimo em ${fmtInt(store.plan - need.hcNeeded)} picker(s); validar curva, presença e uso de Helppi antes de realocar.`;
      if (need.is24h && currentGap > 0) action += " Prioridade: proteger madrugada com mínimo 3.";
      if (need.weeklyHelppi > 0) action += ` Usar ${fmtInt(need.weeklyHelppi)} Helppi(s)/semana nos picos por R$ ${fmtInt(need.monthlyHelppiCost)}/mês.`;
      return {
        ...store,
        ...need,
        currentGap,
        planGap,
        gapCovered,
        ask: Math.max(0, planGap),
        donor: Math.max(0, store.plan - need.hcNeeded),
        action,
        pickerShortageHc: Math.max(0, -need.pickerDeltaHours / 48),
        hcGap: store.real - store.plan,
      };
    })
    .sort((a, b) => b.currentGap - a.currentGap || a.diff - b.diff || a.store.localeCompare(b.store));
}

function renderHcAdjustment() {
  const summary = document.querySelector("#hc-adjust-summary");
  const table = document.querySelector("#hc-adjust-table");
  const transfer = document.querySelector("#hc-transfer-table");
  if (!summary || !table || !transfer) return;
  const rows = buildHcAdjustmentRows();
  const totalNeed = sum(rows.map((row) => row.hcNeeded));
  const totalPlan = sum(rows.map((row) => row.plan));
  const totalReal = sum(rows.map((row) => row.real));
  const totalAsk = sum(rows.map((row) => row.ask));
  const totalDonor = sum(rows.map((row) => row.donor));
  const totalHelppi = sum(rows.map((row) => row.weeklyHelppi));
  const totalHelppiCost = sum(rows.map((row) => row.monthlyHelppiCost));
  const deltaBrHours = sum(rows.map((row) => row.pickerDeltaHours));
  summary.innerHTML = [
    ["Delta BR", `${fmtInt(deltaBrHours)} h`, "Pickers conectados - necessários na semana", deltaBrHours < 0 ? "red" : "green"],
    ["HC necessário", fmtInt(totalNeed), `Plano ${fmtInt(totalPlan)} · Real ${fmtInt(totalReal)}`, totalReal >= totalNeed ? "green" : "red"],
    ["Helppi", fmtInt(totalHelppi), `R$ ${fmtInt(totalHelppiCost)}/mês nos picos`, totalHelppi ? "amber" : "green"],
    ["Ask líquido", fmtInt(Math.max(0, totalNeed - totalPlan)), `Ask bruto ${fmtInt(totalAsk)} · Plano acima ${fmtInt(totalDonor)}`, totalNeed > totalPlan ? "red" : "green"],
  ]
    .map(([label, value, sub, cls]) => `<article class="kpi ${cls}"><p class="label">${label}</p><p class="value">${value}</p><p class="sub">${sub}</p></article>`)
    .join("");

  const head = ["Loja", "24h", "HC fixo mín.", "Helppi/sem", "Custo Helppi", "Plan", "Real", "Ask", "Sugestão"];
  table.innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (row) => `<tr>
          <td><strong>${storeLink(row.store)}</strong><br><span>${row.coord}</span></td>
          <td>${row.is24h ? "Sim" : "Não"}</td>
          <td>${fmtInt(row.hcNeeded)}</td>
          <td>${fmtInt(row.weeklyHelppi)}</td>
          <td>R$ ${fmtInt(row.monthlyHelppiCost)}</td>
          <td>${fmtInt(row.plan)}</td>
          <td>${fmtInt(row.real)}</td>
          <td>${row.ask ? status(row.ask, "delta") : status(0, "delta")}</td>
          <td>${row.action}</td>
        </tr>`,
      )
      .join("")}</tbody>`;

  const receivers = rows.filter((row) => row.currentGap > 0).slice(0, 8);
  const donors = rows.filter((row) => row.donor > 0).sort((a, b) => b.donor - a.donor);
  const moves = donors.length
    ? receivers.map((receiver, index) => {
        const donor = donors[index % donors.length];
        return {
          from: donor.store,
          to: receiver.store,
          amount: Math.min(receiver.currentGap, donor.donor),
          note: `Reduzir plano da origem e realocar antes de abrir ${receiver.ask || receiver.currentGap} vaga(s).`,
        };
      })
    : [];
  transfer.innerHTML = `
    <thead><tr><th>Origem sugerida</th><th>Destino</th><th>Pickers</th><th>Leitura</th></tr></thead>
    <tbody>${
      moves.length
        ? moves.map((move) => `<tr><td>${move.from}</td><td><strong>${storeLink(move.to)}</strong></td><td>${fmtInt(move.amount)}</td><td>${move.note}</td></tr>`).join("")
        : `<tr><td colspan="4">Após aplicar 6x1, folga de domingo e cobertura pontual com Helppi, não há loja com plano doável. Recomendação: abrir ask de HC nas lojas com gap e revisar distribuição horária antes de reduzir plano.</td></tr>`
    }</tbody>`;
}

function dayLabelWithDate(date) {
  return `${weekdayPt(date)} · ${date}`;
}

function buildScheduleSuggestionRows() {
  const adjustmentByStore = new Map(buildHcAdjustmentRows().map((row) => [normalizeStore(row.store), row]));
  const offenders = (scaleQueryRows.length ? topInStoreStoresFromQuery().slice(0, 5) : [...allStores].sort((a, b) => b.inStore - a.inStore).slice(0, 5))
    .map((row) => {
      const base = allStores.find((store) => normalizeStore(store.store) === normalizeStore(row.store)) || row;
      return adjustmentByStore.get(normalizeStore(row.store)) || { ...base, ...hcNeedForStore(base.store) };
    });

  return offenders.flatMap((store) =>
    store.shiftNeeds.map((day) => {
      const isSunday = weekdayPt(day.date) === "Domingo";
      const helppiDay = store.helppiByDay?.find((item) => item.date === day.date) || fixedCoverageForDay(store.hcNeeded, day, store.is24h);
      const folgas = Math.max(0, num(store.hcNeeded) - num(helppiDay.fixedAvailable));
      const shifts = [
        `Madrugada 22:00-05:20: ${fmtInt(helppiDay.nightFixed || day.nightNeed)}`,
        `AM 06:00-13:20: ${fmtInt(helppiDay.amBase)}`,
        `Interm. 10:40-18:00: ${fmtInt(helppiDay.intermediates)}`,
        `PM 14:00-21:20: ${fmtInt(helppiDay.pmBase)}`,
      ].join(" · ");
      const currentGap = Math.max(0, num(store.hcNeeded) - num(store.real));
      const planAsk = Math.max(0, num(store.hcNeeded) - num(store.plan));
      const helppiWindows = helppiDay.helppi
        ? helppiWindowsForDay(helppiDay, helppiDay.helppi)
            .map((item) => `${fmtInt(item.amount)} Helppi ${item.window}`)
            .join(" · ")
        : "Sem Helppi";
      return {
        store: store.store,
        coord: store.coord,
        date: day.date,
        dayLabel: dayLabelWithDate(day.date),
        hcNeeded: store.hcNeeded,
        plan: store.plan,
        real: store.real,
        folgas,
        helppi: helppiDay.helppi,
        helppiWindows,
        total: day.total,
        shifts,
        action: currentGap > 0 ? `Escalar ${fmtInt(day.total)} no dia; repor ${fmtInt(currentGap)} até o HC fixo e abrir ask acima do plano de ${fmtInt(planAsk)}. ${helppiWindows}. ${isSunday ? "Domingo limitado a 70% do time ativo." : "Manter folgas fora dos picos."}` : `${helppiWindows}. Plano cobre a necessidade; revisar aderência e presença conectada por turno.`,
      };
    }),
  );
}

function renderOffenderScheduleSuggestions() {
  const table = document.querySelector("#offender-schedule-table");
  if (!table) return;
  const rows = buildScheduleSuggestionRows();
  const head = ["Loja", "Dia", "HC fixo", "Plan", "Real", "Folgas", "Helppi", "Escala sugerida", "Ask / ação"];
  table.innerHTML = `
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (row, index) => `<tr>
          <td><strong>${index % 7 === 0 ? storeLink(row.store) : row.store}</strong><br><span>${row.coord}</span></td>
          <td>${row.dayLabel}</td>
          <td>${fmtInt(row.hcNeeded)}</td>
          <td>${fmtInt(row.plan)}</td>
          <td>${fmtInt(row.real)}</td>
          <td>${fmtInt(row.folgas)}</td>
          <td>${fmtInt(row.helppi)}<br><span>${row.helppiWindows}</span></td>
          <td>${row.shifts}</td>
          <td>${row.action}</td>
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
          <span class="pill ${trend < 0 ? "warning" : ""}">Semana x mês: ${trend > 0 ? "+" : ""}${fixed(trend)} p.p.</span>
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
                    <td>${status(fixed(row.okrsMonth, 1), "okrs", "%")}</td>
                    <td>${status(fixed(row.okrsWeek, 1), "okrs", "%")}</td>
                    <td>${status(fixed(row.prod, 1), "prod")}</td>
                    <td>${fixed(row.availability, 1)}%</td>
                    <td>${fixed(row.defect)}%</td>
                    <td>${fixed(row.cancel)}%</td>
                    <td>${status(fixed(row.inStore), "inStore", "", "down", 2.65)}</td>
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

function renderCoordinatorPickingCompliance() {
  const table = document.querySelector("#coord-picking-compliance-table");
  if (!table) return;
  const rows = buildCoordinatorComplianceRows(connectivityPreviousRows);
  if (!rows.length) {
    table.innerHTML = `<tbody><tr><td>Sem dados de compliance por coordenador para a última semana fechada.</td></tr></tbody>`;
    return;
  }
  const dates = connectivityDays(connectivityPreviousRows);
  if (dates.length) {
    document.querySelector("#coord-picking-compliance-pill").textContent = `${dates[0].date} a ${dates[dates.length - 1].date}`;
  }
  const head = ["Coordenador", "Lojas", "Orders", "Pickers necessários", "Pickers escalados", "Picking compliance", "Slots OK", "InStore compliance"];
  table.innerHTML = `
    <thead><tr>${head.map((item) => `<th>${item}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (row) => `<tr>
          <td><strong>${row.coord}</strong></td>
          <td>${fmtInt(row.storesCount)}</td>
          <td>${fmtInt(row.orders)}</td>
          <td>${fixed(row.needed, 1)}</td>
          <td>${fixed(row.scheduled, 1)}</td>
          <td>${status(`${fixed(row.compliance, 1)}%`, "prod", "", "up", 55)}</td>
          <td>${fmtInt(row.compliantSlots)} / ${fmtInt(row.totalSlots)}</td>
          <td>${status(`${fixed(row.instoreCompliance, 1)}%`, "prod", "", "up", 70)}</td>
        </tr>`,
      )
      .join("")}</tbody>`;
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
  const pad = { top: 24, right: 72, bottom: 18, left: 180 };
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
    const rawBarW = ((width - pad.left - pad.right) / 2) * (Math.abs(value) / absMax);
    const labelGap = 32;
    const barW = Math.max(value === 0 ? 2 : rawBarW - labelGap, 2);
    const x = value < 0 ? center - barW : center;
    ctx.fillStyle = value < 0 ? "#b42318" : value > 0 ? "#b7791f" : "#607080";
    ctx.fillRect(x, y, Math.max(value === 0 ? 2 : barW, 2), rowH * 0.58);
    ctx.fillStyle = "#26323d";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${row.store} (${row.coord})`, 8, y + rowH * 0.42);
    ctx.textAlign = value < 0 ? "right" : "left";
    ctx.fillText(String(value), value < 0 ? x - 8 : x + barW + 8, y + rowH * 0.42);
  });
}

function drawWeeklyInstoreChart(canvas, rows) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const height = Number(canvas.getAttribute("height")) || 560;
  canvas.width = Math.max(1, rect.width * dpr);
  canvas.height = Math.max(1, height * dpr);
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const pad = { top: 86, right: 88, bottom: 86, left: 58 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const colors = {
    assign: "#006d77",
    picking: "#b7791f",
    packing: "#c2410c",
    productivity: "#0b253a",
    stores: "#1f7a4d",
  };
  const maxInstore = Math.max(weeklyInstoreGoal, ...rows.map((row) => num(row.inStore))) * 1.2;
  const maxProductivity = Math.max(75, ...rows.map((row) => num(row.productivity))) * 1.08;
  const maxStores = Math.max(1, ...rows.map((row) => num(row.storesTotal)));
  const groupW = plotW / rows.length;
  const barW = Math.min(78, Math.max(44, groupW * 0.38));
  const yInstore = (value) => pad.top + plotH * (1 - num(value) / maxInstore);
  const yProductivity = (value) => pad.top + plotH * (1 - num(value) / maxProductivity);
  const yStores = (value) => pad.top + plotH * (1 - num(value) / maxStores);

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "#d9e0e7";
  ctx.lineWidth = 1;
  ctx.font = "11px Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.fillStyle = "#607080";
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (plotH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    const value = maxInstore * (1 - i / 4);
    ctx.fillText(fixed(value, 1), pad.left - 8, y + 4);
  }

  const goalY = yInstore(weeklyInstoreGoal);
  ctx.strokeStyle = "#8a98a6";
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(pad.left, goalY);
  ctx.lineTo(width - pad.right, goalY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#607080";
  ctx.textAlign = "left";
  ctx.fillText(`meta InStore ${weeklyInstoreGoal}`, width - pad.right + 8, goalY + 4);

  const legend = [
    ["Assign", colors.assign],
    ["Picking", colors.picking],
    ["Packing", colors.packing],
    ["Produtividade", colors.productivity],
    ["Lojas na meta", colors.stores],
  ];
  legend.forEach(([label, color], index) => {
    const x = pad.left + index * 136;
    ctx.fillStyle = color;
    ctx.fillRect(x, 20, 12, 12);
    ctx.fillStyle = "#17202a";
    ctx.textAlign = "left";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText(label, x + 18, 30);
  });

  rows.forEach((row, index) => {
    const centerX = pad.left + index * groupW + groupW / 2;
    const x = centerX - barW / 2;
    let baseline = pad.top + plotH;
    [
      ["assign", row.assign],
      ["picking", row.picking],
      ["packing", row.packing],
    ].forEach(([key, value]) => {
      const segmentH = plotH * (num(value) / maxInstore);
      baseline -= segmentH;
      ctx.fillStyle = colors[key];
      ctx.fillRect(x, baseline, barW, segmentH);
    });
    ctx.fillStyle = "#17202a";
    ctx.textAlign = "center";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText(fixed(row.inStore, 2), centerX, Math.max(58, baseline - 14));
    ctx.fillStyle = "#607080";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText(weekLabel(row), centerX, height - 44);
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText(`${fmtInt(row.ordersTotal)} orders`, centerX, height - 26);
  });

  const drawLine = (key, yFor, color, labelFor, dashed = false, labelOffset = -12) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash(dashed ? [6, 5] : []);
    ctx.beginPath();
    rows.forEach((row, index) => {
      const x = pad.left + index * groupW + groupW / 2;
      const y = yFor(row[key]);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    rows.forEach((row, index) => {
      const x = pad.left + index * groupW + groupW / 2;
      const y = yFor(row[key]);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(labelFor(row), x, y + labelOffset);
    });
  };

  drawLine("productivity", yProductivity, colors.productivity, (row) => `Prod. ${fixed(row.productivity, 1)}`, false, -16);
  drawLine("storesInGoal", yStores, colors.stores, (row) => `${fmtInt(row.storesInGoal)} lojas`, true, 18);
}

function renderCharts() {
  renderWeeklyInstore();
  drawHorizontalChart(
    document.querySelector("#pickerGapChart"),
    [...allStores].sort((a, b) => a.diff - b.diff || a.store.localeCompare(b.store)),
    "diff",
  );
}

function pageForHash(hash = window.location.hash) {
  if (hash.startsWith("#daily")) return "daily";
  if (hash.startsWith("#connectivity")) return "connectivity";
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
  const dates = [window.OKRS_DATA_UPDATED_AT, window.DAILY_DATA_UPDATED_AT, window.SCALE_DATA_UPDATED_AT, window.HC_GAP_DATA_UPDATED_AT, window.WEEKLY_INSTORE_DATA_UPDATED_AT]
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
  renderBrPickingCompliance();
  renderDaily();
  renderConnectivity();
  renderPickerGapTable();
  renderHcAdjustment();
  renderOffenderScheduleSuggestions();
  renderCoordinatorCards();
  renderCoordinatorPickingCompliance();
  renderCharts();
  handleHashNavigation();
}

window.addEventListener("resize", () => {
  clearTimeout(window.__resizeTimer);
  window.__resizeTimer = setTimeout(renderCharts, 120);
});

window.addEventListener("hashchange", handleHashNavigation);

init();
