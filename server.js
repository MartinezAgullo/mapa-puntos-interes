const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const puntosInteresRoutes = require('./routes/puntosInteres');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/puntos', puntosInteresRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores del servidor
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║   🗺️  Servidor de Puntos de Interés iniciado            ║
║                                                        ║
║   📡 Puerto: ${PORT}                                      ║
║   🌍 URL: http://localhost:${PORT}                        ║
║   📊 API: http://localhost:${PORT}/api/puntos             ║
║   💚 Entorno: ${process.env.NODE_ENV || 'development'}                              ║
╚════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
