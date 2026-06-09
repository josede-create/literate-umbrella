const data = window.EXPANSION_DATA;
const fmt = new Intl.NumberFormat("pt-BR");
const moneyFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

let focus = "general";
let basis = "users";
let map;
let layers = [];

function scenarioKey() {
  return `${focus}_${basis}`;
}

function n(value) {
  return fmt.format(Math.round(Number(value || 0)));
}

function clearLayers() {
  layers.forEach((layer) => layer.remove());
  layers = [];
}

function scenarioRows() {
  return data.opportunities
    .filter((row) => row.scenario === scenarioKey())
    .sort((a, b) => Number(a.rank) - Number(b.rank));
}

function candidateIds() {
  return new Set(scenarioRows().map((row) => String(row.candidate_id)));
}

function renderKpis() {
  const summary = data.summary;
  const scenario = summary.scenarios[scenarioKey()] || {};
  const current = summary.current || {};
  const rows = [
    ["Lojas novas", scenario.new_stores, `${focus === "general" ? "Geral" : "RJ/SP"} | ${basis === "users" ? "Usuários" : "População"}`],
    ["Usuários incr.", scenario.incremental_users, "fora da cobertura atual"],
    ["Orders/mês usuários", scenario.estimated_orders_month_users, "75% x 2,5"],
    ["Pop. estimada", scenario.estimated_population, "proxy regional"],
    ["Orders/mês pop.", scenario.estimated_orders_month_population, "75% x 2,5"],
  ];
  document.getElementById("kpis").innerHTML = rows
    .map(
      ([label, value, sub]) => `
        <div class="kpi">
          <div class="label">${label}</div>
          <div class="value">${n(value)}</div>
          <div class="sub">${sub}</div>
        </div>
      `,
    )
    .join("");
  document.getElementById("meta").textContent = `${n(current.stores)} lojas atuais | ${n(current.current_covered_users_5km)} usuários cobertos 5 km | ${new Date(summary.generated_at).toLocaleString("pt-BR")}`;
}

