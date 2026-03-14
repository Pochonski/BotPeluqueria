const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setup() {
    try {
        console.log('⏳ Leyendo archivo database.sql...');
        const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
        
        console.log('🚀 Ejecutando script en la base de datos...');
        await pool.query(sql);
        
        console.log('✅ ¡Todo listo! Todas las tablas y datos iniciales se crearon correctamente.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error configurando la base de datos:', err);
        process.exit(1);
    }
}

setup();
