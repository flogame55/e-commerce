const fs = require('fs').promises;
const path = require('path');
const productRepository = require('../repositories/productRepository');

const allowedCategories = ['Vegetables', 'Fruits', 'Juice', 'Dried', 'Hat', 'All'];

// Path to your local JSON data[cite: 4]
const dataPath = path.join(__dirname, '../data/products.json');

const getProductsFromStorage = async () => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data); // Returns the array of products[cite: 1]
    } catch (error) {
        throw new Error("Could not read product data");
    }
};

const getFilteredProducts = async (category) => {
    if (category && !allowedCategories.includes(category)) {
        const error = new Error("Invalid Category Envelope");
        error.statusCode = 403;
        throw error;
    }
    
    return await productRepository.getFilteredProducts(category);
};

const getProductById = async (id) => {
    const product = await productRepository.getProductById(id);
    if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }
    return product;
};

const createProduct = async (product) => {
    if (!product.name || !product.price) {
        const error = new Error("Name and price are required");
        error.statusCode = 400;
        throw error;
    }
    return await productRepository.createProduct(product);
};

const updateProduct = async (id, product) => {
    return await productRepository.updateProduct(id, product);
};

const deleteProduct = async (id) => {
    return await productRepository.deleteProduct(id);
};

const getProductsByIds = async (ids) => {
    return await productRepository.getProductsByIds(ids);
};

module.exports = { 
    getProductsFromStorage, 
    getFilteredProducts,
    getProductById,
    getProductsByIds,
    createProduct,
    updateProduct,
    deleteProduct
};