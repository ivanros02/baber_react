const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Obtener todos los barberos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM barberos');
        res.json(result[0]); // 🔥 Solo devuelve la primera parte, que es el array de barberos

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los barberos' });
    }
});

// Crear un nuevo Barbero
router.post('/', async (req, res) => {
    const { barbero_nombre, barber_telefono } = req.body;

    if (!barbero_nombre) {
        return res.status(400).json({ message: 'El nombre del barbero es requerido' });
    }

    try {
        await pool.query(
            'INSERT INTO barberos (nombre, telefono) VALUES (?, ?)',
            [barbero_nombre,barber_telefono]
        );
        res.status(201).json({ message: 'Barbero creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el Barbero' });
    }
});

module.exports = router;