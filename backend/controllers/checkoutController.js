const checkoutService = require('../services/checkoutService');

const checkout = async (req, res, next) => {
    const { user_id, cartItems } = req.body;
    try {
        const result = await checkoutService.processCheckout(user_id, cartItems);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    checkout
};
