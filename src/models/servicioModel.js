const db = require('../config/db');

class ServicioModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM servicios WHERE activo = TRUE');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM servicios WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = ServicioModel;
