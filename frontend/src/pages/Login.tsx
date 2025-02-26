import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Limpiar errores previos

        try {
            if (auth) {
                const success = await auth.login(username, password);
                if (success) {
                    navigate('/calendar');
                } else {
                    setError('Usuario o contraseña incorrectos');
                }
            }
        } catch (err) {
            setError('Error al iniciar sesión');
        }
    };


    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#F2EDDC' }}>
            <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#594F31', border: 'none' }}>
                {/* Logo */}
                <div className="text-center mb-4">
                    <img
                        src="../src/assets/logo.png" // Cambia esto por la ruta de tu logo
                        alt="Logo"
                        style={{ width: '80px', height: 'auto' }} // Ajusta el tamaño del logo
                    />
                </div>

                <h2 className="text-center mb-4" style={{ color: '#F2EDDC' }}>Inicio de Sesión</h2>
                {error && <p className="text-center mb-3" style={{ color: '#FF6B6B' }}>{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <input
                            type="text"
                            placeholder="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-control"
                            style={{ backgroundColor: '#F2EDDC', border: '1px solid #8C742B', color: '#0D0A08' }}
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control"
                            style={{ backgroundColor: '#F2EDDC', border: '1px solid #8C742B', color: '#0D0A08' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn w-100"
                        style={{ backgroundColor: '#8C742B', color: '#F2EDDC', border: 'none' }}
                    >
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;