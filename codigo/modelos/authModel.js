const pool = require('../configuracion/database');

async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id_usuario AS id, nombre AS name, correo AS email, password_hash AS passwordHash
     FROM api_usuarios
     WHERE correo = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function create({ name, email, passwordHash }) {
  const [result] = await pool.execute(
    `INSERT INTO api_usuarios (nombre, correo, password_hash)
     VALUES (?, ?, ?)`,
    [name, email, passwordHash]
  );
  return { id: result.insertId, name, email };
}

module.exports = { findByEmail, create };
