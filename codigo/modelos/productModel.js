const pool = require('../configuracion/database');

const fields = `
  id_producto AS id,
  nombre AS name,
  descripcion AS description,
  precio AS price,
  stock,
  categoria AS category
`;

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT ${fields} FROM api_productos ORDER BY id_producto`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${fields} FROM api_productos WHERE id_producto = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(product) {
  const [result] = await pool.execute(
    `INSERT INTO api_productos (nombre, descripcion, precio, stock, categoria)
     VALUES (?, ?, ?, ?, ?)`,
    [product.name, product.description, product.price, product.stock, product.category]
  );
  return findById(result.insertId);
}

async function update(id, product) {
  const [result] = await pool.execute(
    `UPDATE api_productos
     SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?
     WHERE id_producto = ?`,
    [product.name, product.description, product.price, product.stock, product.category, id]
  );
  return result.affectedRows === 0 ? null : findById(id);
}

async function remove(id) {
  const [result] = await pool.execute(
    'DELETE FROM api_productos WHERE id_producto = ?',
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
