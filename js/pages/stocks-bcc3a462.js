// Extrait de stocks.html (script en ligne → fichier, pour une CSP sans 'unsafe-inline')
'use strict';

// ── Thème ──────────────────────────────────────────────────────────────────
(function() {
  const saved = localStorage.getItem('biq-theme');
  const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
})();
document.getElementById('themeToggle')?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('biq-theme', isDark ? 'light' : 'dark');
});

// ── État ───────────────────────────────────────────────────────────────────
let activeContinent = 'all';
let activeAlertFilter = 'all';
let sortField = 'alertLevel';
let sortAsc = true;
let stocksMap = null;
let markersLayer = null;
let pharmacyLayer = null;
let aqiLayer = null;
let _enrichedData = null;
let _layerPharmaciesActive = false;
let _layerAqiActive = false;

function getStocksData() { return _enrichedData || (window.StocksAPI ? window.StocksAPI.STOCKS_DEMO_DATA : []); }

// ── Carte ──────────────────────────────────────────────────────────────────
function initStocksMap() {
  if (stocksMap || typeof L === 'undefined') return;

  stocksMap = L.map('stocksMap', {
    center: [20, 10], zoom: 2, minZoom: 1, maxZoom: 18,
    zoomControl: true, attributionControl: true
  });

  // CartoDB Positron — sobre et lisible
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd', maxZoom: 19
  }).addTo(stocksMap);

  renderStocksMarkers();
  setTimeout(() => stocksMap && stocksMap.invalidateSize(), 300);

  // Recharge les pharmacies quand la vue change (moveend + zoomend)
  stocksMap.on('moveend zoomend', () => {
    if (_layerPharmaciesActive) {
      const zoom = stocksMap.getZoom();
      if (zoom >= 9) {
        document.getElementById('zoomHint').style.display = 'none';
        loadPharmacyMarkers();
      } else {
        document.getElementById('zoomHint').style.display = 'flex';
      }
    }
  });
}

// ── Couche pharmacies ──────────────────────────────────────────────────────
async function loadPharmacyMarkers() {
  if (!stocksMap || !window.StocksLive) return;
  const bounds = stocksMap.getBounds();
  const boundsObj = {
    south: bounds.getSouth(), west: bounds.getWest(),
    north: bounds.getNorth(), east: bounds.getEast(),
  };

  const badge = document.getElementById('mapLoadingBadge');
  if (badge) badge.style.display = 'flex';

  try {
    const { pharmacies, limited } = await StocksLive.fetchPharmaciesOSM(boundsObj);

    if (limited) {
      document.getElementById('zoomHint').style.display = 'flex';
      document.getElementById('zoomHint').textContent = 'Zoomez davantage pour charger les pharmacies de cette zone.';
      if (badge) badge.style.display = 'none';
      return;
    }

    if (pharmacyLayer) { stocksMap.removeLayer(pharmacyLayer); }

    pharmacyLayer = typeof L.markerClusterGroup === 'function'
      ? L.markerClusterGroup({ maxClusterRadius: 40, disableClusteringAtZoom: 15 })
      : L.layerGroup();

    pharmacies.forEach(p => {
      const m = L.circleMarker([p.lat, p.lng], {
        radius: 6,
        fillColor: '#2563EB', color: '#1D4ED8',
        weight: 1.5, opacity: 1, fillOpacity: 0.8,
      });
      m.bindPopup(`
        <div class="map-popup-stocks">
          <strong>🏪 ${p.name}</strong>
          ${p.addr ? `<div style="font-size:.76rem;color:#718096;margin:.2rem 0">📍 ${p.addr}</div>` : ''}
          ${p.opening_hours ? `<div style="font-size:.74rem;margin:.15rem 0">🕐 <strong>Horaires :</strong> ${p.opening_hours}</div>` : ''}
          ${p.phone ? `<div style="font-size:.74rem;margin:.15rem 0">📞 <a href="tel:${p.phone}" style="color:#2563EB">${p.phone}</a></div>` : ''}
          ${p.website ? `<div style="font-size:.74rem;margin:.15rem 0">🌐 <a href="${p.website}" target="_blank" rel="noopener" style="color:#2563EB">Site web</a></div>` : ''}
          ${p.wheelchair === 'yes' ? `<div style="font-size:.72rem;color:#10B981;margin:.1rem 0">♿ Accessible PMR</div>` : ''}
          <div style="margin-top:.5rem;font-size:.7rem;color:#9CA3AF;border-top:1px solid #e5e7eb;padding-top:.3rem">📡 OpenStreetMap · Stocks non publiés en continu</div>
        </div>
      `);
      pharmacyLayer.addLayer(m);
    });

    pharmacyLayer.addTo(stocksMap);

    // Badge count
    const countBadge = document.getElementById('pharmacyCountBadge');
    const countText  = document.getElementById('pharmacyCountText');
    if (countBadge && countText) {
      countText.textContent = `${pharmacies.length} pharmacie${pharmacies.length > 1 ? 's' : ''}`;
      countBadge.style.display = 'inline-flex';
    }
  } catch (err) {
    console.warn('[stocks] Pharmacy layer error:', err);
  } finally {
    if (badge) badge.style.display = 'none';
  }
}

