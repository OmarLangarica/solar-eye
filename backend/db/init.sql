CREATE DATABASE IF NOT EXISTS solar_eye;

USE solar_eye;

CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,

    -- Branding
    descripcion TEXT,
    slogan VARCHAR(255),
    imagen_logo VARCHAR(500),
    imagen_portada VARCHAR(500),

    -- Contacto
    telefono VARCHAR(20),
    email_contacto VARCHAR(150),
    sitio_web VARCHAR(255),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    estado_republica VARCHAR(100),

    -- Redes sociales
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    whatsapp VARCHAR(20),

    -- Configuración visual
    logo_url VARCHAR(500),
    color_primario VARCHAR(7) DEFAULT '#FF7043',
    color_secundario VARCHAR(7) DEFAULT '#F4511E',

    -- Configuración de cuenta
    plan ENUM('basico','profesional','enterprise') DEFAULT 'basico',
    publica BOOLEAN DEFAULT FALSE,
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
    numero_paneles INT,
    performance_ratio DECIMAL(5,4),
    perdidas_json TEXT,
    metodo_simulacion VARCHAR(100),
    produccion_mensual_json TEXT,
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
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE SET NULL
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

-- ─── MÓDULO DE INVENTARIO ─────────────────────────────────────

CREATE TABLE categorias_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'box',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    categoria_id INT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    unidad VARCHAR(30) DEFAULT 'pieza',
    precio_compra DECIMAL(12,2) DEFAULT 0,
    precio_venta DECIMAL(12,2) DEFAULT 0,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    stock_maximo INT DEFAULT 100,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias_inventario(id) ON DELETE SET NULL
);

CREATE TABLE movimientos_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    producto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    simulacion_id INT,
    cliente_id INT,
    tipo ENUM('entrada','salida','ajuste','reserva','venta','devolucion') NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    motivo VARCHAR(255),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE SET NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

CREATE TABLE instalaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    simulacion_id INT NOT NULL,
    cliente_id INT NOT NULL,
    tecnico_id INT NOT NULL,
    fecha_instalacion DATE,
    estado ENUM('pendiente','en_progreso','completada','cancelada') DEFAULT 'pendiente',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE instalacion_materiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instalacion_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    FOREIGN KEY (instalacion_id) REFERENCES instalaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

CREATE TABLE fabricantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('panel', 'inversor', 'ambos') NOT NULL DEFAULT 'ambos',
    pais_origen VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE paneles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fabricante_id INT NOT NULL,
    modelo VARCHAR(150) NOT NULL,
    potencia_wp DECIMAL(8,2) NOT NULL,
    eficiencia DECIMAL(5,4) NOT NULL,
    voc DECIMAL(6,2) NOT NULL,
    isc DECIMAL(6,2) NOT NULL,
    vmp DECIMAL(6,2) NOT NULL,
    imp DECIMAL(6,2) NOT NULL,
    coef_temp_potencia DECIMAL(7,5) NOT NULL,
    coef_temp_voc DECIMAL(7,5),
    ancho_m DECIMAL(5,3) NOT NULL,
    alto_m DECIMAL(5,3) NOT NULL,
    area_m2 DECIMAL(5,3) NOT NULL,
    peso_kg DECIMAL(5,2),
    tecnologia VARCHAR(50),
    numero_celdas INT,
    garantia_anios INT DEFAULT 25,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (fabricante_id) REFERENCES fabricantes(id)
);

CREATE TABLE inversores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fabricante_id INT NOT NULL,
    modelo VARCHAR(150) NOT NULL,
    potencia_nominal_kw DECIMAL(8,2) NOT NULL,
    potencia_maxima_kw DECIMAL(8,2) NOT NULL,
    eficiencia_maxima DECIMAL(5,4) NOT NULL,
    eficiencia_europea DECIMAL(5,4),
    voltaje_mppt_min DECIMAL(6,2) NOT NULL,
    voltaje_mppt_max DECIMAL(6,2) NOT NULL,
    voltaje_max_entrada DECIMAL(6,2) NOT NULL,
    corriente_max_entrada DECIMAL(6,2) NOT NULL,
    numero_mppt INT NOT NULL DEFAULT 1,
    numero_entradas_por_mppt INT NOT NULL DEFAULT 1,
    tipo VARCHAR(50),
    fases ENUM('monofasico','trifasico') NOT NULL,
    garantia_anios INT DEFAULT 10,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (fabricante_id) REFERENCES fabricantes(id)
);

