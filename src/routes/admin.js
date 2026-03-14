const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Agenda
router.get('/dashboard', adminController.getDashboardData);
router.patch('/cita/:id/estado', adminController.cambiarEstadoCita);

// Servicios
router.get('/servicios', adminController.getServiciosAdmin);
router.post('/servicio/:id', adminController.guardarServicio);

// Horarios
router.get('/horarios', adminController.getHorariosAdmin);
router.post('/horario/:id', adminController.actualizarHorario);

// Bloqueos
router.get('/bloqueos', adminController.getBloqueos);
router.post('/bloqueo', adminController.crearBloqueo);
router.delete('/bloqueo/:id', adminController.eliminarBloqueo);

module.exports = router;
