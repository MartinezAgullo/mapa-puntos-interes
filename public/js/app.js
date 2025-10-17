// Estado de la aplicación
let map;
let markers = [];
let allPuntos = [];
let filteredPuntos = [];
let selectedPuntoId = null;

// Iconos personalizados por categoría
const categoryIcons = {
    'Avion': '✈️',
    'Tanque': '🛡️',
    'Drone': '🚁',
    'BSM': '🏕️',
    'Centro de Mando': '🎯',
    'Unidad': '👥',
    'Sub-Grupo Tactico': '⚔️',
    'Peloton': '🎖️',
    'Vehiculo': '🚗',
    'Artilleria': '💣',
    'Infanteria': '🪖',
    'Otro': '📍'
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadPuntos();
    setupEventListeners();
});

// Inicializar mapa
function initMap() {
    // Crear mapa centrado en España
    map = L.map('map').setView([40.4168, -3.7038], 6);

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Evento de clic en el mapa para agregar puntos
    map.on('click', (e) => {
        if (document.getElementById('formModal').classList.contains('show')) {
            document.getElementById('latitud').value = e.latlng.lat.toFixed(6);
            document.getElementById('longitud').value = e.latlng.lng.toFixed(6);
        }
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Filtro de categoría
    document.getElementById('categoriaFilter').addEventListener('change', (e) => {
        filterPuntos();
    });

    // Búsqueda por nombre
    document.getElementById('buscarNombre').addEventListener('input', (e) => {
        filterPuntos();
    });

    // Formulario de nuevo punto
    document.getElementById('nuevoPuntoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await crearNuevoPunto();
    });
}

// Cargar puntos de interés
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
            showMessage('Puntos de interés cargados correctamente', 'success');
        } else {
            showMessage('Error al cargar puntos de interés', 'error');
        }
    } catch (error) {
        console.error('Error al cargar puntos:', error);
        showMessage('Error de conexión con el servidor', 'error');
    } finally {
        showLoading(false);
    }
}

// Filtrar puntos
function filterPuntos() {
    const categoria = document.getElementById('categoriaFilter').value;
    const busqueda = document.getElementById('buscarNombre').value.toLowerCase();

    filteredPuntos = allPuntos.filter(punto => {
        const matchCategoria = !categoria || punto.categoria === categoria;
        const matchNombre = !busqueda || punto.nombre.toLowerCase().includes(busqueda);
        return matchCategoria && matchNombre;
    });

    renderPuntos();
    addMarkersToMap();
}

// Renderizar lista de puntos
function renderPuntos() {
    const container = document.getElementById('puntosList');

    if (filteredPuntos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No se encontraron puntos de interés</p>';
        return;
    }

    container.innerHTML = filteredPuntos.map(punto => `
        <div class="punto-item ${selectedPuntoId === punto.id ? 'active' : ''}"
             onclick="selectPunto(${punto.id})">
            <div class="punto-nombre">
                ${categoryIcons[punto.categoria] || '📍'} ${punto.nombre}
            </div>
            <span class="punto-categoria">${punto.categoria}</span>
            <div class="punto-ciudad">
                📍 ${punto.ciudad}, ${punto.provincia}
            </div>
        </div>
    `).join('');
}

