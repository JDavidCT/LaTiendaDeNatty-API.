-- Esquema exclusivo para la API de la evidencia; no altera la base latienda existente.
CREATE DATABASE IF NOT EXISTS latienda_api
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE latienda_api;

CREATE TABLE IF NOT EXISTS api_productos (
  id_producto INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  categoria VARCHAR(50) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  CONSTRAINT chk_api_productos_precio CHECK (precio > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS api_pedidos (
  id_pedido INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre_cliente VARCHAR(100) NOT NULL,
  correo_cliente VARCHAR(150) NOT NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(15, 2) NOT NULL,
  estado ENUM('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')
    NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (id_pedido),
  KEY ix_api_pedidos_correo (correo_cliente),
  KEY ix_api_pedidos_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS api_detalle_pedido (
  id_detalle INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_pedido INT UNSIGNED NOT NULL,
  id_producto INT UNSIGNED NOT NULL,
  nombre_producto VARCHAR(100) NOT NULL,
  cantidad INT UNSIGNED NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id_detalle),
  KEY ix_api_detalle_pedido (id_pedido),
  KEY ix_api_detalle_producto (id_producto),
  CONSTRAINT fk_api_detalle_pedido
    FOREIGN KEY (id_pedido) REFERENCES api_pedidos (id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_api_detalle_producto
    FOREIGN KEY (id_producto) REFERENCES api_productos (id_producto) ON DELETE RESTRICT,
  CONSTRAINT chk_api_detalle_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
