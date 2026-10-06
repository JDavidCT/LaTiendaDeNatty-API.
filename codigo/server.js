require('dotenv').config();

const app = require('./app');
const pool = require('./configuracion/database');

const port = Number(process.env.PORT || 3001);

async function start() {
  // No se inicia el servidor si la base de datos no está disponible.
  await pool.query('SELECT 1');
  app.listen(port, () => {
    console.log(`API La Tienda de Natty disponible en http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('No fue posible iniciar la API. Verifica MySQL y las variables de entorno.', error);
  process.exitCode = 1;
});
