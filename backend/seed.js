const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// 1. Path to your legacy data
const jsonPath = path.join(__dirname, 'data/auth_user.json');
const dbPath = path.join(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath);

async function migrateUsers() {
    try {
        // Read the JSON file[cite: 5]
        const rawData = fs.readFileSync(jsonPath);
        const users = JSON.parse(rawData);

        console.log(`Starting migration of ${users.length} users...`);

        for (const user of users) {
            // WE UPGRADE THE SECURITY: Replace MD5 with a Bcrypt hash of 'Welcome123'
            const defaultPassword = 'Welcome123';
            const newBcryptHash = await bcrypt.hash(defaultPassword, 10);

            const sql = `INSERT OR IGNORE INTO users (first_name, email, password_hash, reg_date) 
                         VALUES (?, ?, ?, ?)`;

            // Map the JSON fields to our DB columns
            db.run(sql, [
                user.first_name,
                user.username, // Using username from JSON as the email[cite: 5]
                newBcryptHash,
                user.reg_date
            ]);
        }

        console.log("Migration Complete! All users can now login with password: Welcome123");
    } catch (err) {
        console.error("Migration Failed:", err.message);
    }
}

migrateUsers();