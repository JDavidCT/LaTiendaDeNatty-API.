const productModel = require('../modelos/productModel');
const HttpError = require('../utilidades/httpError');

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new HttpError(400, 'INVALID_ID', 'El identificador debe ser un entero positivo.');
  }
  return Number(value);
}

function validateProduct(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'El cuerpo debe ser un objeto JSON.');
  }
  if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 100) {
    errors.push('name debe tener entre 2 y 100 caracteres.');
  }
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('description debe ser texto.');
  }
  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0 || body.price > 99999999.99) {
    errors.push('price debe ser un número mayor que 0 y no superior a 99999999.99.');
  }
  if (!Number.isInteger(body.stock) || body.stock < 0 || body.stock > 2147483647) {
    errors.push('stock debe ser un entero igual o mayor que 0.');
  }
  if (body.category !== undefined && body.category !== null &&
      (typeof body.category !== 'string' || body.category.length > 50)) {
    errors.push('category debe ser texto de máximo 50 caracteres o null.');
  }

  if (errors.length > 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Los datos del producto no son válidos.', errors);
  }

  return {
    name: body.name.trim(),
    description: body.description === undefined ? '' : body.description.trim(),
    price: Math.round(body.price * 100) / 100,
    stock: body.stock,
    category: body.category === undefined ? null : body.category
  };
}

async function list(req, res) {
  const products = await productModel.findAll();
  res.status(200).json({ success: true, data: products });
}

async function get(req, res) {
  const product = await productModel.findById(parseId(req.params.id));
  if (!product) {
    throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'No se encontró el producto solicitado.');
  }
  res.status(200).json({ success: true, data: product });
}

async function create(req, res) {
  const product = await productModel.create(validateProduct(req.body));
  res.status(201).json({ success: true, data: product });
}

async function update(req, res) {
  const product = await productModel.update(parseId(req.params.id), validateProduct(req.body));
  if (!product) {
    throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'No se encontró el producto solicitado.');
  }
  res.status(200).json({ success: true, data: product });
}

async function remove(req, res) {
  const id = parseId(req.params.id);
  try {
    const removed = await productModel.remove(id);
    if (!removed) {
      throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'No se encontró el producto solicitado.');
    }
    res.status(200).json({ success: true, data: { id, message: 'Producto eliminado.' } });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new HttpError(409, 'PRODUCT_HAS_ORDERS', 'No se puede eliminar un producto asociado a pedidos.');
    }
    throw error;
  }
}

module.exports = { list, get, create, update, remove };
