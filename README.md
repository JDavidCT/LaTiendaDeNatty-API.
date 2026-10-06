# API REST independiente — La Tienda de Natty

Evidencia SENA **GA7-220501096-AA5-EV03: Diseño y desarrollo de servicios web – proyecto**.

Esta API se ejecuta como un servicio Node.js/Express separado, se prueba desde Postman y no se conecta con el frontend. El esquema crea una base nueva `latienda_api` y usa tablas `api_*`; no modifica archivos ni tablas de la aplicación base.

## Alcance y propuesta de servicios

Se implementan **7 endpoints funcionales**:

| Método | Ruta | Descripción | Éxito |
|---|---|---|---|
| GET | `/api/v1/products` | Lista productos | 200 |
| GET | `/api/v1/products/:id` | Consulta un producto | 200 |
| POST | `/api/v1/products` | Crea producto | 201 |
| PUT | `/api/v1/products/:id` | Reemplaza los datos editables del producto | 200 |
| DELETE | `/api/v1/products/:id` | Elimina un producto no asociado a pedidos | 200 |
| POST | `/api/v1/orders` | Crea pedido, registra detalle y descuenta stock en una transacción | 201 |
| GET | `/api/v1/orders/:id` | Consulta pedido y sus productos | 200 |

`GET /api/v1/health` es una ruta técnica para comprobar disponibilidad, no una operación del negocio. La categoría se maneja como texto del producto; no se añade un CRUD separado. El carrito no se persiste: el cliente envía sus artículos al crear el pedido.

## Estructura

```text
API_TIENDA_NATTY/
├── pruebas-postman/Coleccion-Postman.json
├── base-datos/esquema.sql
├── codigo/
│   ├── configuracion/
│   ├── controladores/
│   ├── manejo-errores/
│   ├── modelos/
│   ├── rutas/
│   ├── utilidades/
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── LEEME.md
```

## Requisitos e instalación local (Windows PowerShell)

Se requiere Node.js 18 o superior y MySQL 8.

1. Abre PowerShell dentro de `API_TIENDA_NATTY`.
2. Crea el esquema exclusivo de la API:

   ```powershell
   Get-Content .\base-datos\esquema.sql | mysql -u root -p
   ```

   Si el comando `mysql` no está disponible, ejecuta `base-datos/esquema.sql` desde MySQL Workbench.
3. Crea tu archivo de configuración local y edítalo con las credenciales de MySQL:

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

4. Instala dependencias y arranca el servidor:

   ```powershell
   npm install
   npm run check
   npm run dev
   ```

5. Importa `pruebas-postman/Coleccion-Postman.json` en Postman. Envía primero un POST de producto y usa el `id` que devuelve en las variables `productId` y en la solicitud del pedido. Deja para el final las pruebas de actualizar y eliminar.

Dirección local: `http://localhost:3001/api/v1`.

## Contratos JSON

Todas las respuestas exitosas siguen el formato `{ "success": true, "data": ... }`.

### Crear producto — POST `/products`

```json
{
  "name": "Crema hidratante",
  "description": "Hidratante para uso diario",
  "price": 45900,
  "stock": 25,
  "category": "Cuidado facial"
}
```

`name` (2–100 caracteres), `price` (número positivo, máximo 99.999.999,99) y `stock` (entero no negativo) son obligatorios. `description` es texto opcional y `category` es texto de máximo 50 caracteres o `null`.

Respuesta `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Crema hidratante",
    "description": "Hidratante para uso diario",
    "price": 45900,
    "stock": 25,
    "category": "Cuidado facial"
  }
}
```

### Actualizar producto — PUT `/products/:id`

Envía el mismo formato JSON del alta. Es una actualización completa de los campos editables. Responde `200 OK` con el producto actualizado.

### Crear pedido — POST `/orders`

```json
{
  "customerName": "David Tabares",
  "customerEmail": "david@example.com",
  "items": [
    { "productId": 1, "quantity": 2 }
  ]
}
```

