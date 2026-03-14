const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar Bot de WhatsApp
const whatsappClient = require('./src/services/whatsappService');
whatsappClient.initialize();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Rutas API
app.use('/api/servicios', require('./src/routes/servicios'));
app.use('/api/citas', require('./src/routes/citas'));
app.use('/api/admin', require('./src/routes/admin'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'src', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

// Manejo de 404 general (debería ser lo último)
app.use((req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        console.log(`404 en API: ${req.method} ${req.originalUrl}`);
        return res.status(404).json({ message: `Ruta de API no encontrada: ${req.originalUrl}` });
    }
    res.status(404).sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
