const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1);
}

const registerUser = async (firstName, email, password) => {
    if (!firstName || !email || !password) {
        const error = new Error("All fields are required");
        error.statusCode = 400;
        throw error;
    }

    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const error = new Error("Invalid email format");
        error.statusCode = 400;
        throw error;
    }
    if (password.length < 8) {
        const error = new Error("Password must be at least 8 characters");
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        await userRepository.createUser(firstName, email, hashedPassword);
        return { status: "Success", message: "User registered in database" };
    } catch (err) {
        if (err.message && err.message.includes("UNIQUE constraint failed")) {
            const error = new Error("User already exists in Database!");
            error.statusCode = 400;
            throw error;
        }
        console.error("Registration DB Error:", err.message);
        const error = new Error("Failed to save to database");
        error.statusCode = 500;
        throw error;
    }
};

const loginUser = async (email, password) => {
    if (!email || !password) {
        const error = new Error("Email and password are required");
        error.statusCode = 400;
        throw error;
    }

    try {
        const user = await userRepository.findUserByEmail(email);
        // Use the same bcrypt.compare flow for both cases to prevent timing attacks
        const isMatch = user ? await bcrypt.compare(password, user.password_hash) : false;

        // SECURITY: Same error message for wrong email AND wrong password
        // Prevents user enumeration attacks (OWASP)
        if (!user || !isMatch) {
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            throw error;
        }

        // Include user id in JWT payload for auth middleware
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        
        return {
            status: "Success",
            token: token,
            user: { id: user.id, first_name: user.first_name, email: user.email }
        };
    } catch (err) {
        if(err.statusCode) throw err;
        console.error("Login DB Error:", err.message);
        const error = new Error("Server Error");
        error.statusCode = 500;
        throw error;
    }
};

const verifyUser = async (id) => {
    try {
        const user = await userRepository.findUserById(id);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        return user;
    } catch(err) {
        if(err.statusCode) throw err;
        const error = new Error("Server Error");
        error.statusCode = 500;
        throw error;
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyUser
};
