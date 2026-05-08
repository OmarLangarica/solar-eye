CREATE DATABASE IF NOT EXISTS solar_eye;

USE solar_eye;

CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    logo_url VARCHAR(500),
    color_primario VARCHAR(7) DEFAULT '#FF7043',
    color_secundario VARCHAR(7) DEFAULT '#F4511E',
    plan ENUM('basico','profesional','enterprise') DEFAULT 'basico',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('superadmin', 'usuario') DEFAULT 'usuario',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE usuarios_empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    empresa_id INT NOT NULL,
    rol ENUM('admin', 'trabajador') DEFAULT 'trabajador',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_empresa (usuario_id, empresa_id)
);

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE simulaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nombre_proyecto VARCHAR(150),
    descripcion TEXT,
    estado ENUM('borrador', 'completada', 'cotizada') DEFAULT 'borrador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE datos_techo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    geojson TEXT NOT NULL,
    area_m2 DECIMAL(10,2) NOT NULL,
    perimetro_m DECIMAL(10,2),
    latitud DECIMAL(10,7) NOT NULL,
    longitud DECIMAL(10,7) NOT NULL,
    tipo_techo ENUM('plano', 'inclinado', 'mixto') DEFAULT 'inclinado',
    angulo_inclinacion_deg DECIMAL(5,2) DEFAULT 15.00,
    azimut_deg DECIMAL(6,2),
    factor_sombra DECIMAL(4,2) DEFAULT 1.00,
    area_util_m2 DECIMAL(10,2),
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE
);

CREATE TABLE datos_geograficos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    irradiacion_anual_kwh_m2 DECIMAL(8,2),
    irradiacion_diaria_promedio DECIMAL(6,2),
    horas_sol_pico_diarias DECIMAL(5,2),
    temperatura_promedio_anual DECIMAL(5,2),
    temperatura_max_verano DECIMAL(5,2),
    temperatura_min_invierno DECIMAL(5,2),
    velocidad_viento_promedio DECIMAL(5,2),
    altitud_msnm DECIMAL(7,2),
    zona_climatica VARCHAR(50),
    fuente_datos VARCHAR(100) DEFAULT 'NASA POWER',
    fecha_consulta DATE,
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE
);

CREATE TABLE consumo_electrico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    consumo_mensual_kwh DECIMAL(8,2),
    consumo_anual_kwh DECIMAL(10,2),
    tarifa_kwh_mxn DECIMAL(6,4),
    costo_mensual_mxn DECIMAL(10,2),
    tipo_tarifa VARCHAR(20),
    numero_recibo VARCHAR(50),
    periodo_facturacion VARCHAR(50),
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE
);

CREATE TABLE configuracion_sistema_solar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    marca_panel VARCHAR(100),
    modelo_panel VARCHAR(100),
    potencia_panel_wp INT,
    eficiencia_panel DECIMAL(5,2),
    cantidad_paneles INT,
    area_por_panel_m2 DECIMAL(5,2) DEFAULT 1.96,
    marca_inversor VARCHAR(100),
    modelo_inversor VARCHAR(100),
    potencia_inversor_kw DECIMAL(7,2),
    eficiencia_inversor DECIMAL(5,2) DEFAULT 97.00,
    tipo_inversor ENUM('string', 'microinversor', 'hibrido') DEFAULT 'string',
    potencia_total_kwp DECIMAL(8,2),
    tipo_conexion ENUM('red', 'aislado', 'hibrido') DEFAULT 'red',
    incluye_bateria BOOLEAN DEFAULT FALSE,
    capacidad_bateria_kwh DECIMAL(7,2),
    degradacion_anual_pct DECIMAL(4,2) DEFAULT 0.50,
    vida_util_anios INT DEFAULT 25,
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE
);

CREATE TABLE resultados_calculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    produccion_anual_kwh DECIMAL(10,2),
    produccion_mensual_promedio_kwh DECIMAL(8,2),
    porcentaje_cobertura DECIMAL(5,2),
    excedente_kwh DECIMAL(8,2),
    ahorro_mensual_mxn DECIMAL(10,2),
    ahorro_anual_mxn DECIMAL(10,2),
    ahorro_vida_util_mxn DECIMAL(12,2),
    costo_total_instalacion_mxn DECIMAL(12,2),
    retorno_inversion_anios DECIMAL(5,2),
    co2_evitado_anual_kg DECIMAL(10,2),
    co2_evitado_vida_util_kg DECIMAL(12,2),
    arboles_equivalentes INT,
    precio_kwh_proyectado_anio5 DECIMAL(6,4),
    precio_kwh_proyectado_anio10 DECIMAL(6,4),
    tasa_incremento_tarifa_pct DECIMAL(4,2) DEFAULT 5.00,
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE
);