-- ─── Datos de prueba ──────────────────────────────────────────

INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol, activo)
VALUES ('Omar', 'Langarica', 'admin@solar.com', '123456', '6671234567', 'superadmin', TRUE);

INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol, activo)
VALUES ('Omar', 'Langarica', 'omar@solar.com', '123456', '6671234567', 'usuario', TRUE);

INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol, activo)
VALUES ('Bryan', 'Zamudio', 'bryan@solar.com', '123456', '6679876543', 'usuario', TRUE);

INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol, activo)
VALUES ('Alex', 'Fernando', 'alex@solar.com', '123456', '6679876543', 'usuario', TRUE);

INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol, activo)
VALUES ('Aldhair', 'Sarabia', 'aldhair@solar.com', '123456', '6679876543', 'usuario', TRUE);

INSERT INTO empresas (nombre, color_primario, color_secundario, plan, activo)
VALUES ('Solar Eye Demo', '#1e3a8a', '#2563eb', 'profesional', TRUE);

INSERT INTO usuarios_empresas (usuario_id, empresa_id, rol, activo) VALUES
(2, 1, 'admin', TRUE),
(3, 1, 'trabajador', TRUE);

INSERT INTO clientes (empresa_id, usuario_id, nombre, apellido, email, telefono, direccion, ciudad, estado, codigo_postal, notas) VALUES
(1, 2, 'Juan', 'García', 'juan@gmail.com', '6677654321', 'Calle Girasol 123', 'Culiacán', 'Sinaloa', '80000', 'Cliente interesado en sistema de 5kWp'),
(1, 2, 'María', 'López', 'maria@gmail.com', '6671112233', 'Av. Insurgentes 456', 'Mazatlán', 'Sinaloa', '82000', 'Casa con techo plano'),
(1, 3, 'Pedro', 'Ramírez', 'pedro@gmail.com', '6674445566', 'Blvd. Sinaloa 789', 'Los Mochis', 'Sinaloa', '81200', 'Local comercial');

INSERT INTO simulaciones (cliente_id, usuario_id, nombre_proyecto, descripcion, estado) VALUES
(1, 2, 'Casa principal Juan García', 'Simulación inicial techo sur', 'completada'),
(1, 2, 'Opción económica Juan García', 'Sistema más pequeño con menos paneles', 'borrador'),
(2, 2, 'Casa María López', 'Techo plano con máxima capacidad', 'cotizada'),
(3, 3, 'Local comercial Pedro', 'Sistema industrial 10kWp', 'borrador');

INSERT INTO datos_techo (simulacion_id, geojson, area_m2, perimetro_m, latitud, longitud, tipo_techo, angulo_inclinacion_deg, azimut_deg, factor_sombra, area_util_m2) VALUES
(1, '{"type":"Polygon","coordinates":[[[-107.38,24.80],[-107.37,24.80],[-107.37,24.79],[-107.38,24.79],[-107.38,24.80]]]}', 85.50, 37.20, 24.8000, -107.3800, 'inclinado', 15.00, 180.00, 0.95, 75.00),
(2, '{"type":"Polygon","coordinates":[[[-107.38,24.80],[-107.37,24.80],[-107.37,24.79],[-107.38,24.79],[-107.38,24.80]]]}', 45.00, 27.00, 24.8000, -107.3800, 'inclinado', 15.00, 180.00, 0.90, 40.00),
(3, '{"type":"Polygon","coordinates":[[[-106.41,23.23],[-106.40,23.23],[-106.40,23.22],[-106.41,23.22],[-106.41,23.23]]]}', 120.00, 44.00, 23.2300, -106.4100, 'plano', 5.00, 180.00, 1.00, 110.00),
(4, '{"type":"Polygon","coordinates":[[[-108.98,25.79],[-108.97,25.79],[-108.97,25.78],[-108.98,25.78],[-108.98,25.79]]]}', 200.00, 60.00, 25.7900, -108.9800, 'plano', 5.00, 180.00, 0.98, 185.00);

