const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Obtener todos los turnos (filtrados por barbero si se envía `barbero_id`)
router.get('/', async (req, res) => {
    try {
        const { barbero_id } = req.query;
        let query = 'SELECT id, barbero_id, cliente_nombre, cliente_telefono, DATE_FORMAT(fecha, "%Y-%m-%d") AS fecha, TIME_FORMAT(hora, "%H:%i") AS hora, estado FROM turnos';
        let params = [];

        if (barbero_id) {
            query += ' WHERE barbero_id = ?';
            params.push(barbero_id);
        }

        const [result] = await pool.query(query, params);

        // 🔥 Mantener fecha y hora como strings sin transformación UTC
        const turnos = result.map(turno => ({
            id: turno.id,
            barbero_id: turno.barbero_id,
            cliente_nombre: turno.cliente_nombre,
            cliente_telefono: turno.cliente_telefono,
            cliente_fecha: turno.fecha, // Ya viene como "YYYY-MM-DD"
            cliente_hora: turno.hora,   // Ya viene como "HH:mm"
            estado: turno.estado
        }));

        res.json(turnos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los turnos' });
    }
});


// Crear un nuevo turno
router.post('/', async (req, res) => {
    const { barbero_id, cliente_nombre, cliente_telefono, fecha, hora } = req.body;

    if (!fecha || !hora) {
        return res.status(400).json({ message: 'Fecha y hora son requeridas' });
    }

    try {
        await pool.query(
            'INSERT INTO turnos (barbero_id, cliente_nombre, cliente_telefono, fecha, hora) VALUES (?, ?, ?, ?, ?)',
            [barbero_id, cliente_nombre, cliente_telefono, fecha, hora]
        );
        res.status(201).json({ message: 'Turno creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el turno' });
    }
});

// Actualizar el estado del turno
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { estado, cliente_fecha, cliente_hora } = req.body;
    
    try {
        await pool.query('UPDATE turnos SET estado = ?, fecha = ?, hora = ? WHERE id = ?', 
            [estado, cliente_fecha, cliente_hora, id]
        );
        res.json({ message: 'Turno actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el turno' });
    }
});


// Eliminar un turno
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM turnos WHERE id = ?', [id]);
        res.json({ message: 'Turno eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el turno' });
    }
});

module.exports = router;