// ── Couche AQI ─────────────────────────────────────────────────────────────
async function loadAQILayer() {
  if (!stocksMap || !window.StocksLive) return;
  const center = stocksMap.getCenter();
  const aqi = await StocksLive.fetchAQI(center.lat, center.lng);
  if (!aqi || aqi.aqi == null) return;

  if (aqiLayer) { stocksMap.removeLayer(aqiLayer); }

  const color = StocksLive.aqiToColor(aqi.aqi);
  const label = StocksLive.aqiToLabel(aqi.aqi);

  // Cercle de gradient sur la zone visible
  aqiLayer = L.circle([center.lat, center.lng], {
    radius: 80000,
    fillColor: color, color: color,
    weight: 0, fillOpacity: 0.18,
  }).addTo(stocksMap);

  // Badge légende AQI
  const legendItem = document.getElementById('aqiLegendItem');
  const legendText = document.getElementById('aqiLegendText');
  if (legendItem && legendText) {
    legendItem.style.display = 'inline-flex';
    legendItem.style.background = color;
    legendText.textContent = `IQA ${aqi.aqi} — ${label}`;
  }
}

function getAlertColor(level) {
  return ALERT_COLORS[level] || ALERT_COLORS.UNKNOWN;
}

function renderStocksMarkers() {
  if (!stocksMap) return;
  if (markersLayer) { stocksMap.removeLayer(markersLayer); markersLayer = null; }

  const filtered = activeContinent === 'all'
    ? getStocksData()
    : getStocksData().filter(d => d.continent === activeContinent);

  // Coordonnées approximatives par code ISO
  const COORDS = {
    FR:[-0.58,46.23], DE:[10.45,51.16], US:[-95.71,37.09], CN:[104.2,35.86],
    JP:[138.25,36.2], IN:[78.96,20.59], ID:[113.92,-0.79], PK:[69.35,30.38],
    BR:[-51.93,-14.24], NG:[8.68,9.08], ET:[40.49,9.15], GB:[-3.44,55.38],
    AU:[133.78,-25.27], KR:[127.77,35.91], RU:[105.32,61.52], CA:[-106.35,56.13],
    CD:[21.76,-4.04], MX:[-102.55,23.63],
  };

  const markers = [];
  filtered.forEach(d => {
    const coord = COORDS[d.id];
    if (!coord) return;
    const alert = computeAlertLevel(d.daysSupply);
    const colors = getAlertColor(alert);
    const radius = d.ffp2 ? Math.min(30, Math.max(8, Math.log10(d.ffp2 + 1) * 4)) : 6;

    const circle = L.circleMarker([coord[1], coord[0]], {
      radius,
      fillColor: colors.fill,
      color: colors.border,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    });

    const confidenceWidth = d.confidence;
    circle.bindPopup(`
      <div class="map-popup-stocks">
        <strong>${d.name}</strong>
        <span class="alert-chip" style="background:${colors.fill};color:${colors.text};border:1px solid ${colors.border}">
          ${colors.label}
        </span>
        <dl style="margin:0;display:grid;grid-template-columns:auto 1fr;gap:.2rem .5rem;font-size:.78rem">
          <dt style="color:#718096">Autonomie</dt>
          <dd style="margin:0;font-weight:600">${d.daysSupply != null ? d.daysSupply + ' jours' : '—'}</dd>
          <dt style="color:#718096">Stock FFP2</dt>
          <dd style="margin:0">${formatStockUnits(d.ffp2)}</dd>
          <dt style="color:#718096">Confiance</dt>
          <dd style="margin:0">
            <div class="confidence-bar-wrap" role="progressbar" aria-valuenow="${confidenceWidth}" aria-valuemin="0" aria-valuemax="100">
              <div class="confidence-bar-fill" style="width:${confidenceWidth}%"></div>
            </div>
            ${confidenceWidth}%
          </dd>
          <dt style="color:#718096">MAJ</dt>
          <dd style="margin:0"><time datetime="${d.lastUpdated}">${d.lastUpdated}</time></dd>
        </dl>
      </div>
    `);

    markers.push(circle);
  });

  markersLayer = L.layerGroup(markers).addTo(stocksMap);
}

