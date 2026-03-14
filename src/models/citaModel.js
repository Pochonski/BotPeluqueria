const db = require('../config/db');

class CitaModel {
    static async getByFecha(fecha) {
        const [rows] = await db.query(
            'SELECT * FROM citas WHERE fecha = ? AND estado NOT IN ("cancelada")',
            [fecha]
        );
        return rows;
    }

    static async getBloqueosByFecha(fecha) {
        const [rows] = await db.query(
            'SELECT * FROM bloqueos WHERE fecha = ?',
            [fecha]
        );
        return rows;
    }

    static async getHorariosNegocio(diaSemana) {
        const [rows] = await db.query(
            'SELECT * FROM configuracion_negocio WHERE dia_semana = ? AND activo = TRUE',
            [diaSemana]
        );
        return rows[0];
    }

    static async create(clienteId, fecha, horaInicio, horaFin, total, serviciosIds) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insertar la cita
            const [result] = await connection.query(
                'INSERT INTO citas (cliente_id, fecha, hora_inicio, hora_fin, total) VALUES (?, ?, ?, ?, ?)',
                [clienteId, fecha, horaInicio, horaFin, total]
            );
            const citaId = result.insertId;

            // 2. Insertar los servicios de la cita
            for (const servicioId of serviciosIds) {
                await connection.query(
                    'INSERT INTO cita_servicios (cita_id, servicio_id) VALUES (?, ?)',
                    [citaId, servicioId]
                );
            }

            await connection.commit();
            return citaId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = CitaModel;
