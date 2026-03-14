const CitaModel = require('../models/citaModel');
const ServicioModel = require('../models/servicioModel');

/**
 * Calcula los huecos disponibles para una fecha y servicios específicos.
 * Se separa del controlador para ser usado por el bot de WhatsApp.
 */
async function calcularDisponibilidad(fecha, serviciosIds) {
    // 1. Calcular duración total
    let duracionTotal = 0;
    for (const id of serviciosIds) {
        const svc = await ServicioModel.getById(id);
        if (svc) duracionTotal += svc.duracion;
    }

    // 2. Obtener horario del negocio
    const dateObj = new Date(fecha);
    const diaSemana = dateObj.getUTCDay(); // 0-6
    const horario = await CitaModel.getHorariosNegocio(diaSemana);

    if (!horario) return []; // Cerrado

    // 3. Obtener citas y bloqueos
    const citasExistentes = await CitaModel.getByFecha(fecha);
    const bloqueosExistentes = await CitaModel.getBloqueosByFecha(fecha);

    // 4. Generar slots
    const slots = [];
    let start = new Date(`${fecha}T${horario.hora_apertura}`);
    const end = new Date(`${fecha}T${horario.hora_cierre}`);

    while (start.getTime() + duracionTotal * 60000 <= end.getTime()) {
        const slotStart = start.toTimeString().substring(0, 5);
        const slotEnd = new Date(start.getTime() + duracionTotal * 60000).toTimeString().substring(0, 5);

        const isOcupado = citasExistentes.some(cita => {
            return (slotStart < cita.hora_fin) && (slotEnd > cita.hora_inicio);
        });

        let isLunch = false;
        if (horario.lunch_inicio && horario.lunch_fin) {
            isLunch = (slotStart < horario.lunch_fin) && (slotEnd > horario.lunch_inicio);
        }

        const isBloqueado = bloqueosExistentes.some(bloq => {
            return (slotStart < bloq.hora_fin) && (slotEnd > bloq.hora_inicio);
        });

        if (!isOcupado && !isLunch && !isBloqueado) {
            const now = new Date();
            const slotDateTime = new Date(`${fecha}T${slotStart}`);
            const minTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora de anticipación

            if (slotDateTime > minTime) {
                slots.push(slotStart);
            }
        }
        start = new Date(start.getTime() + 30 * 60000); // Avanzar 30 min
    }

    return slots;
}

module.exports = {
    calcularDisponibilidad
};
