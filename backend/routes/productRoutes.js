const express = require('express');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authenticateToken, requireSeller } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticateToken, requireSeller, createProduct);
router.put('/:id', authenticateToken, requireSeller, updateProduct);
router.delete('/:id', authenticateToken, requireSeller, deleteProduct);

module.exports = router;
