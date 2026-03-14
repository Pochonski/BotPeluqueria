const { Pool } = require('pg');
require('dotenv').config();

const config = process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(config);

// Wrapper para simular el comportamiento de mysql2.query que usábamos
const query = async (text, params) => {
    try {
        return await pool.query(text, params);
    } catch (err) {
        console.error('❌ SQL Error:', {
            text,
            params,
            error: err.message
        });
        throw err;
    }
};

// Verificar conexión al inicio
pool.connect()
    .then(client => {
        console.log('✅ Conectado a la base de datos PostgreSQL');
        client.release();
    })
    .catch(err => {
        console.error('❌ Error fatal conectando a PostgreSQL:', err.message);
        console.error('DATABASE_URL presente:', !!process.env.DATABASE_URL);
    });

module.exports = {
    query,
    pool, // Por si necesitamos transacciones
    getConnection: () => pool.connect()
};
