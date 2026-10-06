const express = require('express');
const orderController = require('../controladores/orderController');
const asyncHandler = require('../utilidades/asyncHandler');

const router = express.Router();

router.post('/', asyncHandler(orderController.create));
router.get('/:id', asyncHandler(orderController.get));

module.exports = router;
