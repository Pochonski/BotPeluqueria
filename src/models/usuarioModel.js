const db = require('../config/db');

class UsuarioModel {
    static async findByTelefono(telefono) {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE telefono = ?', [telefono]);
        return rows[0];
    }

    static async create(nombre, telefono, rol = 'cliente') {
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, telefono, rol) VALUES (?, ?, ?)',
            [nombre, telefono, rol]
        );
        return result.insertId;
    }
}

module.exports = UsuarioModel;
