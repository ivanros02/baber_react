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

module.exports = router;