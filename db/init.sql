CREATE DATABASE IF NOT EXISTS solar_eye;
USE solar_eye;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('admin', 'trabajador') DEFAULT 'trabajador',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,                -- trabajador que lo registró
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
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
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
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
CREATE TABLE datos_techo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    
    -- Geometría del trazado
    geojson TEXT NOT NULL,                  -- polígono dibujado en Leaflet (GeoJSON)
    area_m2 DECIMAL(10,2) NOT NULL,         -- metros cuadrados calculados del techo
    perimetro_m DECIMAL(10,2),
    
    -- Coordenadas centrales del techo
    latitud DECIMAL(10,7) NOT NULL,
    longitud DECIMAL(10,7) NOT NULL,
    
    -- Características físicas del techo
    tipo_techo ENUM('plano', 'inclinado', 'mixto') DEFAULT 'inclinado',
    angulo_inclinacion_deg DECIMAL(5,2) DEFAULT 15.00,   -- grados de inclinación
    azimut_deg DECIMAL(6,2),               -- orientación del techo (0=Norte, 180=Sur)
    factor_sombra DECIMAL(4,2) DEFAULT 1.00, -- 0 a 1 (1 = sin sombra)
    
    -- Área útil (descontando chimeneas, obstrucciones, etc.)
    area_util_m2 DECIMAL(10,2),
    
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id)
);
CREATE TABLE datos_geograficos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    
    -- Radiación solar (clave para el cálculo)
    irradiacion_anual_kwh_m2 DECIMAL(8,2),      -- kWh/m²/año (GHI - Global Horizontal Irradiance)
    irradiacion_diaria_promedio DECIMAL(6,2),    -- kWh/m²/día
    horas_sol_pico_diarias DECIMAL(5,2),         -- HSP (Peak Sun Hours), dato crítico
    
    -- Clima
    temperatura_promedio_anual DECIMAL(5,2),     -- °C
    temperatura_max_verano DECIMAL(5,2),
    temperatura_min_invierno DECIMAL(5,2),
    velocidad_viento_promedio DECIMAL(5,2),      -- m/s
    
    -- Contexto geográfico
    altitud_msnm DECIMAL(7,2),                  -- metros sobre el nivel del mar
    zona_climatica VARCHAR(50),                  -- árida, templada, tropical, etc.
    
    -- Fuente de los datos
    fuente_datos VARCHAR(100) DEFAULT 'NASA POWER', -- API utilizada
    fecha_consulta DATE,
    
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id)
);
CREATE TABLE consumo_electrico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    
    -- Consumo del cliente
    consumo_mensual_kwh DECIMAL(8,2),            -- promedio mensual en kWh
    consumo_anual_kwh DECIMAL(10,2),             -- puede calcularse automáticamente
    tarifa_kwh_mxn DECIMAL(6,4),                 -- precio que paga por kWh (MXN)
    costo_mensual_mxn DECIMAL(10,2),             -- lo que paga al mes en electricidad
    tipo_tarifa VARCHAR(20),                      -- DAC, 1, 1A, 1B... (tarifas CFE)
    
    -- Datos de recibo (opcionales pero útiles)
    numero_recibo VARCHAR(50),
    periodo_facturacion VARCHAR(50),             -- "bimestral", "mensual"
    
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id)
);
CREATE TABLE configuracion_sistema_solar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    
    -- Paneles
    marca_panel VARCHAR(100),
    modelo_panel VARCHAR(100),
    potencia_panel_wp INT,                        -- Watts pico por panel
    eficiencia_panel DECIMAL(5,2),                -- % eficiencia (ej: 20.5)
    cantidad_paneles INT,
    area_por_panel_m2 DECIMAL(5,2) DEFAULT 1.96,
    
    -- Inversor
    marca_inversor VARCHAR(100),
    modelo_inversor VARCHAR(100),
    potencia_inversor_kw DECIMAL(7,2),
    eficiencia_inversor DECIMAL(5,2) DEFAULT 97.00, -- %
    tipo_inversor ENUM('string', 'microinversor', 'hibrido') DEFAULT 'string',
    
    -- Sistema
    potencia_total_kwp DECIMAL(8,2),              -- kWp total del sistema
    tipo_conexion ENUM('red', 'aislado', 'hibrido') DEFAULT 'red',
    incluye_bateria BOOLEAN DEFAULT FALSE,
    capacidad_bateria_kwh DECIMAL(7,2),
    
    -- Degradación esperada
    degradacion_anual_pct DECIMAL(4,2) DEFAULT 0.50, -- % de pérdida anual del panel
    vida_util_anios INT DEFAULT 25,
    
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id)
);
CREATE TABLE resultados_calculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    
    -- Producción estimada
    produccion_anual_kwh DECIMAL(10,2),           -- energía generada al año
    produccion_mensual_promedio_kwh DECIMAL(8,2),
    
    -- Cobertura
    porcentaje_cobertura DECIMAL(5,2),            -- % del consumo cubierto
    excedente_kwh DECIMAL(8,2),                   -- energía que regresa a la red
    
    -- Económico
    ahorro_mensual_mxn DECIMAL(10,2),
    ahorro_anual_mxn DECIMAL(10,2),
    ahorro_vida_util_mxn DECIMAL(12,2),           -- ahorro en 25 años
    costo_total_instalacion_mxn DECIMAL(12,2),
    retorno_inversion_anios DECIMAL(5,2),         -- payback period
    
    -- Ambiental
    co2_evitado_anual_kg DECIMAL(10,2),           -- kg de CO₂ que deja de emitirse
    co2_evitado_vida_util_kg DECIMAL(12,2),
    arboles_equivalentes INT,                     -- equivalente en árboles plantados
    
    -- Financiero adicional
    precio_kwh_proyectado_anio5 DECIMAL(6,4),    -- proyección del precio de luz
    precio_kwh_proyectado_anio10 DECIMAL(6,4),
    tasa_incremento_tarifa_pct DECIMAL(4,2) DEFAULT 5.00, -- % inflación tarifaria anual
    
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id)
);
CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nombre_archivo VARCHAR(255),
    ruta_archivo VARCHAR(500),           -- ruta en servidor o URL de storage
    generado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

