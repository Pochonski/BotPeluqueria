const AdminModel = require('../models/adminModel');

const getDashboardData = async (req, res) => {
    try {
        const { fecha } = req.query;
        // Obtener fecha local de Costa Rica si no viene en el query
        const hoy = fecha || new Date().toLocaleDateString('en-CA'); // en-CA da formato YYYY-MM-DD
        
        const citas = await AdminModel.getCitasHoy(hoy);
        const bloqueos = await AdminModel.getBloqueosHoy(hoy);
        
        // Marcar las citas como tipo "cita" para diferenciarlas
        const citasMarcadas = citas.map(c => ({ ...c, tipo: 'cita' }));
        
        // Unir y ordenar por hora
        const agenda = [...citasMarcadas, ...bloqueos].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
        
        res.json({ agenda, fechaCargada: hoy });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener datos del dashboard' });
    }
};

const cambiarEstadoCita = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!id || id === 'null' || isNaN(id)) {
            return res.status(400).json({ message: 'ID de cita inválido' });
        }

        await AdminModel.updateEstadoCita(id, estado);
        res.json({ message: 'Estado actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar estado' });
    }
};

// --- SERVICIOS ---

const getServiciosAdmin = async (req, res) => {
    try {
        const servicios = await AdminModel.getServiciosAdmin();
        res.json(servicios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener servicios' });
    }
};

const guardarServicio = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === 'nuevo') {
            await AdminModel.createServicio(req.body);
        } else {
            await AdminModel.updateServicio(id, req.body);
        }
        res.json({ message: 'Servicio guardado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar servicio' });
    }
};

// --- HORARIOS ---

const getHorariosAdmin = async (req, res) => {
    try {
        const horarios = await AdminModel.getHorariosAdmin();
        res.json(horarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener horarios' });
    }
};

const actualizarHorario = async (req, res) => {
    try {
        const { id } = req.params;
        await AdminModel.updateHorario(id, req.body);
        res.json({ message: 'Horario actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar horario' });
    }
};

// --- BLOQUEOS ---

const getBloqueos = async (req, res) => {
    try {
        const bloqueos = await AdminModel.getBloqueos();
        res.json(bloqueos);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};

const crearBloqueo = async (req, res) => {
    try {
        await AdminModel.createBloqueo(req.body);
        res.json({ message: 'Bloqueo creado' });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};

const eliminarBloqueo = async (req, res) => {
    try {
        const { id } = req.params;
        await AdminModel.deleteBloqueo(id);
        res.json({ message: 'Bloqueo eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};

module.exports = {
    getDashboardData,
    cambiarEstadoCita,
    getServiciosAdmin,
    guardarServicio,
    getHorariosAdmin,
    actualizarHorario,
    getBloqueos,
    crearBloqueo,
    eliminarBloqueo
};
