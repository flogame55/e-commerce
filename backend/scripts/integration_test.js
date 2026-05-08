const { spawn } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

async function seedData() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("DELETE FROM users");
            db.run("DELETE FROM products");
            db.run("DELETE FROM orders");
            db.run(`INSERT INTO products (name, price, stock, category, image_url) VALUES ('Apple', 1.50, 100, 'Fruits', 'apple.jpg')`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

const PORT = 3000;
const API_URL = `http://localhost:${PORT}/api`;

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log("Seeding database...");
    await seedData();
    console.log("Starting server...");
    
    const serverProcess = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..') });
    serverProcess.stdout.pipe(process.stdout);
    serverProcess.stderr.pipe(process.stderr);
    
    // Wait for server to start
    await delay(2000);
    console.log("\n--- RUNNING TESTS ---\n");

    let passed = 0;
    let failed = 0;

    const assert = (condition, name) => {
        if (condition) {
            console.log(`✅ ${name}`);
            passed++;
        } else {
            console.error(`❌ ${name}`);
            failed++;
        }
    };

    try {
        // Test 1: Registration
        let res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name: "Test", email: "test@example.com", password: "password123" })
        });
        let data = await res.json();
        console.log("Test 1 Data:", data);
        assert(res.status === 201 && data.status === "Success", "Registration creates user correctly (201)");

        // Test 2: Login - User Not Found (404)
        res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "wrong@example.com", password: "password123" })
        });
        data = await res.json();
        console.log("Test 2 Data:", data);
        assert(res.status === 404 && data.status === "Fail" && data.message === "User not found", "Login fails gracefully for unknown user (404)");

        // Test 3: Login - Invalid Password (401)
        res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "test@example.com", password: "wrongpassword" })
        });
        data = await res.json();
        console.log("Test 3 Data:", data);
        assert(res.status === 401 && data.status === "Fail" && data.message === "Invalid password", "Login fails gracefully for wrong password (401)");

        // Test 4: Login - Success (200)
        res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "test@example.com", password: "password123" })
        });
        data = await res.json();
        console.log("Test 4 Data:", data);
        let testUserId = data.user ? data.user.id : 1;
        assert(res.status === 200 && data.status === "Success" && data.token, "Login succeeds with valid credentials (200)");

        // Test 5: Fetch Products
        res = await fetch(`${API_URL}/products/filter?category=Fruits`);
        data = await res.json();
        assert(res.status === 200 && Array.isArray(data) && data.length > 0 && data[0].name === "Apple", "Product filtering returns correct data");

        // Test 6: Checkout Microservice Decoupling (Offline gracefully handled)
        res = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: testUserId, cartItems: [{ id: 1, quantity: 2, price: 1.50 }] })
        });
        data = await res.json();
        console.log("Test 6 Data:", data);
        assert(res.status === 503 && data.status === "Fail" && data.message.includes("unavailable"), "Checkout decoupled user verification triggers correctly (User service offline, returns 503)");

    } catch (e) {
        console.error("Test execution error:", e);
    } finally {
        console.log(`\n--- TEST SUMMARY ---`);
        console.log(`Passed: ${passed} | Failed: ${failed}`);
        
        serverProcess.kill();
        db.close();
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();
