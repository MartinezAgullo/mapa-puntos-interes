// public/js/app.js

let map;
let markers = [];
let allPuntos = [];
let filteredPuntos = [];
let selectedPuntoId = null;

const ALL_CATEGORIES = [
  'missile','fighter','bomber','aircraft','helicopter','uav',
  'tank','artillery','ship','destroyer','submarine','ground_vehicle',
  'apc','infantry','person','base','building','infrastructure','default'
];

const ALLIANCE_COLORS = {
  friendly: '#00AEEF',
  hostile: '#FF0000',
  neutral: '#ADFF2F',
  unknown: '#A9A9A9'
};

function iconUrl(category, alliance) {
  const a = (alliance || 'unknown').toLowerCase();
  const c = (category || 'default').toLowerCase();
  return `/icons/${a}/${c}.svg`;
}

function makeIcon(category, alliance) {
  return L.icon({
    iconUrl: iconUrl(category, alliance),
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -28],
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadPuntos();
  setupEventListeners();
});

function initMap() {
  map = L.map('map').setView([40.4168, -3.7038], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19
  }).addTo(map);

  map.on('click', (e) => {
    if (document.getElementById('formModal').classList.contains('show')) {
      document.getElementById('latitud').value = e.latlng.lat.toFixed(6);
      document.getElementById('longitud').value = e.latlng.lng.toFixed(6);
    }
  });
}

function setupEventListeners() {
  document.getElementById('categoriaFilter').addEventListener('change', filterPuntos);
  document.getElementById('allianceFilter').addEventListener('change', filterPuntos);
  document.getElementById('buscarNombre').addEventListener('input', filterPuntos);

  document.getElementById('nuevoPuntoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await crearNuevoPunto();
  });
}

async function loadPuntos() {
  try {
    showLoading(true);
    const response = await fetch('/api/puntos');
    const result = await response.json();

    if (result.success) {
      allPuntos = result.data;
      filteredPuntos = allPuntos;
      updateStats();
      updateCategoriaFilter();
      renderPuntos();
      addMarkersToMap();
      showMessage('Puntos de interés cargados', 'success');
    } else {
      showMessage('Error al cargar puntos de interés', 'error');
    }
  } catch (err) {
    console.error(err);
    showMessage('Error de conexión con el servidor', 'error');
  } finally {
    showLoading(false);
  }
}

function filterPuntos() {
  const categoria = document.getElementById('categoriaFilter').value;
  const alliance = document.getElementById('allianceFilter').value;
  const busqueda = document.getElementById('buscarNombre').value.toLowerCase();

  filteredPuntos = allPuntos.filter(p => {
    const matchCat = !categoria || p.categoria === categoria;
    const matchAlliance = !alliance || (p.alliance && p.alliance === alliance);
    const matchName = !busqueda || (p.nombre || '').toLowerCase().includes(busqueda);
    return matchCat && matchAlliance && matchName;
  });

  renderPuntos();
  addMarkersToMap();
}

function renderPuntos() {
  const container = document.getElementById('puntosList');
  if (filteredPuntos.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;">No se encontraron puntos</p>';
    return;
  }

  container.innerHTML = filteredPuntos.map(p => `
    <div class="punto-item ${selectedPuntoId === p.id ? 'active' : ''}" onclick="selectPunto(${p.id})">
      <div class="punto-nombre">
        <span class="pill" style="background:${ALLIANCE_COLORS[p.alliance||'unknown']||'#A9A9A9'}"></span>
        ${p.nombre}
      </div>
      <span class="punto-categoria">${p.categoria} • ${p.alliance||'unknown'}${p.country ? ' • '+p.country : ''}</span>
    </div>
  `).join('');
}

function addMarkersToMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  filteredPuntos.forEach(p => {
    const icon = makeIcon(p.categoria, p.alliance);
    const marker = L.marker([p.latitud, p.longitud], { icon })
      .addTo(map)
      .bindPopup(createPopupContent(p), { className: 'custom-popup' });

    marker.on('click', () => selectPunto(p.id));
    markers.push(marker);
  });

  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

