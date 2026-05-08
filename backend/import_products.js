const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const jsonPath = path.join(__dirname, 'data', 'products.json');

// Read products from JSON
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // We use INSERT OR REPLACE to update existing products or insert new ones
  const stmt = db.prepare('INSERT OR REPLACE INTO products (id, name, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)');
  
  let fruitCount = 0;
  let totalCount = 0;

  // The user asked to "get fruit infomation to datbase from product.json".
  // We'll insert all produce but count them.
  for (const p of products) {
    // Mapping: p.image -> image_url, p.quantity -> stock
    stmt.run(p.id, p.name, p.price, p.quantity || 0, p.category, p.image);
    totalCount++;
    if (p.category === 'Fruits') fruitCount++;
  }
  stmt.finalize();

  db.all('SELECT COUNT(*) as count FROM products', (err, rows) => {
    if (err) throw err;
    console.log(`Inserted/Updated ${totalCount} products in total (including ${fruitCount} fruits).`);
    console.log(`Total records in 'products' table: ${rows[0].count}`);
    db.close();
  });
});
