const checkoutService = require('../services/checkoutService');

const checkout = async (req, res, next) => {
    const { cartItems } = req.body;
    try {
        // req.user is set by authMiddleware from the verified JWT token
        const result = await checkoutService.processCheckout(req.user.id, cartItems);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    checkout
};
