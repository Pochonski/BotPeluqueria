const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');

router.get('/disponibilidad', citaController.getDisponibilidad);
router.post('/reservar', citaController.crearCita);

module.exports = router;
