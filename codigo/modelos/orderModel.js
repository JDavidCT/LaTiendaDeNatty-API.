const pool = require('../configuracion/database');
const HttpError = require('../utilidades/httpError');

async function create({ customerName, customerEmail, items }) {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    const productIds = items.map((item) => item.productId);
    const [products] = await connection.execute(
      `SELECT id_producto, nombre, precio, stock
       FROM api_productos
       WHERE id_producto IN (${productIds.map(() => '?').join(',')})
       FOR UPDATE`,
      productIds
    );
    const productsById = new Map(products.map((product) => [product.id_producto, product]));

    let totalCents = 0;
    const orderItems = items.map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new HttpError(400, 'PRODUCT_NOT_FOUND', `No existe el producto ${item.productId}.`);
      }
      if (product.stock < item.quantity) {
        throw new HttpError(
          409,
          'INSUFFICIENT_STOCK',
          `Stock insuficiente para "${product.nombre}".`,
          { productId: item.productId, available: product.stock, requested: item.quantity }
        );
      }

      const unitPrice = Number(product.precio);
      const unitPriceCents = Math.round(unitPrice * 100);
      totalCents += unitPriceCents * item.quantity;

      return {
        ...item,
        productName: product.nombre,
        unitPrice,
        subtotal: (unitPriceCents * item.quantity) / 100
      };
    });

    const total = totalCents / 100;
    const [orderResult] = await connection.execute(
      `INSERT INTO api_pedidos (nombre_cliente, correo_cliente, total)
       VALUES (?, ?, ?)`,
      [customerName, customerEmail, total]
    );
    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.execute(
        `INSERT INTO api_detalle_pedido
           (id_pedido, id_producto, nombre_producto, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.productName, item.quantity, item.unitPrice]
      );
      await connection.execute(
        'UPDATE api_productos SET stock = stock - ? WHERE id_producto = ?',
        [item.quantity, item.productId]
      );
    }

    await connection.commit();
    transactionStarted = false;
    return {
      id: orderId,
      customerName,
      customerEmail,
      status: 'pendiente',
      total,
      items: orderItems
    };
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('No fue posible revertir la transacción del pedido.', rollbackError);
      }
    }
    throw error;
  } finally {
    connection.release();
  }
}

async function findById(id) {
  const [orders] = await pool.execute(
    `SELECT id_pedido AS id, nombre_cliente AS customerName,
            correo_cliente AS customerEmail, fecha AS createdAt,
            total, estado AS status
     FROM api_pedidos
     WHERE id_pedido = ?`,
    [id]
  );

  if (orders.length === 0) {
    return null;
  }

  const [items] = await pool.execute(
    `SELECT id_producto AS productId, nombre_producto AS productName,
            cantidad AS quantity, precio_unitario AS unitPrice,
            (cantidad * precio_unitario) AS subtotal
     FROM api_detalle_pedido
     WHERE id_pedido = ?
     ORDER BY id_detalle`,
    [id]
  );

  return { ...orders[0], items };
}

module.exports = { create, findById };
