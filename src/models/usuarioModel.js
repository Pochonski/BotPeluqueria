const db = require('../config/db');

class UsuarioModel {
    static async findByTelefono(telefono) {
        const { rows } = await db.query('SELECT * FROM usuarios WHERE telefono = $1', [telefono]);
        return rows[0];
    }

    static async create(nombre, telefono, rol = 'cliente') {
        const { rows } = await db.query(
            'INSERT INTO usuarios (nombre, telefono, rol) VALUES ($1, $2, $3) RETURNING id',
            [nombre, telefono, rol]
        );
        return rows[0].id;
    }
}

module.exports = UsuarioModel;
