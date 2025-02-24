import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        auth?.logout();
        navigate('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
                <h2 className="text-2xl font-bold mb-4">Panel de Administrador</h2>
                <p>Bienvenido, administrador</p>
                <button 
                    onClick={handleLogout} 
                    className="mt-4 bg-red-500 text-white p-2 rounded w-full">
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
