const db = require('../config/db');

class AdminModel {
    static async getCitasHoy(fecha) {
        const [rows] = await db.query(`
            SELECT c.*, u.nombre as cliente_nombre, u.telefono as cliente_telefono,
            GROUP_CONCAT(s.nombre SEPARATOR ', ') as servicios
            FROM citas c
            JOIN usuarios u ON c.cliente_id = u.id
            JOIN cita_servicios cs ON c.id = cs.cita_id
            JOIN servicios s ON cs.servicio_id = s.id
            WHERE c.fecha = ?
            GROUP BY c.id
            ORDER BY c.hora_inicio ASC
        `, [fecha]);
        return rows;
    }

    static async updateEstadoCita(id, estado) {
        await db.query('UPDATE citas SET estado = ? WHERE id = ?', [estado, id]);
    }

    // Gestión de Servicios
    static async getServiciosAdmin() {
        const [rows] = await db.query('SELECT * FROM servicios');
        return rows;
    }

    static async updateServicio(id, { nombre, duracion, precio, activo }) {
        await db.query(
            'UPDATE servicios SET nombre = ?, duracion = ?, precio = ?, activo = ? WHERE id = ?',
            [nombre, duracion, precio, activo, id]
        );
    }

    static async createServicio({ nombre, duracion, precio }) {
        await db.query(
            'INSERT INTO servicios (nombre, duracion, precio) VALUES (?, ?, ?)',
            [nombre, duracion, precio]
        );
    }

    // Gestión de Horarios
    static async getHorariosAdmin() {
        const [rows] = await db.query('SELECT * FROM configuracion_negocio ORDER BY dia_semana ASC');
        return rows;
    }

    static async updateHorario(id, { hora_apertura, hora_cierre, lunch_inicio, lunch_fin, activo }) {
        await db.query(
            'UPDATE configuracion_negocio SET hora_apertura = ?, hora_cierre = ?, lunch_inicio = ?, lunch_fin = ?, activo = ? WHERE id = ?',
            [hora_apertura, hora_cierre, lunch_inicio, lunch_fin, activo, id]
        );
    }

    // Gestión de Bloqueos Puntuales
    static async getBloqueos() {
        const [rows] = await db.query('SELECT * FROM bloqueos WHERE fecha >= CURDATE() ORDER BY fecha ASC, hora_inicio ASC');
        return rows;
    }

    static async createBloqueo({ fecha, hora_inicio, hora_fin, motivo }) {
        await db.query(
            'INSERT INTO bloqueos (fecha, hora_inicio, hora_fin, motivo) VALUES (?, ?, ?, ?)',
            [fecha, hora_inicio, hora_fin, motivo]
        );
    }

    static async deleteBloqueo(id) {
        await db.query('DELETE FROM bloqueos WHERE id = ?', [id]);
    }

    // Obtener bloqueos de hoy para la agenda
    static async getBloqueosHoy() {
        const [rows] = await db.query('SELECT *, "bloqueo" as tipo FROM bloqueos WHERE fecha = CURDATE()');
        return rows;
    }

    static async getReporteSemanal() {
        const [rows] = await db.query(`
            SELECT c.fecha, COUNT(*) as total_citas, SUM(c.total) as ingresos
            FROM citas c
            WHERE c.fecha BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE()
            GROUP BY c.fecha
        `);
        return rows;
    }
}

module.exports = AdminModel;
