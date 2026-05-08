const db = require('../config/database');

const createUser = (firstName, email, passwordHash) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO users (first_name, email, password_hash) VALUES (?, ?, ?)`;
        db.run(sql, [firstName, email, passwordHash], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID });
            }
        });
    });
};

const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const findUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT id FROM users WHERE id = ?", [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};
