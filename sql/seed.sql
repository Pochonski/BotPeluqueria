INSERT INTO servicios (nombre, duracion, precio) VALUES 
('Corte de Cabello', 30, 5000.00),
('Arreglo de Barba', 20, 3000.00),
('Corte + Barba', 50, 7000.00),
('Limpieza Facial', 15, 2500.00);

-- Horarios base (Lunes a Sábado)
INSERT INTO configuracion_negocio (dia_semana, hora_apertura, hora_cierre) VALUES 
(1, '08:00:00', '18:00:00'),
(2, '08:00:00', '18:00:00'),
(3, '08:00:00', '18:00:00'),
(4, '08:00:00', '18:00:00'),
(5, '08:00:00', '18:00:00'),
(6, '08:00:00', '18:00:00');
