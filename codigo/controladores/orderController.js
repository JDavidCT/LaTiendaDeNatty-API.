const orderModel = require('../modelos/orderModel');
const HttpError = require('../utilidades/httpError');

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new HttpError(400, 'INVALID_ID', 'El identificador debe ser un entero positivo.');
  }
  return Number(value);
}

function validateOrder(body) {
  const errors = [];
  const validEmail = typeof body?.customerEmail === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'El cuerpo debe ser un objeto JSON.');
  }
  if (typeof body.customerName !== 'string' || body.customerName.trim().length < 2 ||
      body.customerName.trim().length > 100) {
    errors.push('customerName debe tener entre 2 y 100 caracteres.');
  }
  if (!validEmail || body.customerEmail.length > 150) {
    errors.push('customerEmail debe ser un correo válido de máximo 150 caracteres.');
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
    errors.push('items debe contener entre 1 y 50 productos.');
  } else {
    const ids = new Set();
    body.items.forEach((item, index) => {
      if (!item || !Number.isSafeInteger(item.productId) || item.productId < 1) {
        errors.push(`items[${index}].productId debe ser un entero positivo.`);
      } else if (ids.has(item.productId)) {
        errors.push(`El producto ${item.productId} está repetido; envíalo una sola vez.`);
      } else {
        ids.add(item.productId);
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) {
        errors.push(`items[${index}].quantity debe ser un entero entre 1 y 1000.`);
      }
    });
  }

  if (errors.length > 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Los datos del pedido no son válidos.', errors);
  }

  return {
    customerName: body.customerName.trim(),
    customerEmail: body.customerEmail.trim().toLowerCase(),
    items: body.items
  };
}

async function create(req, res) {
  const order = await orderModel.create(validateOrder(req.body));
  res.status(201).json({ success: true, data: order });
}

async function get(req, res) {
  const order = await orderModel.findById(parseId(req.params.id));
  if (!order) {
    throw new HttpError(404, 'ORDER_NOT_FOUND', 'No se encontró el pedido solicitado.');
  }
  res.status(200).json({ success: true, data: order });
}

module.exports = { create, get };
