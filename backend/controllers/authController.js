const authService = require('../services/authService');

const register = async (req, res, next) => {
    const { first_name, email, password } = req.body;
    try {
        const result = await authService.registerUser(first_name, email, password);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const result = await authService.loginUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login
};