function table(headers, rows) {
  return `
    <thead><tr>${headers.map((h) => `<th class="${h.cls || ""}">${h.label}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (row) => `<tr>${headers
          .map((h) => `<td class="${h.cls || ""}">${h.render ? h.render(row) : row[h.key] ?? ""}</td>`)
          .join("")}</tr>`,
      )
      .join("")}</tbody>
  `;
}

function renderTables() {
  const rows = scenarioRows();
  document.getElementById("opportunityTable").innerHTML = table(
    [
      { label: "#", render: (r) => `<span class="rank">${r.rank}</span>` },
      { label: "Cidade", render: (r) => `<strong>${r.city}</strong><br><span class="popup-line">${r.dominant_microzones}</span>` },
      { label: "Usuários", cls: "num", render: (r) => n(r.incremental_users) },
      { label: "Orders", cls: "num", render: (r) => n(r.estimated_orders_month_users) },
      { label: "Pop.", cls: "num", render: (r) => n(r.estimated_population) },
      { label: "Overlap", cls: "num", render: (r) => `${Math.round(Number(r.current_overlap_share || 0) * 100)}%` },
    ],
    rows,
  );

  const scenarioSummaryRows = Object.entries(data.summary.scenarios).map(([key, value]) => ({
    key,
    label: key.replace("general", "Geral").replace("rjsp", "RJ/SP").replace("users", "usuários").replace("population", "população"),
    ...value,
  }));
  document.getElementById("scenarioTable").innerHTML = table(
    [
      { label: "Cenário", key: "label" },
      { label: "Lojas", cls: "num", render: (r) => n(r.new_stores) },
      { label: "Usuários", cls: "num", render: (r) => n(r.incremental_users) },
      { label: "Orders usuários", cls: "num", render: (r) => n(r.estimated_orders_month_users) },
      { label: "Pop.", cls: "num", render: (r) => n(r.estimated_population) },
      { label: "Orders pop.", cls: "num", render: (r) => n(r.estimated_orders_month_population) },
    ],
    scenarioSummaryRows,
  );

  document.getElementById("storeTable").innerHTML = table(
    [
      { label: "WH", key: "wh_id", cls: "num" },
      { label: "Loja", render: (r) => `<strong>${r.name}</strong><br><span class="popup-line">${r.city}</span>` },
      { label: "Lat", cls: "num", render: (r) => Number(r.lat).toFixed(4) },
      { label: "Lng", cls: "num", render: (r) => Number(r.lng).toFixed(4) },
      { label: "Raio", cls: "num", render: (r) => `${Number(r.coverage_radius_km || 5).toFixed(1)} km` },
    ],
    data.stores,
  );
}

function polygonPopup(props, row) {
  if (row) {
    return `
      <div class="popup-title">#${row.rank} ${row.candidate_name}</div>
      <div class="popup-line">${row.city}</div>
      <div class="popup-line">${n(row.incremental_users)} usuários incr. | ${n(row.estimated_orders_month_users)} orders/mês</div>
      <div class="popup-line">Pop. ${n(row.estimated_population)} | overlap ${Math.round(Number(row.current_overlap_share || 0) * 100)}%</div>
    `;
  }
  return `
    <div class="popup-title">${props.name || props.source_id || "Loja atual"}</div>
    <div class="popup-line">${props.city || ""}</div>
    <div class="popup-line">${Number(props.radius_km || 5).toFixed(1)} km via Mapbox</div>
  `;
}

function renderMap() {
  if (!map) {
    map = L.map("map", { zoomControl: true }).setView([-22.9, -43.2], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
  }
  clearLayers();

  const selectedIds = candidateIds();
  const rowById = Object.fromEntries(scenarioRows().map((row) => [String(row.candidate_id), row]));
  const bounds = [];

  const currentLayer = L.geoJSON(data.current_polygons, {
    style: { color: "#2563eb", weight: 1, opacity: 0.55, fillColor: "#2563eb", fillOpacity: 0.08 },
    onEachFeature: (feature, layer) => layer.bindPopup(polygonPopup(feature.properties || {})),
  }).addTo(map);
  layers.push(currentLayer);

  const candidateFeatures = {
    type: "FeatureCollection",
    features: data.candidate_polygons.features.filter((feature) => selectedIds.has(String(feature.properties.source_id))),
  };
  const candidateLayer = L.geoJSON(candidateFeatures, {
    style: { color: "#0f9f6e", weight: 2, opacity: 0.9, fillColor: "#0f9f6e", fillOpacity: 0.18 },
    onEachFeature: (feature, layer) => layer.bindPopup(polygonPopup(feature.properties || {}, rowById[String(feature.properties.source_id)])),
  }).addTo(map);
  layers.push(candidateLayer);

  scenarioRows().forEach((row) => {
    const marker = L.circleMarker([Number(row.lat), Number(row.lng)], {
      radius: 7,
      color: "#0f5132",
      weight: 2,
      fillColor: "#ffffff",
      fillOpacity: 1,
    }).bindTooltip(`#${row.rank} ${row.city}`, { permanent: false });
    marker.bindPopup(polygonPopup({}, row));
    marker.addTo(map);
    layers.push(marker);
    bounds.push([Number(row.lat), Number(row.lng)]);
  });

  const filteredPoints = data.map_points.filter((p) => !p.covered && (focus === "general" || p.rjsp));
  filteredPoints.slice(0, 12000).forEach((p) => {
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: 2,
      stroke: false,
      fillColor: "#d64545",
      fillOpacity: 0.26,
      interactive: false,
    }).addTo(map);
    layers.push(marker);
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: focus === "rjsp" ? 11 : 6 });
  } else if (candidateLayer.getBounds().isValid()) {
    map.fitBounds(candidateLayer.getBounds(), { padding: [36, 36] });
  }
}

function render() {
  renderKpis();
  renderTables();
  renderMap();
}

document.querySelectorAll("[data-focus]").forEach((button) => {
  button.addEventListener("click", () => {
    focus = button.dataset.focus;
    document.querySelectorAll("[data-focus]").forEach((el) => el.classList.toggle("active", el === button));
    render();
  });
});

document.querySelectorAll("[data-basis]").forEach((button) => {
  button.addEventListener("click", () => {
    basis = button.dataset.basis;
    document.querySelectorAll("[data-basis]").forEach((el) => el.classList.toggle("active", el === button));
    render();
  });
});

render();
