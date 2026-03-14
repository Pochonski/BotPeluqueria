const ServicioModel = require('../models/servicioModel');

const getAllServicios = async (req, res) => {
    try {
        const servicios = await ServicioModel.getAll();
        res.json(servicios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener servicios' });
    }
};

module.exports = {
    getAllServicios
};