// ── Tableau ────────────────────────────────────────────────────────────────
const ALERT_ORDER = { CRITICAL: 0, LOW: 1, MODERATE: 2, SUFFICIENT: 3, UNKNOWN: 4 };

function getSortedData() {
  let data = getStocksData().filter(d => {
    const continentOk = activeContinent === 'all' || d.continent === activeContinent;
    const alertLevel = computeAlertLevel(d.daysSupply);
    const alertOk = activeAlertFilter === 'all' || alertLevel === activeAlertFilter;
    return continentOk && alertOk;
  });

  data = [...data].sort((a, b) => {
    let va, vb;
    if (sortField === 'alertLevel') {
      va = ALERT_ORDER[computeAlertLevel(a.daysSupply)];
      vb = ALERT_ORDER[computeAlertLevel(b.daysSupply)];
    } else {
      va = a[sortField]; vb = b[sortField];
    }
    if (va === vb) return 0;
    const cmp = va < vb ? -1 : 1;
    return sortAsc ? cmp : -cmp;
  });

  return data;
}

function renderTable() {
  const tbody = document.getElementById('stocksTableBody');
  if (!tbody) return;
  const data = getSortedData();

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--text-muted)">Aucune donnée pour ce filtre.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(d => {
    const alert = computeAlertLevel(d.daysSupply);
    const colors = getAlertColor(alert);
    const sourceName = d.sourceName || (STOCK_SOURCES[d.sourceKey] || {}).name || d.sourceKey || '—';
    const sourceUrl  = d.sourceUrl  || (STOCK_SOURCES[d.sourceKey] || {}).url  || '#';
    const dataTypeClass = `data-type-${d.dataType}`;
    const dataTypeLabel = { official: 'Officielle', estimate: 'Estimation', declarative: 'Déclaratif', unknown: 'Non disponible' }[d.dataType] || d.dataType;
    const daysDisplay = d.daysSupply != null ? `<strong>${d.daysSupply}</strong> j` : '<span style="color:var(--text-muted)">—</span>';
    const lastUpdDisplay = d.lastUpdated ? `<time datetime="${d.lastUpdated}">${d.lastUpdated}</time>` : '<span style="color:var(--text-muted)">—</span>';
    const confDisplay = d.confidence > 0
      ? `<div style="display:flex;align-items:center;gap:.4rem"><div class="confidence-bar-wrap" style="width:60px;flex-shrink:0"><div class="confidence-bar-fill" style="width:${d.confidence}%"></div></div><span style="font-size:.78rem">${d.confidence}%</span></div>`
      : '<span style="color:var(--text-muted);font-size:.78rem">—</span>';

    return `<tr>
      <td><strong>${d.name}</strong></td>
      <td>${d.continent}</td>
      <td>
        <span style="display:inline-flex;align-items:center;gap:.35rem;padding:.2rem .55rem;border-radius:var(--r-full);font-size:.72rem;font-weight:600;background:${colors.fill};color:${colors.text};border:1px solid ${colors.border}">
          ${colors.label}
        </span>
      </td>
      <td>${daysDisplay}</td>
      <td>${formatStockUnits(d.ffp2)}</td>
      <td>${confDisplay}</td>
      <td>${lastUpdDisplay}</td>
      <td><span class="data-type-badge ${dataTypeClass}">${dataTypeLabel}</span></td>
      <td>
        ${sourceUrl && sourceUrl !== '#'
          ? `<a href="${sourceUrl}" rel="noopener noreferrer" style="font-size:.78rem">${sourceName}</a>`
          : `<span style="font-size:.78rem">${sourceName}</span>`
        }
      </td>
    </tr>`;
  }).join('');
}

