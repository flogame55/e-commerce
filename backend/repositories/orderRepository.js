const db = require('../config/database');
const productRepository = require('./productRepository');

const saveOrderToDB = (orderData) => {
    return new Promise((resolve, reject) => {
        const { user_id, product_id, quantity, total_price } = orderData;
        const sql = `INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)`;
        db.run(sql, [user_id, product_id, quantity, total_price], function (err) {
            if (err) {
                console.error("Database Insert Error:", err.message);
                reject(err);
            } else {
                resolve({ success: true, id: this.lastID });
            }
        });
    });
};

const processCheckoutTransaction = (userId, cartItems) => {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            db.run("BEGIN TRANSACTION");

            try {
                for (const item of cartItems) {
                    const orderData = {
                        user_id: userId,
                        product_id: item.id,
                        quantity: item.quantity,
                        total_price: item.price * item.quantity
                    };

                    await saveOrderToDB(orderData);
                    await productRepository.updateProductStock(item.id, item.quantity);
                }

                db.run("COMMIT", (err) => {
                    if (err) reject(err);
                    else resolve({ success: true });
                });

            } catch (error) {
                db.run("ROLLBACK");
                reject(error);
            }
        });
    });
};

module.exports = {
    processCheckoutTransaction
};
