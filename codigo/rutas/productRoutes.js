const express = require('express');
const productController = require('../controladores/productController');
const asyncHandler = require('../utilidades/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(productController.list));
router.get('/:id', asyncHandler(productController.get));
router.post('/', asyncHandler(productController.create));
router.put('/:id', asyncHandler(productController.update));
router.delete('/:id', asyncHandler(productController.remove));

module.exports = router;
