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

const verifyUser = async (req, res, next) => {
    try {
        const user = await authService.verifyUser(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    verifyUser
};
