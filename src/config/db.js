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
const query = (text, params) => pool.query(text, params);

// Verificar conexión al inicio
pool.connect()
    .then(client => {
        console.log('✅ Conectado a la base de datos PostgreSQL');
        client.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a PostgreSQL:', err);
    });

module.exports = {
    query,
    pool, // Por si necesitamos transacciones
    getConnection: () => pool.connect()
};
