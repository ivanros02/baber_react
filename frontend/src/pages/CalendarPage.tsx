import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { EventClickArg } from '@fullcalendar/core';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

type Turno = {
    id: string;
    barbero_id: number;
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_fecha: string;
    cliente_hora: string;
    estado: string;
};

type Barbero = {
    id: number;
    nombre: string;
};

const CalendarPage = () => {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [eventosCalendario, setEventosCalendario] = useState<any[]>([]);
    const [barberos, setBarberos] = useState<Barbero[]>([]);
    const [barberoSeleccionado, setBarberoSeleccionado] = useState<number | 'todos'>('todos');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth?.token) {
            navigate('/login');
        } else {
            fetchBarberos();
            fetchTurnos();
        }
    }, [auth, navigate]);

    const fetchBarberos = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/barberos');
            setBarberos(response.data);
        } catch (error) {
            console.error('Error al obtener los barberos:', error);
        }
    };

    const fetchTurnos = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/turnos');
            setTurnos(response.data);
            filtrarTurnos(response.data, barberoSeleccionado);
        } catch (error) {
            console.error('Error al obtener los turnos:', error);
        }
    };

    const filtrarTurnos = (turnos: Turno[], barberoId: number | 'todos') => {
        const turnosFiltrados = barberoId === 'todos' ? turnos : turnos.filter(turno => turno.barbero_id === barberoId);

        const formattedEvents = turnosFiltrados.map((turno: Turno) => {
            const start = new Date(`${turno.cliente_fecha}T${turno.cliente_hora}`);
            const end = new Date(start);
            end.setHours(start.getHours() + 1);
            
            return {
                id: String(turno.id),
                title: `${turno.cliente_nombre} - ${turno.estado}`,
                start: start.toISOString(),
                end: end.toISOString(),
                allDay: false,
                extendedProps: turno,
            };
        });
        
        setEventosCalendario(formattedEvents);
    };

    const handleEventClick = (eventInfo: EventClickArg) => {
        const turno = eventInfo.event.extendedProps as Turno;
        setSelectedTurno(turno);
        setModalOpen(true);
    };

    const handleBarberoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value === 'todos' ? 'todos' : parseInt(event.target.value);
        setBarberoSeleccionado(value);
        filtrarTurnos(turnos, value);
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Calendario de Turnos</h2>
            
            <select className="form-select mb-4" onChange={handleBarberoChange} value={barberoSeleccionado}>
                <option value="todos">Todos los Barberos</option>
                {barberos.map(barbero => (
                    <option key={barbero.id} value={barbero.id}>{barbero.nombre}</option>
                ))}
            </select>

            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                events={eventosCalendario}
                eventClick={handleEventClick}
                height="auto"
            />

            <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Turno</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTurno && (
                        <>
                            <p><strong>Cliente:</strong> {selectedTurno.cliente_nombre}</p>
                            <p><strong>Fecha:</strong> {selectedTurno.cliente_fecha}</p>
                            <p><strong>Hora:</strong> {selectedTurno.cliente_hora}</p>
                            <p><strong>Teléfono:</strong> {selectedTurno.cliente_telefono}</p>
                            <p><strong>Estado:</strong> {selectedTurno.estado}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalOpen(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CalendarPage;
