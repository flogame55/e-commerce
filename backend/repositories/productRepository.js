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
        const sql = `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`;
        db.run(sql, [quantityToDeduct, productId, quantityToDeduct], function(err) {
            if (err) reject(err);
            else if (this.changes === 0) {
                const error = new Error(`Insufficient stock for product ${productId}`);
                error.statusCode = 400;
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

const getProductsByIds = (ids) => {
    return new Promise((resolve, reject) => {
        if (!ids || ids.length === 0) return resolve([]);
        const placeholders = ids.map(() => '?').join(',');
        const sql = `SELECT * FROM products WHERE id IN (${placeholders})`;
        db.all(sql, ids, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = {
    getFilteredProducts,
    getProductById,
    getProductsByIds,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
};
