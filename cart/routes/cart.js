const router = require('express').Router();
const { addToCart, deleteCartItem, getCartItems, updateCart, deleteAllCartItems } = require('../controllers/cart');
const authenticateMiddleware = require('../middleware');

router.post('/add-cart', authenticateMiddleware, addToCart);

router.delete('/delete-cart', authenticateMiddleware, deleteCartItem);

router.post('/get-cart', authenticateMiddleware, getCartItems);

router.patch('/update-cart', authenticateMiddleware, updateCart)

router.post('/delete-all-cart', deleteAllCartItems);

module.exports = router;