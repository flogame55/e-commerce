const fs = require('fs').promises;
const path = require('path');

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

module.exports = { getProductsFromStorage };