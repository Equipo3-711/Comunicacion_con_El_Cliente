-- Esquema de la base de datos del Portal de Proyectos (MySQL 8).
-- Se carga sobre una base vacía:
--   mysql -u USUARIO -p portal_proyectos < database/schema.sql
-- ATENCIÓN: borra las tablas si ya existen, junto con sus datos.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS pendientes, mensajes, documentos, actividades, actualizaciones,
  cotizacion_archivos, cotizaciones, proyectos, usuarios, empresas;
SET FOREIGN_KEY_CHECKS = 1;

-- Empresa que contrata a la vidriería (el cliente).
CREATE TABLE empresas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Personas que entran al portal. admin = personal de la vidriería; cliente = contacto de una empresa (RNF-06).
CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(160) NOT NULL,
  telefono VARCHAR(30) NULL,
  contrasena_hash VARCHAR(100) NOT NULL,
  rol ENUM('admin', 'cliente') NOT NULL,
  empresa_id INT UNSIGNED NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_correo (correo),
  KEY ix_usuarios_empresa (empresa_id),
  CONSTRAINT fk_usuarios_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id),
  CONSTRAINT ck_usuarios_cliente_con_empresa CHECK (rol = 'admin' OR empresa_id IS NOT NULL)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Obras de cada empresa (RF-07, RF-08). notas_internas nunca se muestra al cliente (T-06).
-- atencion es el semáforo de las dudas: cambia solo con el chat y el arquitecto lo ajusta a mano.
CREATE TABLE proyectos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo_trabajo ENUM('ventanas', 'fachada', 'canceles', 'barandales') NOT NULL,
  estado ENUM('cotizacion', 'en_proceso', 'en_instalacion', 'terminado') NOT NULL DEFAULT 'cotizacion',
  responsable_id INT UNSIGNED NOT NULL,
  presupuesto DECIMAL(12, 2) NULL,
  pagado DECIMAL(12, 2) NOT NULL DEFAULT 0,
  garantia_hasta DATE NULL,
  notas_internas TEXT NULL,
  atencion ENUM('no_atendido', 'pendiente', 'atendido') NOT NULL DEFAULT 'atendido',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_proyectos_empresa (empresa_id),
  CONSTRAINT fk_proyectos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id),
  CONSTRAINT fk_proyectos_responsable FOREIGN KEY (responsable_id) REFERENCES usuarios (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Solicitudes de cotización, siempre de un cliente registrado (RF-03, CC-01, CC-10).
CREATE TABLE cotizaciones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  tipo_cliente ENUM('particular', 'constructora', 'arquitecto', 'otro') NOT NULL,
  tipo_trabajo ENUM('ventanas', 'fachada', 'canceles', 'barandales') NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  medidas VARCHAR(255) NULL,
  descripcion TEXT NOT NULL,
  estado ENUM('recibida', 'en_revision', 'enviada') NOT NULL DEFAULT 'recibida',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_cotizaciones_usuario (usuario_id),
  CONSTRAINT fk_cotizaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Fotos o planos opcionales de una cotización.
CREATE TABLE cotizacion_archivos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cotizacion_id INT UNSIGNED NOT NULL,
  nombre_original VARCHAR(255) NOT NULL,
  ruta VARCHAR(255) NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cot_archivos_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Historial de lo que ha sucedido en cada proyecto (RF-06, RF-16, CC-04, CC-06).
CREATE TABLE actualizaciones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proyecto_id INT UNSIGNED NOT NULL,
  tipo ENUM('avance', 'cambio_estado', 'documento', 'solicitud') NOT NULL,
  descripcion VARCHAR(500) NOT NULL,
  responsable_id INT UNSIGNED NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_actualizaciones_proyecto (proyecto_id, creado_en),
  CONSTRAINT fk_actualizaciones_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos (id),
  CONSTRAINT fk_actualizaciones_responsable FOREIGN KEY (responsable_id) REFERENCES usuarios (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Actividades que el arquitecto marca como realizadas (RF-17, CC-07).
CREATE TABLE actividades (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proyecto_id INT UNSIGNED NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  realizada BOOLEAN NOT NULL DEFAULT FALSE,
  realizada_en DATETIME NULL,
  realizada_por INT UNSIGNED NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_actividades_proyecto (proyecto_id),
  CONSTRAINT fk_actividades_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos (id),
  CONSTRAINT fk_actividades_usuario FOREIGN KEY (realizada_por) REFERENCES usuarios (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Documentos del proyecto: se ven en el portal, sin opción de descarga (RF-08, RF-10, CC-02).
CREATE TABLE documentos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proyecto_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  ruta VARCHAR(255) NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  subido_por INT UNSIGNED NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_documentos_proyecto (proyecto_id),
  CONSTRAINT fk_documentos_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos (id),
  CONSTRAINT fk_documentos_usuario FOREIGN KEY (subido_por) REFERENCES usuarios (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Chat del proyecto, solo para dudas (CC-04). Se conserva al menos 12 meses (RNF-08).
CREATE TABLE mensajes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proyecto_id INT UNSIGNED NOT NULL,
  autor_id INT UNSIGNED NOT NULL,
  texto VARCHAR(1000) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_mensajes_proyecto (proyecto_id, creado_en),
  CONSTRAINT fk_mensajes_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos (id),
  CONSTRAINT fk_mensajes_autor FOREIGN KEY (autor_id) REFERENCES usuarios (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Lo que alimenta la campana de cada usuario (RF-18, CC-08).
CREATE TABLE pendientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  tipo ENUM('actualizacion', 'mensaje', 'cotizacion') NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  proyecto_id INT UNSIGNED NULL,
  leido BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_pendientes_usuario (usuario_id, leido),
  CONSTRAINT fk_pendientes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  CONSTRAINT fk_pendientes_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