INSERT INTO datos_geograficos (simulacion_id, irradiacion_anual_kwh_m2, irradiacion_diaria_promedio, horas_sol_pico_diarias, temperatura_promedio_anual, temperatura_max_verano, temperatura_min_invierno, velocidad_viento_promedio, altitud_msnm, zona_climatica, fuente_datos, fecha_consulta) VALUES
(1, 2138.24, 5.86, 5.86, 25.28, 45.87, 3.69, 1.73, 66.00, 'seca-cálida', 'NASA POWER + Open Elevation', '2026-02-20'),
(2, 2138.24, 5.86, 5.86, 25.28, 45.87, 3.69, 1.73, 66.00, 'seca-cálida', 'NASA POWER + Open Elevation', '2026-02-20'),
(3, 2050.10, 5.62, 5.62, 26.10, 42.30, 8.50, 2.10, 5.00, 'seca-cálida', 'NASA POWER + Open Elevation', '2026-02-20'),
(4, 2200.50, 6.03, 6.03, 24.50, 44.10, 5.20, 1.90, 20.00, 'seca-cálida', 'NASA POWER + Open Elevation', '2026-02-20');

INSERT INTO consumo_electrico (simulacion_id, consumo_mensual_kwh, consumo_anual_kwh, tarifa_kwh_mxn, costo_mensual_mxn, tipo_tarifa, numero_recibo, periodo_facturacion) VALUES
(1, 350.00, 4200.00, 0.9950, 348.25, '1C', 'REC-2026-001', 'bimestral'),
(2, 350.00, 4200.00, 0.9950, 348.25, '1C', 'REC-2026-001', 'bimestral'),
(3, 500.00, 6000.00, 0.9950, 497.50, '1D', 'REC-2026-002', 'bimestral'),
(4, 1200.00, 14400.00, 0.9950, 1194.00, 'DAC', 'REC-2026-003', 'mensual');

INSERT INTO configuracion_sistema_solar (simulacion_id, marca_panel, modelo_panel, potencia_panel_wp, eficiencia_panel, cantidad_paneles, area_por_panel_m2, marca_inversor, modelo_inversor, potencia_inversor_kw, eficiencia_inversor, tipo_inversor, potencia_total_kwp, tipo_conexion, incluye_bateria, capacidad_bateria_kwh, degradacion_anual_pct, vida_util_anios) VALUES
(1, 'Canadian Solar', 'CS6R-410MS', 410, 20.50, 12, 1.96, 'Fronius', 'Symo 5.0-3-M', 5.00, 97.00, 'string', 4.92, 'red', FALSE, NULL, 0.50, 25),
(2, 'Canadian Solar', 'CS6R-410MS', 410, 20.50, 6, 1.96, 'Fronius', 'Symo 3.0-3-M', 3.00, 97.00, 'string', 2.46, 'red', FALSE, NULL, 0.50, 25),
(3, 'Jinko Solar', 'JKM400M-54HL', 400, 20.20, 16, 1.96, 'SMA', 'Sunny Boy 6.0', 6.00, 97.50, 'string', 6.40, 'red', FALSE, NULL, 0.50, 25),
(4, 'Jinko Solar', 'JKM400M-54HL', 400, 20.20, 28, 1.96, 'SMA', 'Sunny Tripower 10', 10.00, 97.50, 'string', 11.20, 'red', FALSE, NULL, 0.50, 25);

INSERT INTO resultados_calculo (simulacion_id, produccion_anual_kwh, produccion_mensual_promedio_kwh, porcentaje_cobertura, excedente_kwh, ahorro_mensual_mxn, ahorro_anual_mxn, ahorro_vida_util_mxn, costo_total_instalacion_mxn, retorno_inversion_anios, co2_evitado_anual_kg, co2_evitado_vida_util_kg, arboles_equivalentes, precio_kwh_proyectado_anio5, precio_kwh_proyectado_anio10, tasa_incremento_tarifa_pct) VALUES
(1, 3850.00, 320.83, 91.67, 150.00, 318.83, 3825.96, 95649.00, 85000.00, 7.50, 1732.50, 43312.50, 79, 1.2700, 1.6200, 5.00),
(2, 1925.00, 160.42, 45.83, 0.00, 159.42, 1912.98, 47824.50, 45000.00, 8.20, 866.25, 21656.25, 40, 1.2700, 1.6200, 5.00),
(3, 5120.00, 426.67, 85.33, 320.00, 424.53, 5094.36, 127359.00, 110000.00, 7.20, 2304.00, 57600.00, 105, 1.2700, 1.6200, 5.00),
(4, 9800.00, 816.67, 68.06, 0.00, 814.47, 9773.64, 244341.00, 195000.00, 6.80, 4410.00, 110250.00, 201, 1.2700, 1.6200, 5.00);

