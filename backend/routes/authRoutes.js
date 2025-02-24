const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Ruta para el inicio de sesión
router.post('/login', login);

module.exports = router;
