-- TABLA: USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    rol VARCHAR(20) DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: SERVICIOS
CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    duracion INT NOT NULL, -- en minutos
    activo BOOLEAN DEFAULT TRUE
);

-- TABLA: CITAS
CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    CONSTRAINT chk_estado CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'no_show', 'cancelada'))
);

-- TABLA: RELACIÓN CITA-SERVICIOS
CREATE TABLE IF NOT EXISTS cita_servicios (
    cita_id INT NOT NULL,
    servicio_id INT NOT NULL,
    PRIMARY KEY (cita_id, servicio_id),
    CONSTRAINT fk_cita FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE,
    CONSTRAINT fk_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

-- TABLA: BLOQUEOS DE HORARIO
CREATE TABLE IF NOT EXISTS bloqueos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: CONFIGURACIÓN DE NEGOCIO (HORARIOS)
CREATE TABLE IF NOT EXISTS configuracion_negocio (
    id SERIAL PRIMARY KEY,
    dia_semana INT NOT NULL, -- 0 (Dom) a 6 (Sab)
    hora_apertura TIME,
    hora_cierre TIME,
    lunch_inicio TIME,
    lunch_fin TIME,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(dia_semana)
);

-- DATOS INICIALES: SERVICIOS (Usando ON CONFLICT para PostgreSQL)
INSERT INTO servicios (nombre, precio, duracion) VALUES 
('Corte de Cabello', 7000, 40),
('Barba', 4000, 20),
('Combo (Corte + Barba)', 10000, 60),
('Corte Niño', 6000, 30)
ON CONFLICT DO NOTHING;

-- DATOS INICIALES: HORARIOS
INSERT INTO configuracion_negocio (dia_semana, hora_apertura, hora_cierre, lunch_inicio, lunch_fin, activo) VALUES 
(1, '09:00:00', '19:00:00', '12:00:00', '13:00:00', true),
(2, '09:00:00', '19:00:00', '12:00:00', '13:00:00', true),
(3, '09:00:00', '19:00:00', '12:00:00', '13:00:00', true),
(4, '09:00:00', '19:00:00', '12:00:00', '13:00:00', true),
(5, '09:00:00', '19:00:00', '12:00:00', '13:00:00', true),
(6, '09:00:00', '19:00:00', '12:00:00', '13:00:00', true),
(0, NULL, NULL, NULL, NULL, false)
ON CONFLICT (dia_semana) DO NOTHING;