CREATE TABLE citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT,
    cliente_id INT NOT NULL,
    simulacion_id INT,
    usuario_id INT,
    tipo ENUM('llamada','videollamada','visita_tecnica') DEFAULT 'visita_tecnica',
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME,
    estado ENUM('pendiente','confirmada','reprogramada','cancelada','realizada') DEFAULT 'pendiente',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE
);

CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nombre_archivo VARCHAR(255),
    ruta_archivo VARCHAR(500),
    generado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ─── Datos de prueba ──────────────────────────────────────────

-- Superadmin (dueño de la plataforma Solar Eye)
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol, activo)
VALUES ('Omar', 'Langarica', 'omar@solareye.com', '123456', '6671234567', 'superadmin', TRUE);

-- Admin de empresa de prueba
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol, activo)
VALUES ('Omar', 'Langarica', 'omar@solar.com', '123456', '6671234567', 'usuario', TRUE);

-- Trabajador de empresa de prueba
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol, activo)
VALUES ('Carlos', 'Mendez', 'carlos@solar.com', '123456', '6679876543', 'usuario', TRUE);

-- Empresa de prueba
INSERT INTO empresas (nombre, color_primario, color_secundario, plan, activo)
VALUES ('Solar Eye Demo', '#FF7043', '#F4511E', 'profesional', TRUE);

-- Relación usuarios con empresa
INSERT INTO usuarios_empresas (usuario_id, empresa_id, rol, activo) VALUES
(2, 1, 'admin', TRUE),
(3, 1, 'trabajador', TRUE);

-- Clientes
INSERT INTO clientes (empresa_id, usuario_id, nombre, apellido, email, telefono, direccion, ciudad, estado, codigo_postal, notas) VALUES
(1, 2, 'Juan', 'García', 'juan@gmail.com', '6677654321', 'Calle Girasol 123', 'Culiacán', 'Sinaloa', '80000', 'Cliente interesado en sistema de 5kWp'),
(1, 2, 'María', 'López', 'maria@gmail.com', '6671112233', 'Av. Insurgentes 456', 'Mazatlán', 'Sinaloa', '82000', 'Casa con techo plano'),
(1, 3, 'Pedro', 'Ramírez', 'pedro@gmail.com', '6674445566', 'Blvd. Sinaloa 789', 'Los Mochis', 'Sinaloa', '81200', 'Local comercial');

-- Simulaciones
INSERT INTO simulaciones (cliente_id, usuario_id, nombre_proyecto, descripcion, estado) VALUES
(1, 2, 'Casa principal Juan García', 'Simulación inicial techo sur', 'completada'),
(1, 2, 'Opción económica Juan García', 'Sistema más pequeño con menos paneles', 'borrador'),
(2, 2, 'Casa María López', 'Techo plano con máxima capacidad', 'cotizada'),
(3, 3, 'Local comercial Pedro', 'Sistema industrial 10kWp', 'borrador');

-- Datos techo
INSERT INTO datos_techo (simulacion_id, geojson, area_m2, perimetro_m, latitud, longitud, tipo_techo, angulo_inclinacion_deg, azimut_deg, factor_sombra, area_util_m2) VALUES
(1, '{"type":"Polygon","coordinates":[[[-107.38,24.80],[-107.37,24.80],[-107.37,24.79],[-107.38,24.79],[-107.38,24.80]]]}', 85.50, 37.20, 24.8000, -107.3800, 'inclinado', 15.00, 180.00, 0.95, 75.00),
(2, '{"type":"Polygon","coordinates":[[[-107.38,24.80],[-107.37,24.80],[-107.37,24.79],[-107.38,24.79],[-107.38,24.80]]]}', 45.00, 27.00, 24.8000, -107.3800, 'inclinado', 15.00, 180.00, 0.90, 40.00),
(3, '{"type":"Polygon","coordinates":[[[-106.41,23.23],[-106.40,23.23],[-106.40,23.22],[-106.41,23.22],[-106.41,23.23]]]}', 120.00, 44.00, 23.2300, -106.4100, 'plano', 5.00, 180.00, 1.00, 110.00),
(4, '{"type":"Polygon","coordinates":[[[-108.98,25.79],[-108.97,25.79],[-108.97,25.78],[-108.98,25.78],[-108.98,25.79]]]}', 200.00, 60.00, 25.7900, -108.9800, 'plano', 5.00, 180.00, 0.98, 185.00);

