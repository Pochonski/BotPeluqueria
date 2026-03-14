const db = require('../config/db');

class AdminModel {
    static async getCitasHoy(fecha) {
        const { rows } = await db.query(`
            SELECT c.*, u.nombre as cliente_nombre, u.telefono as cliente_telefono,
            STRING_AGG(s.nombre, \', \') as servicios
            FROM citas c
            JOIN usuarios u ON c.cliente_id = u.id
            JOIN cita_servicios cs ON c.id = cs.cita_id
            JOIN servicios s ON cs.servicio_id = s.id
            WHERE c.fecha = $1
            GROUP BY c.id, u.nombre, u.telefono
            ORDER BY c.hora_inicio ASC
        `, [fecha]);
        return rows;
    }

    static async updateEstadoCita(id, estado) {
        await db.query('UPDATE citas SET estado = $1 WHERE id = $2', [estado, id]);
    }

    // Gestión de Servicios
    static async getServiciosAdmin() {
        const { rows } = await db.query('SELECT * FROM servicios');
        return rows;
    }

    static async updateServicio(id, { nombre, duracion, precio, activo }) {
        await db.query(
            'UPDATE servicios SET nombre = $1, duracion = $2, precio = $3, activo = $4 WHERE id = $5',
            [nombre, duracion, precio, activo, id]
        );
    }

    static async createServicio({ nombre, duracion, precio }) {
        await db.query(
            'INSERT INTO servicios (nombre, duracion, precio) VALUES ($1, $2, $3)',
            [nombre, duracion, precio]
        );
    }

    // Gestión de Horarios
    static async getHorariosAdmin() {
        const { rows } = await db.query('SELECT * FROM configuracion_negocio ORDER BY dia_semana ASC');
        return rows;
    }

    static async updateHorario(id, { hora_apertura, hora_cierre, lunch_inicio, lunch_fin, activo }) {
        await db.query(
            'UPDATE configuracion_negocio SET hora_apertura = $1, hora_cierre = $2, lunch_inicio = $3, lunch_fin = $4, activo = $5 WHERE id = $6',
            [hora_apertura, hora_cierre, lunch_inicio, lunch_fin, activo, id]
        );
    }

    // Gestión de Bloqueos Puntuales
    static async getBloqueos() {
        const { rows } = await db.query('SELECT * FROM bloqueos WHERE fecha >= CURRENT_DATE ORDER BY fecha ASC, hora_inicio ASC');
        return rows;
    }

    static async createBloqueo({ fecha, hora_inicio, hora_fin, motivo }) {
        await db.query(
            'INSERT INTO bloqueos (fecha, hora_inicio, hora_fin, motivo) VALUES ($1, $2, $3, $4)',
            [fecha, hora_inicio, hora_fin, motivo]
        );
    }

    static async deleteBloqueo(id) {
        await db.query('DELETE FROM bloqueos WHERE id = $1', [id]);
    }

    // Obtener bloqueos de hoy para la agenda
    static async getBloqueosHoy(fecha = null) {
        const f = fecha || 'CURRENT_DATE';
        const queryStr = fecha 
            ? 'SELECT *, \'bloqueo\' as tipo FROM bloqueos WHERE fecha = $1'
            : 'SELECT *, \'bloqueo\' as tipo FROM bloqueos WHERE fecha = CURRENT_DATE';
        const params = fecha ? [fecha] : [];
        const { rows } = await db.query(queryStr, params);
        return rows;
    }

    static async getReporteSemanal() {
        const { rows } = await db.query(`
            SELECT c.fecha, COUNT(*) as total_citas, SUM(c.total) as ingresos
            FROM citas c
            WHERE c.fecha BETWEEN CURRENT_DATE - INTERVAL \'7 days\' AND CURRENT_DATE
            GROUP BY c.fecha
        `);
        return rows;
    }
}

module.exports = AdminModel;
