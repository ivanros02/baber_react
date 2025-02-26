import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { EventClickArg } from '@fullcalendar/core';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { FaPlusCircle } from "react-icons/fa";
import '../styles/calendar.css'; // Archivo CSS para estilos personalizados

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
    const [modalCrearOpen, setModalCrearOpen] = useState(false);
    const [nuevoTurno, setNuevoTurno] = useState({ barbero_id: '', cliente_nombre: '', cliente_telefono: '', fecha: '', hora: '' });
    const [modalAgregarBarberoOpen, setModalAgregarBarberoOpen] = useState(false);
    const [nuevoBarbero, setNuevoBarbero] = useState({
        barbero_nombre: "",
        barbero_telefono: "",
    });
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const [vistaCalendario, setVistaCalendario] = useState<string>(
        window.innerWidth < 1000 ? "timeGridDay" : "timeGridWeek"
    );

    useEffect(() => {
        const actualizarVista = () => {
            setVistaCalendario(window.innerWidth < 1000 ? "timeGridDay" : "timeGridWeek");
        };

        window.addEventListener("resize", actualizarVista);

        return () => window.removeEventListener("resize", actualizarVista);
    }, []);


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

    const handleCrearTurno = async () => {
        // Validar que todos los campos estén completos
        if (!nuevoTurno.barbero_id || !nuevoTurno.cliente_nombre || !nuevoTurno.cliente_telefono || !nuevoTurno.fecha || !nuevoTurno.hora) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        try {
            // Convertir barbero_id a número
            const turnoData = {
                ...nuevoTurno,
                barbero_id: Number(nuevoTurno.barbero_id),
            };

            await axios.post('http://localhost:5000/api/turnos', turnoData);
            setModalCrearOpen(false);
            fetchTurnos(); // Recargar la lista de turnos
        } catch (error) {
            console.error('Error al crear el turno:', error);
        }
    };

    // Función para manejar la creación del barbero
    const handleAgregarBarbero = async () => {
        if (!nuevoBarbero.barbero_nombre || !nuevoBarbero.barbero_telefono) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/barberos", nuevoBarbero);
            setModalAgregarBarberoOpen(false);
            setNuevoBarbero({ barbero_nombre: "", barbero_telefono: "" }); // Resetear formulario
            fetchBarberos(); // Recargar la lista de barberos
            alert("Barbero agregado exitosamente");
        } catch (error) {
            console.error("Error al agregar el barbero:", error);
        }
    };

    const handleActualizarTurno = async () => {
        if (!selectedTurno) return;

        try {
            await axios.put(`http://localhost:5000/api/turnos/${selectedTurno.id}`, {
                estado: selectedTurno.estado,
                cliente_fecha: selectedTurno.cliente_fecha,
                cliente_hora: selectedTurno.cliente_hora
            });

            alert("Turno actualizado exitosamente");
            setModalOpen(false);
            fetchTurnos(); // Recargar la lista de turnos
        } catch (error) {
            console.error("Error al actualizar el turno:", error);
            alert("Hubo un error al actualizar el turno");
        }
    };



    return (
        <Container fluid className="p-4 calendar-container">
            <h2 className="text-center fw-bold mb-4 title">Calendario de Turnos</h2>
            <Row className="mb-3">
                <Row className="mb-3 d-flex justify-content-start gap-2">
                    <Col xs="auto">
                        <Button
                            variant="success"
                            onClick={() => setModalCrearOpen(true)}
                            className="shadow-sm d-flex align-items-center justify-content-center gap-2 create-button"
                            style={{ maxWidth: "160px", fontSize: "14px", padding: "8px 12px" }}
                        >
                            <FaPlusCircle size={16} />
                            Crear Turno
                        </Button>
                    </Col>

                    <Col xs="auto">
                        <Button
                            variant="primary"
                            onClick={() => setModalAgregarBarberoOpen(true)} // Nueva función para abrir el modal de barberos
                            className="shadow-sm d-flex align-items-center justify-content-center gap-2 create-button"
                            style={{ maxWidth: "160px", fontSize: "14px", padding: "8px 12px" }}
                        >
                            <FaPlusCircle size={16} />
                            Agregar Barbero
                        </Button>
                    </Col>
                </Row>


                <Col md={8}>
                    <Form.Select onChange={handleBarberoChange} value={barberoSeleccionado} className="w-100 select-barbero">
                        <option value="todos">Todos los Barberos</option>
                        {barberos.map(barbero => (
                            <option key={barbero.id} value={barbero.id}>{barbero.nombre}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {/* CALENDARIO */}
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={vistaCalendario}  // Se actualizará correctamente en móviles
                key={vistaCalendario} // 🔹 Se fuerza un nuevo render al cambiar la vista
                events={eventosCalendario}
                eventClick={handleEventClick}
                locale={esLocale}
                height="auto"
                slotMinTime="07:00:00"
                slotMaxTime="23:00:00"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
            />


            {/* FIN CALENDARIO */}

            {/* Detalle y edicion del turno */}
            <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Turno</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTurno && (
                        <>
                            <Form>
                                {/* Cliente */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Cliente</Form.Label>
                                    <Form.Control type="text" value={selectedTurno.cliente_nombre} disabled />
                                </Form.Group>

                                {/* Teléfono */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control type="text" value={selectedTurno.cliente_telefono} disabled />
                                </Form.Group>

                                {/* Fecha */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={selectedTurno.cliente_fecha}
                                        onChange={(e) => setSelectedTurno({ ...selectedTurno, cliente_fecha: e.target.value })}
                                    />
                                </Form.Group>

                                {/* Hora */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Hora</Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={selectedTurno.cliente_hora}
                                        onChange={(e) => setSelectedTurno({ ...selectedTurno, cliente_hora: e.target.value })}
                                    />
                                </Form.Group>

                                {/* Estado */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select
                                        value={selectedTurno.estado}
                                        onChange={(e) => setSelectedTurno({ ...selectedTurno, estado: e.target.value })}
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="confirmado">Confirmado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </Form.Select>
                                </Form.Group>
                            </Form>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalOpen(false)}>Cerrar</Button>
                    <Button variant="primary" onClick={handleActualizarTurno}>Guardar Cambios</Button>
                </Modal.Footer>
            </Modal>
            {/* FIN Detalle y edicion del turno */}


            {/* Modal Crear Turno */}
            <Modal show={modalCrearOpen} onHide={() => setModalCrearOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Turno</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Seleccionar Barbero */}
                        <Form.Group className="mb-3">
                            <Form.Label>Seleccionar Barbero</Form.Label>
                            <Form.Select
                                value={nuevoTurno.barbero_id}
                                onChange={(e) => setNuevoTurno({ ...nuevoTurno, barbero_id: e.target.value })}
                            >
                                <option value="">Seleccione un barbero</option>
                                {barberos.map(barbero => (
                                    <option key={barbero.id} value={barbero.id}>{barbero.nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Nombre del Cliente */}
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre del Cliente</Form.Label>
                            <Form.Control
                                type="text"
                                value={nuevoTurno.cliente_nombre}
                                onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_nombre: e.target.value })}
                            />
                        </Form.Group>

                        {/* Teléfono del Cliente */}
                        <Form.Group className="mb-3">
                            <Form.Label>Teléfono del Cliente</Form.Label>
                            <Form.Control
                                type="tel"
                                value={nuevoTurno.cliente_telefono}
                                onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_telefono: e.target.value })}
                            />
                        </Form.Group>

                        {/* Fecha del Turno */}
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha del Turno</Form.Label>
                            <Form.Control
                                type="date"
                                value={nuevoTurno.fecha}
                                onChange={(e) => setNuevoTurno({ ...nuevoTurno, fecha: e.target.value })}
                            />
                        </Form.Group>

                        {/* Hora del Turno */}
                        <Form.Group className="mb-3">
                            <Form.Label>Hora del Turno</Form.Label>
                            <Form.Control
                                type="time"
                                value={nuevoTurno.hora}
                                onChange={(e) => setNuevoTurno({ ...nuevoTurno, hora: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalCrearOpen(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleCrearTurno}>Crear</Button>
                </Modal.Footer>
            </Modal>
            {/* FIN Modal Crear Turno */}

            {/* Modal Agregar Barbero */}
            <Modal show={modalAgregarBarberoOpen} onHide={() => setModalAgregarBarberoOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Agregar Barbero</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Nombre del Barbero */}
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre del Barbero</Form.Label>
                            <Form.Control
                                type="text"
                                value={nuevoBarbero.barbero_nombre}
                                onChange={(e) => setNuevoBarbero({ ...nuevoBarbero, barbero_nombre: e.target.value })}
                            />
                        </Form.Group>

                        {/* Teléfono del Barbero */}
                        <Form.Group className="mb-3">
                            <Form.Label>Teléfono del Barbero</Form.Label>
                            <Form.Control
                                type="tel"
                                value={nuevoBarbero.barbero_telefono}
                                onChange={(e) => setNuevoBarbero({ ...nuevoBarbero, barbero_telefono: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalAgregarBarberoOpen(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleAgregarBarbero}>Agregar</Button>
                </Modal.Footer>
            </Modal>
            {/* FIN Modal Agregar Barbero */}
        </Container>
    );
};

export default CalendarPage;
