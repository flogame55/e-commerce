const productService = require('../services/productService');

const getAllProducts = async (req, res, next) => {
    try {
        const products = await productService.getProductsFromStorage();
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

const filterProducts = async (req, res, next) => {
    const category = req.query.category;
    try {
        const products = await productService.getFilteredProducts(category);
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllProducts, filterProducts, getProductById };