INSERT INTO reportes (simulacion_id, usuario_id, nombre_archivo, ruta_archivo) VALUES
(1, 2, 'reporte_juan_garcia_2026.pdf', '/reportes/reporte_juan_garcia_2026.pdf'),
(3, 2, 'reporte_maria_lopez_2026.pdf', '/reportes/reporte_maria_lopez_2026.pdf'),
(4, 3, 'reporte_pedro_ramirez_2026.pdf', '/reportes/reporte_pedro_ramirez_2026.pdf');

-- ─── Categorías de inventario de prueba ───────────────────────
INSERT INTO categorias_inventario (empresa_id, nombre, descripcion, icono) VALUES
(1, 'Paneles Solares', 'Módulos fotovoltaicos de diferentes potencias', 'solar-panel'),
(1, 'Inversores', 'Inversores string, microinversores e híbridos', 'inversor'),
(1, 'Baterías', 'Sistemas de almacenamiento de energía', 'battery'),
(1, 'Estructuras', 'Estructuras de montaje para techos planos e inclinados', 'structure'),
(1, 'Cableado', 'Cables solares, conectores MC4 y accesorios eléctricos', 'cable'),
(1, 'Herramientas', 'Herramientas y equipos de instalación', 'tools'),
(1, 'Materiales', 'Materiales varios de instalación', 'materials');

-- ─── Productos de prueba ──────────────────────────────────────
INSERT INTO productos (empresa_id, categoria_id, nombre, descripcion, marca, modelo, unidad, precio_compra, precio_venta, stock_actual, stock_minimo, stock_maximo) VALUES
(1, 1, 'Panel Solar 410W Monocristalino', 'Panel solar de alta eficiencia 20.5%', 'Canadian Solar', 'CS6R-410MS', 'pieza', 2800.00, 3500.00, 45, 10, 100),
(1, 1, 'Panel Solar 400W Monocristalino', 'Panel solar policristalino de alta durabilidad', 'Jinko Solar', 'JKM400M-54HL', 'pieza', 2600.00, 3200.00, 30, 10, 80),
(1, 2, 'Inversor String 5kW', 'Inversor trifásico para sistemas residenciales', 'Fronius', 'Symo 5.0-3-M', 'pieza', 18000.00, 22000.00, 8, 2, 20),
(1, 2, 'Inversor String 3kW', 'Inversor monofásico para sistemas pequeños', 'Fronius', 'Symo 3.0-3-M', 'pieza', 14000.00, 17000.00, 10, 2, 20),
(1, 2, 'Inversor 10kW Trifásico', 'Inversor para sistemas comerciales', 'SMA', 'Sunny Tripower 10', 'pieza', 35000.00, 42000.00, 4, 1, 10),
(1, 3, 'Batería LiFePO4 5kWh', 'Batería de litio para almacenamiento solar', 'BYD', 'Battery-Box Premium HVS', 'pieza', 45000.00, 55000.00, 5, 1, 15),
(1, 4, 'Estructura para Techo Inclinado', 'Kit de montaje aluminio para techo inclinado', 'Schletter', 'FlatFix Fusion', 'kit', 1200.00, 1600.00, 25, 5, 60),
(1, 4, 'Estructura para Techo Plano', 'Kit de montaje para techo plano con lastrado', 'Schletter', 'FlatFix Fusion', 'kit', 1500.00, 2000.00, 20, 5, 50),
(1, 5, 'Cable Solar 6mm² Negro', 'Cable fotovoltaico resistente a UV por metro', 'Prysmian', 'Tecsun PV 6mm', 'metro', 18.00, 25.00, 500, 100, 1000),
(1, 5, 'Conector MC4 Par', 'Par de conectores MC4 macho/hembra', 'Stäubli', 'MC4', 'par', 45.00, 65.00, 200, 50, 500),
(1, 6, 'Multímetro Digital', 'Multímetro para diagnóstico de sistemas FV', 'Fluke', '117', 'pieza', 3500.00, 4500.00, 3, 1, 5),
(1, 7, 'Tornillo Autorroscante 1/4', 'Tornillo para fijación de estructuras', 'Generic', 'M6x50', 'bolsa', 85.00, 120.00, 50, 10, 100);