// ── Export CSV ─────────────────────────────────────────────────────────────
function exportCsv() {
  const data = getSortedData();
  const headers = ['Territoire','Continent','Niveau','Autonomie_jours','Stock_FFP2_est','Confiance_%','MAJ','Type_donnée','Source'];
  const rows = data.map(d => [
    d.name, d.continent, computeAlertLevel(d.daysSupply), d.daysSupply,
    d.ffp2, d.confidence, d.lastUpdated, d.dataType,
    d.sourceName || (STOCK_SOURCES[d.sourceKey] || {}).name || d.sourceKey || '—'
  ].join(';'));
  const csv = [headers.join(';'), ...rows].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `breathiq_stocks_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sources list ───────────────────────────────────────────────────────────
function renderSources() {
  const container = document.getElementById('sourcesList');
  if (!container) return;
  container.innerHTML = Object.entries(STOCK_SOURCES).map(([key, src]) => `
    <div class="source-item">
      <strong>${src.name}</strong>
      <div class="source-meta">
        ${src.coverage ? `Couverture : ${src.coverage} · ` : ''}
        ${src.frequency ? `Fréquence : ${src.frequency}` : ''}
        ${src.license ? `<br>Licence : ${src.license}` : ''}
        ${src.note ? `<br><em>${src.note}</em>` : ''}
      </div>
      <div class="source-reliability">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Fiabilité : ${src.reliability || '—'}%
        ${src.url && src.url !== '#' ? `· <a href="${src.url}" rel="noopener noreferrer">Site →</a>` : ''}
      </div>
    </div>
  `).join('');
}

// ── Événements ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Tabs géographiques
  document.querySelectorAll('.geo-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.geo-tab').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      activeContinent = btn.dataset.level;
      renderStocksMarkers();
      renderTable();
    });
  });

  // Filtres alertes
  document.querySelectorAll('[data-alert-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-alert-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeAlertFilter = btn.dataset.alertFilter;
      renderTable();
    });
  });

  // Tri tableau
  document.querySelectorAll('.stocks-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (sortField === field) sortAsc = !sortAsc;
      else { sortField = field; sortAsc = true; }
      document.querySelectorAll('.stocks-table th').forEach(h => h.classList.remove('sorted'));
      th.classList.add('sorted');
      th.querySelector('.sort-indicator').textContent = sortAsc ? '↑' : '↓';
      renderTable();
    });
  });

  // Export
  document.getElementById('exportCsv')?.addEventListener('click', exportCsv);
  document.getElementById('exportPrint')?.addEventListener('click', () => window.print());

  // ── Contrôles couches carte ─────────────────────────────────────────────
  document.querySelectorAll('[data-layer]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const layer = btn.dataset.layer;

      if (layer === 'national') return; // toujours actif

      if (layer === 'pharmacies') {
        _layerPharmaciesActive = !_layerPharmaciesActive;
        btn.classList.toggle('active', _layerPharmaciesActive);
        btn.setAttribute('aria-pressed', _layerPharmaciesActive ? 'true' : 'false');

        if (!_layerPharmaciesActive) {
          if (pharmacyLayer) { stocksMap?.removeLayer(pharmacyLayer); pharmacyLayer = null; }
          const cb = document.getElementById('pharmacyCountBadge');
          if (cb) cb.style.display = 'none';
          document.getElementById('zoomHint').style.display = 'none';
        } else {
          const zoom = stocksMap?.getZoom() ?? 0;
          if (zoom < 9) {
            document.getElementById('zoomHint').style.display = 'flex';
          } else {
            document.getElementById('zoomHint').style.display = 'none';
            await loadPharmacyMarkers();
          }
        }
      }

      if (layer === 'aqi') {
        _layerAqiActive = !_layerAqiActive;
        btn.classList.toggle('active', _layerAqiActive);
        btn.setAttribute('aria-pressed', _layerAqiActive ? 'true' : 'false');

        if (!_layerAqiActive) {
          if (aqiLayer) { stocksMap?.removeLayer(aqiLayer); aqiLayer = null; }
          const li = document.getElementById('aqiLegendItem');
          if (li) li.style.display = 'none';
        } else {
          await loadAQILayer();
        }
      }
    });
  });

  // ── Bouton "Autour de moi" ───────────────────────────────────────────────
  document.getElementById('locateBtn')?.addEventListener('click', () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        stocksMap?.setView([pos.coords.latitude, pos.coords.longitude], 12);
        if (_layerPharmaciesActive) loadPharmacyMarkers();
      },
      err => console.warn('[stocks] Geoloc error:', err.code),
      { timeout: 10000, maximumAge: 60000 }
    );
  });

  // ── Bouton force refresh ─────────────────────────────────────────────────
  document.getElementById('forceRefreshBtn')?.addEventListener('click', async () => {
    await runEnrichment();
  });

  // Init
  renderTable();
  renderSources();

  // Carte — init quand Leaflet chargé
  if (typeof L !== 'undefined') {
    initStocksMap();
  } else {
    const checkL = setInterval(() => {
      if (typeof L !== 'undefined') { clearInterval(checkL); initStocksMap(); }
    }, 200);
  }

  // ── Chargement des données depuis data/stocks.json ────────────────────────
  async function runEnrichment() {
    try {
      const loaded = window.StocksAPI
        ? await window.StocksAPI.loadStocksFromJson()
        : null;
      if (loaded && loaded.length > 0) {
        _enrichedData = loaded;
        renderTable();
        renderStocksMarkers();
      }
    } catch (err) {
      console.warn('[stocks] Chargement données stocks:', err);
    }
  }

  runEnrichment();
});
