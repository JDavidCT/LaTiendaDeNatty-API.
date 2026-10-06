const express = require('express');
const helmet = require('helmet');
const productRoutes = require('./rutas/productRoutes');
const orderRoutes = require('./rutas/orderRoutes');
const { notFound, errorHandler } = require('./manejo-errores/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '100kb' }));

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
