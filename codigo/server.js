require('dotenv').config();

const app = require('./app');
const pool = require('./configuracion/database');

const port = Number(process.env.PORT || 3001);

async function start() {
  if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
    throw new Error('JWT_SECRET debe estar configurado y contener al menos 32 bytes.');
  }

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
