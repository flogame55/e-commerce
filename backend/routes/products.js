const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Handles GET request to /api/products
router.get('/', productController.getAllProducts);

module.exports = router;