El nombre debe tener 2–100 caracteres; el correo debe tener formato válido. `items` contiene entre 1 y 50 productos diferentes; cada `productId` es entero positivo y `quantity` es entero entre 1 y 1000. El servidor consulta precio y stock en MySQL: no acepta precios enviados por el cliente. Responde `201 Created` con el pedido, sus artículos, el total calculado y el estado `pendiente`.

### Consultar pedido — GET `/orders/:id`

Responde `200 OK` con datos del pedido y artículos (incluidos nombre y precio unitario guardados en el detalle).

### Eliminar producto — DELETE `/products/:id`

Responde `200 OK` con `{ "success": true, "data": { "id": 1, "message": "Producto eliminado." } }`. Responde `409 Conflict` si el producto ya aparece en un pedido.

## Errores y códigos HTTP

El formato común es:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos del producto no son válidos.",
    "details": ["price debe ser un número mayor que 0."]
  }
}
```

| Código HTTP | Cuándo ocurre |
|---|---|
| 400 | JSON mal formado, campos inválidos, ID inválido o producto inexistente en el pedido |
| 404 | Ruta, producto o pedido no encontrado |
| 409 | Stock insuficiente o intento de eliminar producto incluido en un pedido |
| 500 | Error inesperado; el detalle queda en la consola del servidor y no se expone al cliente |

## Consideraciones para la sustentación

- El servidor consulta MySQL al iniciar y no acepta conexiones si la base de datos no está disponible.
- El alta de pedido usa transacción SQL y bloquea el inventario mientras valida y descuenta existencias; un fallo revierte la operación.
- Esta versión académica sirve para ejecución local y pruebas Postman. No tiene autenticación, autorización ni conexión con el frontend; no publiques sus operaciones de escritura en internet sin protegerlas.
- Cambia `DB_USER` y `DB_PASSWORD` en `.env` por credenciales locales. `.env` está excluido de Git; nunca se entrega ni se sube con claves reales.

## Repositorio GitHub independiente

Para que la API no quede dentro del historial del proyecto Java, cópiala a una carpeta fuera del repositorio principal y crea allí el repositorio independiente:

```powershell
Copy-Item -Recurse "C:\ruta\LaTienda-copia\API_TIENDA_NATTY" "C:\Users\$env:USERNAME\Desktop\LaTiendaDeNatty-API"
Set-Location "C:\Users\$env:USERNAME\Desktop\LaTiendaDeNatty-API"
git init
git add .
git status
git commit -m "Crear API REST para evidencia GA7-220501096-AA5-EV03"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/LaTiendaDeNatty-API.git
git push -u origin main
```

Crea primero el repositorio vacío `LaTiendaDeNatty-API` en GitHub. Antes del `git add`, confirma con `git status` que `.env` y `node_modules` no aparezcan. Este flujo no ejecuta commits ni cambios de Git dentro del repositorio principal.

## Entrega comprimida para Zajuna

Nombre sugerido: `DAVID_TABARES_AA5_EV03.zip`.

```text
DAVID_TABARES_AA5_EV03/
├── LEEME.md
├── API/
│   ├── codigo/                      (controladores, modelos y rutas)
│   ├── base-datos/esquema.sql
│   ├── pruebas-postman/Coleccion-Postman.json
│   ├── package.json
│   ├── package-lock.json            (si fue generado por npm install)
│   ├── .env.example
│   └── .gitignore
└── Evidencias_Postman/
    ├── 01_listar_productos.png
    ├── 02_crear_producto.png
    ├── 03_crear_pedido.png
    └── 04_error_validacion.png
```

Incluye capturas reales de Postman y la colección importable. No incluyas `.env`, contraseñas, `node_modules`, volcados de datos personales ni el repositorio completo de la plataforma. Comprime la carpeta de entrega, no el proyecto base.