-- ─── Movimientos de prueba ────────────────────────────────────
INSERT INTO movimientos_inventario (empresa_id, producto_id, usuario_id, tipo, cantidad, precio_unitario, total, motivo) VALUES
(1, 1, 2, 'entrada', 50, 2800.00, 140000.00, 'Compra inicial de inventario'),
(1, 2, 2, 'entrada', 30, 2600.00, 78000.00, 'Compra inicial de inventario'),
(1, 3, 2, 'entrada', 10, 18000.00, 180000.00, 'Compra inicial de inventario'),
(1, 1, 3, 'salida', 5, 3500.00, 17500.00, 'Instalación proyecto Juan García'),
(1, 3, 3, 'salida', 2, 22000.00, 44000.00, 'Instalación proyecto Juan García');

INSERT INTO fabricantes (nombre, tipo, pais_origen) VALUES
('Jinko Solar', 'panel', 'China'),
('Trina Solar', 'panel', 'China'),
('JA Solar', 'panel', 'China'),
('Canadian Solar', 'panel', 'Canada'),
('Huawei', 'inversor', 'China'),
('Solis', 'inversor', 'China'),
('Growatt', 'inversor', 'China');

INSERT INTO paneles (fabricante_id, modelo, potencia_wp, eficiencia, voc, isc, vmp, imp, coef_temp_potencia, coef_temp_voc, ancho_m, alto_m, area_m2, peso_kg, tecnologia, numero_celdas, garantia_anios) VALUES
-- Jinko Solar
((SELECT id FROM fabricantes WHERE nombre='Jinko Solar'), 'Tiger Neo JKM575N-72HL4-V', 575.00, 0.2226, 51.80, 14.15, 43.38, 13.25, -0.00290, -0.00240, 1.134, 2.278, 2.583, 28.6, 'N-Type TOPCon', 72, 25),
((SELECT id FROM fabricantes WHERE nombre='Jinko Solar'), 'Tiger Pro JKM460M-60HL4-V', 460.00, 0.2114, 41.80, 13.95, 34.92, 13.17, -0.00350, -0.00280, 1.134, 1.722, 1.953, 22.5, 'Monocristalino PERC', 60, 25),

-- Trina Solar
((SELECT id FROM fabricantes WHERE nombre='Trina Solar'), 'Vertex S+ TSM-NEG9R.28 440W', 440.00, 0.2230, 41.50, 13.65, 34.50, 12.76, -0.00290, -0.00250, 1.134, 1.762, 1.999, 21.5, 'N-Type i-TOPCon', 66, 25),
((SELECT id FROM fabricantes WHERE nombre='Trina Solar'), 'Vertex TSM-DE21 605W', 605.00, 0.2210, 53.90, 14.16, 45.20, 13.39, -0.00340, -0.00270, 1.134, 2.384, 2.704, 33.8, 'Monocristalino PERC Bifacial', 132, 25),

-- JA Solar
((SELECT id FROM fabricantes WHERE nombre='JA Solar'), 'DeepBlue 4.0 JAM54S31-415', 415.00, 0.2160, 38.10, 13.92, 31.95, 12.99, -0.00300, -0.00260, 1.134, 1.722, 1.953, 21.0, 'N-Type Bifacial', 54, 25),
((SELECT id FROM fabricantes WHERE nombre='JA Solar'), 'DeepBlue 3.0 JAM72S20-460', 460.00, 0.2110, 50.20, 11.62, 42.10, 10.93, -0.00350, -0.00280, 1.134, 2.120, 2.404, 24.0, 'Monocristalino PERC', 72, 25),

