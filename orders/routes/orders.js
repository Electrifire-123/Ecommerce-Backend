const router = require('express').Router();
const {getOrders, createOrders} = require('../controllers/orders');
const authenticateMiddleware = require('../middleware');

router.post('/get-orders', authenticateMiddleware, getOrders)

router.post('/create-order', authenticateMiddleware, createOrders)


module.exports = router;
