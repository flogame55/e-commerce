const productService = require('../services/productService');

const getAllProducts = async (req, res) => {
    try {
        const products = await productService.getProductsFromStorage();
        res.status(200).json(products); // Send data to shop.html[cite: 2]
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllProducts };