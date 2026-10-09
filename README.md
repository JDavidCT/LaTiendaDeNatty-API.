# API REST — La Tienda de Natty

Servicio web independiente desarrollado con **Node.js**, **Express** y **MySQL** para gestionar el catálogo de productos y el procesamiento de pedidos de La Tienda de Natty.

---

# Requisitos e Instalación Local

1. **Importar la Base de Datos:**
   Ejecuta el archivo `base-datos/esquema.sql` en MySQL Workbench para crear la base de datos `latienda_api` y sus tablas.

2. **Configurar Variables de Entorno:**
   Crea un archivo `.env` en la raíz del proyecto (puedes guiarte con `.env.example`) y configura tus credenciales locales de MySQL:

   ```env
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=latienda_api
   JWT_SECRET=un-secreto-aleatorio-de-al-menos-32-bytes
   JWT_EXPIRES_IN=1h

 * Instalar Dependencias e Iniciar:
   Abre la consola en la carpeta del proyecto y ejecuta:
   npm install
npm run dev

   El servidor se iniciará en http://localhost:3001/api/v1.

   Para ejecutar las pruebas unitarias: `npm test`.

 Endpoints Disponibles
Autenticación
 * POST /api/v1/auth/register — Registrar usuario (`name`, `email`, `password`).
 * POST /api/v1/auth/login — Iniciar sesión (`email`, `password`).
 * GET /api/v1/auth/profile — Obtener el perfil; requiere `Authorization: Bearer <token>`.
Productos
 * GET /api/v1/products — Obtener todos los productos.
 * GET /api/v1/products/:id — Obtener un producto por su ID.
 * POST /api/v1/products — Crear un nuevo producto.
 * PUT /api/v1/products/:id — Actualizar un producto existente.
 * DELETE /api/v1/products/:id — Eliminar un producto.
Pedidos
 * POST /api/v1/orders — Crear un nuevo pedido (descuenta inventario automáticamente).
 * GET /api/v1/orders/:id — Obtener el detalle de un pedido.
Diagnóstico
 * GET /api/v1/health — Verificar el estado del servidor y la base de datos.
 Pruebas en Postman
En la carpeta pruebas-postman/ se encuentra la colección Coleccion-Postman.json lista para ser importada en Postman y realizar las pruebas a cada uno de los endpoints.