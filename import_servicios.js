const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const servicios = [
    ['Corte de Cabello', 7000, 40],
    ['Barba', 4000, 20],
    ['Combo (Corte + Barba)', 10000, 60],
    ['Corte Niño', 6000, 30],
    ['Cejas', 2000, 15]
];

async function importar() {
    try {
        console.log('🚀 Insertando servicios en la base de datos de Railway...');
        
        for (const [nombre, precio, duracion] of servicios) {
            await pool.query(
                'INSERT INTO servicios (nombre, precio, duracion, activo) VALUES ($1, $2, $3, true) ON CONFLICT DO NOTHING',
                [nombre, precio, duracion]
            );
            console.log(`✅ Agregado: ${nombre}`);
        }
        
        console.log('\n✨ ¡Servicios cargados con éxito!');
        process.exit(0);
    } catch (e) {
        console.error('❌ Error:', e);
        process.exit(1);
    }
}

importar();
