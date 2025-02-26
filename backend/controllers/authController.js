const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const [admin] = await db.execute('SELECT * FROM admin WHERE username = ?', [username]);

        if (admin.length === 0) {
            console.log('Usuario no encontrado');
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const validPassword = await bcrypt.compare(password, admin[0].password_hash);
        if (!validPassword) {
            console.log('Contraseña incorrecta');
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: admin[0].id, username: admin[0].username },
            process.env.JWT_SECRET,
            { expiresIn: '6h' }
        );

        console.log('Autenticación exitosa');
        res.json({ token });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};


module.exports = { login };
