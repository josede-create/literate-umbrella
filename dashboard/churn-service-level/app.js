const state = {
  users: [],
  stores: [],
  filteredUsers: [],
  filteredStores: [],
};

const numberFields = new Set([
  "days_since_last_turbo",
  "consecutive_cancelled_orders",
  "last_deliver_to_user_min",
  "ops_store_minutes",
  "rt_minutes",
  "orders_checked",
  "users",
  "avg_days_since_last_turbo",
  "avg_last_deliver_to_user_min",
  "cancel_streak_users",
  "cancel_streak_orders",
  "delayed_last_users",
  "dr_last_purchase_users",
  "ops_store_delay_users",
  "rt_delay_users",
  "mixed_delay_users",
  "no_breakdown_delay_users",
]);

const boolFields = new Set([
  "last_order_cancelled",
  "last_purchase_over_20_min",
  "last_purchase_dr",
  "is_cancelled",
  "is_defect_dr",
  "is_delayed_core_20",
]);

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }
  const [headers, ...body] = rows;
  if (!headers) return [];
  return body.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function yes(value) {
  return String(value ?? "").toLowerCase() === "true";
}

function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function byId(id) {
  return document.getElementById(id);
}

async function loadCsv(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Falha ao carregar ${path}`);
  return parseCsv(await response.text());
}

function fillSelect(id, values) {
  const element = byId(id);
  element.innerHTML = values.map((value) => `<option>${value}</option>`).join("");
}

function populateFilters() {
  fillSelect("serviceLevel", ["Todos", ...Array.from(new Set(state.users.map((row) => row.service_level).filter(Boolean))).sort()]);
  fillSelect("cityFilter", ["Todos", ...Array.from(new Set(state.users.map((row) => row.user_city).filter(Boolean))).sort()]);
  fillSelect("storeFilter", ["Todos", ...Array.from(new Set(state.users.map((row) => row.last_purchase_store).filter(Boolean))).sort()]);
}

function getFilters() {
  return {
    query: byId("query").value.trim().toLowerCase(),
    serviceLevel: byId("serviceLevel").value,
    city: byId("cityFilter").value,
    store: byId("storeFilter").value,
    flag: byId("flagFilter").value,
    minDays: toNumber(byId("minDays").value),
    sortKey: byId("sortKey").value,
  };
}

function filterData() {
  const filters = getFilters();
  state.filteredUsers = state.users
    .filter((row) => {
      if (filters.serviceLevel !== "Todos" && row.service_level !== filters.serviceLevel) return false;
      if (filters.city !== "Todos" && row.user_city !== filters.city) return false;
      if (filters.store !== "Todos" && row.last_purchase_store !== filters.store) return false;
      if (toNumber(row.days_since_last_turbo) < filters.minDays) return false;
      if (filters.flag === "Cancelados" && toNumber(row.consecutive_cancelled_orders) === 0) return false;
      if (filters.flag === "Atrasados >20" && !yes(row.last_purchase_over_20_min)) return false;
      if (filters.flag === "DR" && !yes(row.last_purchase_dr)) return false;
      if (filters.flag === "Ops loja" && row.delay_root_cause !== "Ops loja") return false;
      if (filters.flag === "RT" && row.delay_root_cause !== "RT") return false;
      if (!filters.query) return true;
      return [
        row.user_id,
        row.user_city,
        row.last_purchase_store,
        row.service_level,
        row.delay_root_cause,
        row.delay_detail,
      ].join(" ").toLowerCase().includes(filters.query);
    })
    .sort((a, b) => toNumber(b[filters.sortKey]) - toNumber(a[filters.sortKey]));

  const storeSet = new Set(state.filteredUsers.map((row) => String(row.last_purchase_store_id)));
  state.filteredStores = state.stores
    .filter((row) => storeSet.has(String(row.store_id)))
    .sort((a, b) => toNumber(b.users) - toNumber(a.users));
}

function renderKpis() {
  const total = state.filteredUsers.length;
  const cancelUsers = state.filteredUsers.filter((row) => toNumber(row.consecutive_cancelled_orders) > 0).length;
  const delayed = state.filteredUsers.filter((row) => yes(row.last_purchase_over_20_min));
  const dr = state.filteredUsers.filter((row) => yes(row.last_purchase_dr)).length;
  const avgDays = total ? state.filteredUsers.reduce((sum, row) => sum + toNumber(row.days_since_last_turbo), 0) / total : 0;
  const rt = delayed.filter((row) => row.delay_root_cause === "RT").length;
  const ops = delayed.filter((row) => row.delay_root_cause === "Ops loja").length;

  byId("kpiUsers").textContent = formatNumber(total);
  byId("kpiDays").textContent = formatNumber(avgDays, 1);
  byId("kpiCancel").textContent = formatNumber(cancelUsers);
  byId("kpiDelayed").textContent = formatNumber(delayed.length);
  byId("kpiDr").textContent = formatNumber(dr);
  byId("kpiRoots").textContent = `${formatNumber(rt)} / ${formatNumber(ops)}`;
}

function renderTables() {
  byId("usersCount").textContent = `${formatNumber(state.filteredUsers.length)} usuarios no filtro atual`;
  byId("storesCount").textContent = `${formatNumber(state.filteredStores.length)} lojas no filtro atual`;
  byId("usersBody").innerHTML = state.filteredUsers.slice(0, 500).map((row) => `
    <tr>
      <td>${row.user_id}</td>
      <td>${row.user_city}</td>
      <td>${row.days_since_last_turbo}</td>
      <td>${row.last_purchase_store}</td>
      <td><span class="pill ${row.service_level === ">20 min" ? "dangerBg" : ""}">${row.service_level}</span></td>
      <td>${row.consecutive_cancelled_orders}</td>
      <td>${yes(row.last_purchase_dr) ? "Sim" : "Nao"}</td>
      <td>${row.delay_root_cause || "-"}</td>
    </tr>
  `).join("");

  byId("storesBody").innerHTML = state.filteredStores.slice(0, 250).map((row) => `
    <tr>
      <td>${row.store_name}</td>
      <td>${row.users}</td>
      <td>${row.avg_days_since_last_turbo}</td>
      <td>${row.delayed_last_users}</td>
      <td>${row.dr_last_purchase_users}</td>
      <td>${row.cancel_streak_users}</td>
      <td>${row.rt_delay_users}</td>
      <td>${row.ops_store_delay_users}</td>
    </tr>
  `).join("");
}

function render() {
  filterData();
  renderKpis();
  renderTables();
}

function downloadCsv(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((row) => headers.map((key) => csvEscape(row[key])).join(","))].join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadExcel(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => `<tr>${headers.map((key) => {
    const raw = row[key] ?? "";
    const value = boolFields.has(key) ? (yes(raw) ? "Sim" : "Nao") : raw;
    const type = numberFields.has(key) && raw !== "" ? ' style="mso-number-format:General"' : "";
    return `<td${type}>${String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</td>`;
  }).join("")}</tr>`).join("");
  const html = `<html><head><meta charset="utf-8"></head><body><table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  ["query", "serviceLevel", "cityFilter", "storeFilter", "flagFilter", "minDays", "sortKey"].forEach((id) => {
    byId(id).addEventListener("input", render);
    byId(id).addEventListener("change", render);
  });
  byId("downloadUsersExcel").addEventListener("click", () => downloadExcel(state.filteredUsers, "churn_usuarios_filtrado.xls"));
  byId("downloadUsersCsv").addEventListener("click", () => downloadCsv(state.filteredUsers, "churn_usuarios_filtrado.csv"));
  byId("downloadStoresExcel").addEventListener("click", () => downloadExcel(state.filteredStores, "churn_lojas_filtrado.xls"));
  byId("downloadStoresCsv").addEventListener("click", () => downloadCsv(state.filteredStores, "churn_lojas_filtrado.csv"));
}

async function init() {
  try {
    bindEvents();
    const [users, stores] = await Promise.all([
      loadCsv("data/churn_users_report.csv"),
      loadCsv("data/churn_store_report.csv"),
    ]);
    state.users = users;
    state.stores = stores;
    populateFilters();
    render();
    byId("loadStatus").textContent = `${formatNumber(users.length)} usuarios carregados`;
  } catch (error) {
    byId("loadStatus").textContent = "Erro ao carregar dados";
    console.error(error);
  }
}

init();
