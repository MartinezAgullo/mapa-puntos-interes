const express = require('express');
const router = express.Router();
const PuntoInteres = require('../models/puntoInteres');

// GET /api/puntos - Obtener todos los puntos de interés
router.get('/', async (req, res) => {
    try {
        const puntos = await PuntoInteres.getAll();
        res.json({
            success: true,
            count: puntos.length,
            data: puntos
        });
    } catch (error) {
        console.error('Error al obtener puntos de interés:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener puntos de interés',
            error: error.message
        });
    }
});

// GET /api/puntos/:id - Obtener punto de interés por ID
router.get('/:id', async (req, res) => {
    try {
        const punto = await PuntoInteres.getById(req.params.id);
        if (!punto) {
            return res.status(404).json({
                success: false,
                message: 'Punto de interés no encontrado'
            });
        }
        res.json({
            success: true,
            data: punto
        });
    } catch (error) {
        console.error('Error al obtener punto de interés:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener punto de interés',
            error: error.message
        });
    }
});

// GET /api/puntos/categoria/:categoria - Obtener puntos por categoría
router.get('/categoria/:categoria', async (req, res) => {
    try {
        const puntos = await PuntoInteres.getByCategoria(req.params.categoria);
        res.json({
            success: true,
            count: puntos.length,
            data: puntos
        });
    } catch (error) {
        console.error('Error al obtener puntos por categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener puntos por categoría',
            error: error.message
        });
    }
});

// GET /api/puntos/cerca/:longitud/:latitud - Obtener puntos cercanos
router.get('/cerca/:longitud/:latitud', async (req, res) => {
    try {
        const { longitud, latitud } = req.params;
        const radio = req.query.radio || 50000; // Radio por defecto 50km
        const puntos = await PuntoInteres.getNearby(
            parseFloat(longitud),
            parseFloat(latitud),
            parseInt(radio)
        );
        res.json({
            success: true,
            count: puntos.length,
            data: puntos
        });
    } catch (error) {
        console.error('Error al obtener puntos cercanos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener puntos cercanos',
            error: error.message
        });
    }
});

// POST /api/puntos - Crear nuevo punto de interés
router.post('/', async (req, res) => {
    try {
        const punto = await PuntoInteres.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Punto de interés creado correctamente',
            data: punto
        });
    } catch (error) {
        console.error('Error al crear punto de interés:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear punto de interés',
            error: error.message
        });
    }
});

// POST /api/puntos/batch - Crear múltiples puntos de interés
router.post('/batch', async (req, res) => {
    try {
        const { puntos } = req.body;

        if (!puntos || !Array.isArray(puntos) || puntos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de puntos de interés'
            });
        }

        const resultados = [];
        const errores = [];

        for (let i = 0; i < puntos.length; i++) {
            try {
                const punto = await PuntoInteres.create(puntos[i]);
                resultados.push(punto);
            } catch (error) {
                errores.push({
                    index: i,
                    punto: puntos[i].nombre || 'Sin nombre',
                    error: error.message
                });
            }
        }

        res.status(201).json({
            success: true,
            message: `${resultados.length} puntos de interés creados correctamente`,
            count: resultados.length,
            data: resultados,
            errors: errores.length > 0 ? errores : undefined
        });
    } catch (error) {
        console.error('Error al crear puntos de interés en batch:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear puntos de interés en batch',
            error: error.message
        });
    }
});

// PUT /api/puntos/:id - Actualizar punto de interés
router.put('/:id', async (req, res) => {
    try {
        const punto = await PuntoInteres.update(req.params.id, req.body);
        if (!punto) {
            return res.status(404).json({
                success: false,
                message: 'Punto de interés no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Punto de interés actualizado correctamente',
            data: punto
        });
    } catch (error) {
        console.error('Error al actualizar punto de interés:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar punto de interés',
            error: error.message
        });
    }
});

// DELETE /api/puntos/:id - Eliminar punto de interés
router.delete('/:id', async (req, res) => {
    try {
        const punto = await PuntoInteres.delete(req.params.id);
        if (!punto) {
            return res.status(404).json({
                success: false,
                message: 'Punto de interés no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Punto de interés eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar punto de interés:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar punto de interés',
            error: error.message
        });
    }
});

// GET /api/puntos/categorias - Obtener todas las categorías
router.get('/meta/categorias', async (req, res) => {
    try {
        const categorias = await PuntoInteres.getCategorias();
        res.json({
            success: true,
            data: categorias
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
            error: error.message
        });
    }
});

module.exports = router;
