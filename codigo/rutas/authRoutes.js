const express = require('express');
const authController = require('../controladores/authController');
const authenticate = require('../middlewares/authMiddleware');
const asyncHandler = require('../utilidades/asyncHandler');

const router = express.Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/profile', authenticate, authController.profile);

module.exports = router;
