const db = require('../config/database');

const getFilteredProducts = (category) => {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM products";
        let params = [];

        if (category && category !== 'All') {
            sql += " WHERE category = ?";
            params.push(category);
        }

        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const getProductById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const createProduct = (product) => {
    return new Promise((resolve, reject) => {
        const { name, price, stock, category, image_url } = product;
        const sql = `INSERT INTO products (name, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [name, price, stock, category, image_url], function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
};

const updateProduct = (id, product) => {
    return new Promise((resolve, reject) => {
        const { name, price, stock, category, image_url } = product;
        const sql = `UPDATE products SET name = ?, price = ?, stock = ?, category = ?, image_url = ? WHERE id = ?`;
        db.run(sql, [name, price, stock, category, image_url, id], function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
};

const deleteProduct = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM products WHERE id = ?", [id], function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
};

const updateProductStock = (productId, quantityToDeduct) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE products SET quantity = quantity - ? WHERE id = ?", [quantityToDeduct, productId], function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
};

module.exports = {
    getFilteredProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
};
