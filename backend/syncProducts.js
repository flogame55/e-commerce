const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 1. Setup Paths[cite: 4]
const dbPath = path.join(__dirname, 'database.db');
const jsonPath = path.join(__dirname, 'data/products.json');

const db = new sqlite3.Database(dbPath);

// 2. Read the JSON Data
const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

db.serialize(() => {
    console.log("🔄 Starting Sync: JSON -> SQLite...");

    // 3. Prepare the Update Statement[cite: 4]
    // We use a transaction for 'Atomicity' - all update or none do
    db.run("BEGIN TRANSACTION");

    const stmt = db.prepare("UPDATE products SET quantity = ? WHERE id = ?");

    productsData.forEach((product) => {
        stmt.run(product.quantity, product.id, (err) => {
            if (err) {
                console.error(`❌ Error updating ID ${product.id}:`, err.message);
            }
        });
    });

    stmt.finalize();

    db.run("COMMIT", (err) => {
        if (err) {
            console.error("❌ Sync Failed (Transaction Rollback):", err.message);
        } else {
            console.log("✅ Sync Complete! Database now matches products_2.json.");
        }
        db.close();
    });
});