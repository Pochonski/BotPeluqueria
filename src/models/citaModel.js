const db = require('../config/db');

class CitaModel {
    static async getByFecha(fecha) {
        const { rows } = await db.query(
            'SELECT * FROM citas WHERE fecha = $1 AND estado NOT IN (\'cancelada\')',
            [fecha]
        );
        return rows;
    }

    static async getBloqueosByFecha(fecha) {
        const { rows } = await db.query(
            'SELECT * FROM bloqueos WHERE fecha = $1',
            [fecha]
        );
        return rows;
    }

    static async getHorariosNegocio(diaSemana) {
        const { rows } = await db.query(
            'SELECT * FROM configuracion_negocio WHERE dia_semana = $1 AND activo = TRUE',
            [diaSemana]
        );
        return rows[0];
    }

    static async create(clienteId, fecha, horaInicio, horaFin, total, serviciosIds) {
        const client = await db.getConnection();
        try {
            await client.query('BEGIN');

            // 1. Insertar la cita
            const res = await client.query(
                'INSERT INTO citas (cliente_id, fecha, hora_inicio, hora_fin, total) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [clienteId, fecha, horaInicio, horaFin, total]
            );
            const citaId = res.rows[0].id;

            // 2. Insertar los servicios de la cita
            for (const servicioId of serviciosIds) {
                await client.query(
                    'INSERT INTO cita_servicios (cita_id, servicio_id) VALUES ($1, $2)',
                    [citaId, servicioId]
                );
            }

            await client.query('COMMIT');
            return citaId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = CitaModel;