// Agregar marcadores al mapa
function addMarkersToMap() {
    // Limpiar marcadores existentes
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Agregar nuevos marcadores
    filteredPuntos.forEach(punto => {
        const icon = L.divIcon({
            html: `<div style="font-size: 2em;">${categoryIcons[punto.categoria] || '📍'}</div>`,
            className: 'custom-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        const marker = L.marker([punto.latitud, punto.longitud], { icon })
            .addTo(map)
            .bindPopup(createPopupContent(punto), {
                className: 'custom-popup'
            });

        marker.on('click', () => {
            selectPunto(punto.id);
        });

        markers.push(marker);
    });

    // Ajustar vista del mapa para mostrar todos los marcadores
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Crear contenido del popup
function createPopupContent(punto) {
    return `
        <div class="popup-content">
            <div class="popup-title">${punto.nombre}</div>
            <span class="popup-categoria">${punto.categoria}</span>
            <div class="popup-info">
                ${punto.descripcion ? `<p>${punto.descripcion}</p>` : ''}
                ${punto.direccion ? `<p><strong>📍</strong> ${punto.direccion}</p>` : ''}
                <p><strong>🏙️</strong> ${punto.ciudad}, ${punto.provincia}</p>
                ${punto.codigo_postal ? `<p><strong>📮</strong> ${punto.codigo_postal}</p>` : ''}
                ${punto.telefono ? `<p><strong>📞</strong> ${punto.telefono}</p>` : ''}
                ${punto.email ? `<p><strong>✉️</strong> ${punto.email}</p>` : ''}
                ${punto.website ? `<p><strong>🌐</strong> <a href="${punto.website}" target="_blank">Sitio web</a></p>` : ''}
            </div>
        </div>
    `;
}

// Seleccionar punto
function selectPunto(id) {
    selectedPuntoId = id;
    const punto = allPuntos.find(p => p.id === id);

    if (punto) {
        // Actualizar UI
        renderPuntos();

        // Centrar mapa en el punto
        map.setView([punto.latitud, punto.longitud], 15);

        // Abrir popup del marcador
        const marker = markers.find(m =>
            m.getLatLng().lat === punto.latitud &&
            m.getLatLng().lng === punto.longitud
        );
        if (marker) {
            marker.openPopup();
        }

        // Scroll al punto en la lista
        const puntoElement = document.querySelector(`.punto-item.active`);
        if (puntoElement) {
            puntoElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// Actualizar estadísticas
function updateStats() {
    document.getElementById('totalPuntos').textContent = allPuntos.length;
    const categorias = [
    'Avion',
    'Tanque',
    'Drone',
    'BSM',
    'Centro de Mando',
    'Unidad',
    'Sub-Grupo Tactico',
    'Peloton',
    'Vehiculo',
    'Artilleria',
    'Infanteria',
    'Otro'
];
    document.getElementById('totalCategorias').textContent = categorias.length;
}

// Actualizar filtro de categorías
function updateCategoriaFilter() {
    const select = document.getElementById('categoriaFilter');
    const categorias = [...new Set(allPuntos.map(p => p.categoria))].sort();

    select.innerHTML = '<option value="">Todas las categorías</option>';
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = `${categoryIcons[cat] || '📍'} ${cat}`;
        select.appendChild(option);
    });
}

// Centrar mapa en España
function centrarMapa() {
    map.setView([40.4168, -3.7038], 6);
}

// Mostrar formulario de nuevo punto
function mostrarFormularioNuevoPunto() {
    document.getElementById('formModal').classList.add('show');
    // Pre-rellenar con centro del mapa
    const center = map.getCenter();
    document.getElementById('latitud').value = center.lat.toFixed(6);
    document.getElementById('longitud').value = center.lng.toFixed(6);
}

// Cerrar formulario de nuevo punto
function cerrarFormularioNuevoPunto() {
    document.getElementById('formModal').classList.remove('show');
    document.getElementById('nuevoPuntoForm').reset();
}

// Crear nuevo punto de interés
async function crearNuevoPunto() {
    try {
        showLoading(true);

        const formData = {
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            categoria: document.getElementById('categoria').value,
            direccion: document.getElementById('direccion').value,
            ciudad: document.getElementById('ciudad').value,
            provincia: document.getElementById('provincia').value,
            codigo_postal: document.getElementById('codigo_postal').value,
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value,
            website: document.getElementById('website').value,
            latitud: parseFloat(document.getElementById('latitud').value),
            longitud: parseFloat(document.getElementById('longitud').value)
        };

        const response = await fetch('/api/puntos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Punto de interés creado correctamente', 'success');
            cerrarFormularioNuevoPunto();
            await loadPuntos();
        } else {
            showMessage('Error al crear punto de interés', 'error');
        }
    } catch (error) {
        console.error('Error al crear punto:', error);
        showMessage('Error de conexión con el servidor', 'error');
    } finally {
        showLoading(false);
    }
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

// Mostrar mensaje
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message message-${type} show`;

    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}
