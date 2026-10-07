const express = require('express');
const { createOrder, getMyOrders, getAllOrders } = require('../controllers/orderController');
const { authenticateToken, requireSeller } = require('../middleware/auth');

const router = express.Router();

router.post('/', createOrder);
router.get('/me', authenticateToken, getMyOrders);
router.get('/', authenticateToken, requireSeller, getAllOrders);

module.exports = router;