-- Datos geográficos
INSERT INTO datos_geograficos (simulacion_id, irradiacion_anual_kwh_m2, irradiacion_diaria_promedio, horas_sol_pico_diarias, temperatura_promedio_anual, temperatura_max_verano, temperatura_min_invierno, velocidad_viento_promedio, altitud_msnm, zona_climatica, fuente_datos, fecha_consulta) VALUES
(1, 2138.24, 5.86, 5.86, 25.28, 45.87, 3.69, 1.73, 66.00, 'seca-cálida', 'NASA POWER + Open Elevation', '2026-02-20'),
(2, 2138.24, 5.86, 5.86, 25.28, 45.87, 3.69, 1.73, 66.00, 'seca-cálida', 'NASA POWER + Open Elevation', '2026-02-20'),
(3, 2050.10, 5.62, 5.62, 26.10, 42.30, 8.50, 2.10, 5.00, 'seca-cálida', 'NASA POWER + Open Elevation', '2026-02-20'),
(4, 2200.50, 6.03, 6.03, 24.50, 44.10, 5.20, 1.90, 20.00, 'seca-cálida', 'NASA POWER + Open Elevation', '2026-02-20');

-- Consumo eléctrico
INSERT INTO consumo_electrico (simulacion_id, consumo_mensual_kwh, consumo_anual_kwh, tarifa_kwh_mxn, costo_mensual_mxn, tipo_tarifa, numero_recibo, periodo_facturacion) VALUES
(1, 350.00, 4200.00, 0.9950, 348.25, '1C', 'REC-2026-001', 'bimestral'),
(2, 350.00, 4200.00, 0.9950, 348.25, '1C', 'REC-2026-001', 'bimestral'),
(3, 500.00, 6000.00, 0.9950, 497.50, '1D', 'REC-2026-002', 'bimestral'),
(4, 1200.00, 14400.00, 0.9950, 1194.00, 'DAC', 'REC-2026-003', 'mensual');

-- Configuración sistema solar
INSERT INTO configuracion_sistema_solar (simulacion_id, marca_panel, modelo_panel, potencia_panel_wp, eficiencia_panel, cantidad_paneles, area_por_panel_m2, marca_inversor, modelo_inversor, potencia_inversor_kw, eficiencia_inversor, tipo_inversor, potencia_total_kwp, tipo_conexion, incluye_bateria, capacidad_bateria_kwh, degradacion_anual_pct, vida_util_anios) VALUES
(1, 'Canadian Solar', 'CS6R-410MS', 410, 20.50, 12, 1.96, 'Fronius', 'Symo 5.0-3-M', 5.00, 97.00, 'string', 4.92, 'red', FALSE, NULL, 0.50, 25),
(2, 'Canadian Solar', 'CS6R-410MS', 410, 20.50, 6, 1.96, 'Fronius', 'Symo 3.0-3-M', 3.00, 97.00, 'string', 2.46, 'red', FALSE, NULL, 0.50, 25),
(3, 'Jinko Solar', 'JKM400M-54HL', 400, 20.20, 16, 1.96, 'SMA', 'Sunny Boy 6.0', 6.00, 97.50, 'string', 6.40, 'red', FALSE, NULL, 0.50, 25),
(4, 'Jinko Solar', 'JKM400M-54HL', 400, 20.20, 28, 1.96, 'SMA', 'Sunny Tripower 10', 10.00, 97.50, 'string', 11.20, 'red', FALSE, NULL, 0.50, 25);

-- Resultados cálculo
INSERT INTO resultados_calculo (simulacion_id, produccion_anual_kwh, produccion_mensual_promedio_kwh, porcentaje_cobertura, excedente_kwh, ahorro_mensual_mxn, ahorro_anual_mxn, ahorro_vida_util_mxn, costo_total_instalacion_mxn, retorno_inversion_anios, co2_evitado_anual_kg, co2_evitado_vida_util_kg, arboles_equivalentes, precio_kwh_proyectado_anio5, precio_kwh_proyectado_anio10, tasa_incremento_tarifa_pct) VALUES
(1, 3850.00, 320.83, 91.67, 150.00, 318.83, 3825.96, 95649.00, 85000.00, 7.50, 1732.50, 43312.50, 79, 1.2700, 1.6200, 5.00),
(2, 1925.00, 160.42, 45.83, 0.00, 159.42, 1912.98, 47824.50, 45000.00, 8.20, 866.25, 21656.25, 40, 1.2700, 1.6200, 5.00),
(3, 5120.00, 426.67, 85.33, 320.00, 424.53, 5094.36, 127359.00, 110000.00, 7.20, 2304.00, 57600.00, 105, 1.2700, 1.6200, 5.00),
(4, 9800.00, 816.67, 68.06, 0.00, 814.47, 9773.64, 244341.00, 195000.00, 6.80, 4410.00, 110250.00, 201, 1.2700, 1.6200, 5.00);

-- Reportes
INSERT INTO reportes (simulacion_id, usuario_id, nombre_archivo, ruta_archivo) VALUES
(1, 2, 'reporte_juan_garcia_2026.pdf', '/reportes/reporte_juan_garcia_2026.pdf'),
(3, 2, 'reporte_maria_lopez_2026.pdf', '/reportes/reporte_maria_lopez_2026.pdf'),
(4, 3, 'reporte_pedro_ramirez_2026.pdf', '/reportes/reporte_pedro_ramirez_2026.pdf');