-- Canadian Solar
((SELECT id FROM fabricantes WHERE nombre='Canadian Solar'), 'HiKu6 CS6L-540MS', 540.00, 0.2090, 49.80, 13.84, 41.70, 12.95, -0.00340, -0.00270, 1.134, 2.261, 2.564, 27.5, 'Monocristalino PERC', 132, 25),
((SELECT id FROM fabricantes WHERE nombre='Canadian Solar'), 'TopHiKu6 CS6W-580MS', 580.00, 0.2245, 53.40, 13.91, 44.60, 13.00, -0.00290, -0.00250, 1.134, 2.278, 2.583, 29.0, 'N-Type TOPCon Bifacial', 132, 25);

INSERT INTO inversores (fabricante_id, modelo, potencia_nominal_kw, potencia_maxima_kw, eficiencia_maxima, eficiencia_europea, voltaje_mppt_min, voltaje_mppt_max, voltaje_max_entrada, corriente_max_entrada, numero_mppt, numero_entradas_por_mppt, tipo, fases, garantia_anios) VALUES
-- Huawei
((SELECT id FROM fabricantes WHERE nombre='Huawei'), 'SUN2000-3KTL-L1', 3.00, 3.30, 0.9840, 0.9810, 90.00, 560.00, 600.00, 13.00, 2, 1, 'String', 'monofasico', 10),
((SELECT id FROM fabricantes WHERE nombre='Huawei'), 'SUN2000-5KTL-L1', 5.00, 5.50, 0.9840, 0.9810, 90.00, 560.00, 600.00, 13.00, 2, 1, 'String', 'monofasico', 10),
((SELECT id FROM fabricantes WHERE nombre='Huawei'), 'SUN2000-10KTL-M1', 10.00, 11.00, 0.9850, 0.9820, 140.00, 980.00, 1080.00, 22.00, 2, 2, 'String', 'trifasico', 10),
((SELECT id FROM fabricantes WHERE nombre='Huawei'), 'SUN2000-15KTL-M2', 15.00, 16.50, 0.9860, 0.9830, 140.00, 980.00, 1080.00, 22.00, 4, 1, 'String', 'trifasico', 10),
((SELECT id FROM fabricantes WHERE nombre='Huawei'), 'SUN2000-20KTL-M2', 20.00, 22.00, 0.9860, 0.9840, 140.00, 980.00, 1080.00, 22.00, 4, 2, 'String', 'trifasico', 10),

-- Solis
((SELECT id FROM fabricantes WHERE nombre='Solis'), 'S6-GR1P3K', 3.00, 3.30, 0.9760, 0.9710, 80.00, 500.00, 550.00, 13.00, 1, 2, 'String', 'monofasico', 10),
((SELECT id FROM fabricantes WHERE nombre='Solis'), 'S6-GR1P5K', 5.00, 5.50, 0.9780, 0.9730, 80.00, 500.00, 550.00, 13.50, 2, 1, 'String', 'monofasico', 10),
((SELECT id FROM fabricantes WHERE nombre='Solis'), 'S6-GR3P10K', 10.00, 11.00, 0.9820, 0.9780, 160.00, 950.00, 1000.00, 22.00, 2, 2, 'String', 'trifasico', 10),
((SELECT id FROM fabricantes WHERE nombre='Solis'), 'S6-GR3P15K', 15.00, 16.50, 0.9830, 0.9790, 160.00, 950.00, 1000.00, 22.00, 3, 2, 'String', 'trifasico', 10),

-- Growatt
((SELECT id FROM fabricantes WHERE nombre='Growatt'), 'MIN 3000TL-X', 3.00, 3.30, 0.9740, 0.9700, 60.00, 500.00, 550.00, 11.00, 2, 1, 'String', 'monofasico', 10),
((SELECT id FROM fabricantes WHERE nombre='Growatt'), 'MIN 5000TL-X', 5.00, 5.50, 0.9750, 0.9710, 60.00, 500.00, 550.00, 12.50, 2, 1, 'String', 'monofasico', 10),
((SELECT id FROM fabricantes WHERE nombre='Growatt'), 'MOD 10KTL3-X', 10.00, 11.00, 0.9810, 0.9770, 160.00, 1000.00, 1100.00, 22.00, 2, 2, 'String', 'trifasico', 10),
((SELECT id FROM fabricantes WHERE nombre='Growatt'), 'MOD 15KTL3-X', 15.00, 16.50, 0.9820, 0.9780, 160.00, 1000.00, 1100.00, 22.00, 2, 2, 'String', 'trifasico', 10);