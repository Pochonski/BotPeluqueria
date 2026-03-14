const CitaModel = require('../models/citaModel');
const ServicioModel = require('../models/servicioModel');
const UsuarioModel = require('../models/usuarioModel');

const { calcularDisponibilidad } = require('../utils/appointmentUtils');

const getDisponibilidad = async (req, res) => {
    try {
        const { fecha, serviciosIds } = req.query;
        if (!fecha || !serviciosIds) return res.status(400).json({ message: 'Faltan datos' });

        const ids = serviciosIds.split(',').map(Number);
        const slots = await calcularDisponibilidad(fecha, ids);

        res.json(slots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al calcular disponibilidad' });
    }
};

const crearCita = async (req, res) => {
    try {
        const { nombre, telefono, fecha, horaInicio, serviciosIds } = req.body;

        // 1. Obtener o crear usuario
        let usuario = await UsuarioModel.findByTelefono(telefono);
        if (!usuario) {
            const userId = await UsuarioModel.create(nombre, telefono);
            usuario = { id: userId };
        }

        // 2. Calcular hora fin y precio total
        let duracionTotal = 0;
        let precioTotal = 0;
        for (const id of serviciosIds) {
            const svc = await ServicioModel.getById(id);
            if (svc) {
                duracionTotal += svc.duracion;
                precioTotal += parseFloat(svc.precio);
            }
        }

        const startParts = horaInicio.split(':');
        const startDateTime = new Date(`${fecha}T${horaInicio}`);
        const endDateTime = new Date(startDateTime.getTime() + duracionTotal * 60000);
        const horaFin = endDateTime.toTimeString().substring(0, 5);

        // 3. Guardar cita
        const citaId = await CitaModel.create(
            usuario.id,
            fecha,
            horaInicio,
            horaFin,
            precioTotal,
            serviciosIds
        );

        res.json({ message: 'Cita creada con éxito', citaId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la cita' });
    }
};

module.exports = {
    getDisponibilidad,
    crearCita
};
