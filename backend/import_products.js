const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const jsonPath = path.join(__dirname, 'data', 'products.json');

// Read products from JSON
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS products');
  db.run(`CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price REAL,
    image TEXT,
    category TEXT
  )`);

  const stmt = db.prepare('INSERT INTO products (id, name, price, image, category) VALUES (?, ?, ?, ?, ?)');
  for (const p of products) {
    stmt.run(p.id, p.name, p.price, p.image, p.category);
  }
  stmt.finalize();

  db.all('SELECT COUNT(*) as count FROM products', (err, rows) => {
    if (err) throw err;
    console.log('Inserted products:', rows[0].count);
    db.close();
  });
});
