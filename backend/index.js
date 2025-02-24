require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const turnosRoutes = require('./routes/turnosRoutes');
const barberosRoutes = require('./routes/barberosRoutes');
const app = express();

// 📌 1️⃣ Habilitar CORS antes de definir las rutas
app.use(cors({
    origin: 'http://localhost:5173',  // Permitir solicitudes desde el frontend
    credentials: true,
}));

// 📌 2️⃣ Middleware para leer JSON
app.use(express.json());

// 📌 3️⃣ Definir rutas
app.use('/api/auth', authRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/barberos', barberosRoutes);

// 📌 4️⃣ Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});