function createPopupContent(p) {
  const allianceColor = ALLIANCE_COLORS[p.alliance || 'unknown'] || '#A9A9A9';
  return `
    <div class="popup-content">
      <div class="popup-title">
        <span class="pill" style="background:${allianceColor}"></span>
        ${p.nombre}
      </div>
      <span class="popup-categoria">${p.categoria} • ${p.alliance || 'unknown'}${p.country ? ' • '+p.country : ''}</span>
      <div class="popup-info">
        ${p.descripcion ? `<p>${p.descripcion}</p>` : ''}
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn btn-danger" onclick="deletePunto(${p.id})">🗑️ Eliminar</button>
      </div>
    </div>
  `;
}

function selectPunto(id) {
  selectedPuntoId = id;
  const p = allPuntos.find(x => x.id === id);
  if (!p) return;

  renderPuntos();
  map.setView([p.latitud, p.longitud], 14);

  const marker = markers.find(m => {
    const ll = m.getLatLng();
    return Math.abs(ll.lat - p.latitud) < 1e-9 && Math.abs(ll.lng - p.longitud) < 1e-9;
  });
  if (marker) marker.openPopup();
}

function updateStats() {
  document.getElementById('totalPuntos').textContent = allPuntos.length;
  document.getElementById('totalCategorias').textContent = ALL_CATEGORIES.length;
}

function updateCategoriaFilter() {
  const select = document.getElementById('categoriaFilter');
  const categoriesInData = [...new Set(allPuntos.map(p => p.categoria))].sort();
  const categories = categoriesInData.length ? categoriesInData : ALL_CATEGORIES;

  select.innerHTML = '<option value="">Todas las categorías</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function centrarMapa() {
  map.setView([40.4168, -3.7038], 6);
}

function mostrarFormularioNuevoPunto() {
  document.getElementById('formModal').classList.add('show');
  const center = map.getCenter();
  document.getElementById('latitud').value = center.lat.toFixed(6);
  document.getElementById('longitud').value = center.lng.toFixed(6);
}

function cerrarFormularioNuevoPunto() {
  document.getElementById('formModal').classList.remove('show');
  document.getElementById('nuevoPuntoForm').reset();
}

async function crearNuevoPunto() {
  try {
    showLoading(true);
    const formData = {
      nombre: document.getElementById('nombre').value,
      descripcion: document.getElementById('descripcion').value,
      categoria: document.getElementById('categoria').value,
      country: document.getElementById('country').value,
      alliance: document.getElementById('alliance').value,
      latitud: parseFloat(document.getElementById('latitud').value),
      longitud: parseFloat(document.getElementById('longitud').value)
    };

    const res = await fetch('/api/puntos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const out = await res.json();

    if (out.success) {
      showMessage('Punto de interés creado correctamente', 'success');
      cerrarFormularioNuevoPunto();
      await loadPuntos();
    } else {
      showMessage(out.message || 'Error al crear punto de interés', 'error');
    }
  } catch (e) {
    console.error('Create error:', e);
    showMessage('Error de conexión con el servidor', 'error');
  } finally {
    showLoading(false);
  }
}

async function deletePunto(id) {
  const yes = confirm('¿Eliminar este punto de interés? Esta acción no se puede deshacer.');
  if (!yes) return;

  try {
    showLoading(true);
    const res = await fetch(`/api/puntos/${id}`, { method: 'DELETE' });
    const out = await res.json();
    if (out.success) {
      showMessage('Punto eliminado', 'success');
      await loadPuntos();
    } else {
      showMessage(out.message || 'No se pudo eliminar', 'error');
    }
  } catch (e) {
    console.error('Delete error:', e);
    showMessage('Error de conexión con el servidor', 'error');
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  const el = document.getElementById('loading');
  el.classList.toggle('show', !!show);
}
function showMessage(text, type) {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message message-${type} show`;
  setTimeout(() => messageEl.classList.remove('show'), 5000);
}
