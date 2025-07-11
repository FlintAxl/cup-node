const express = require('express');
const router = express.Router();
const order = require('../controllers/order'); // <-- Add this line


router.post('/order', order.createOrder);
router.get('/my-orders/:customer_id', order.getCustomerOrders);
router.patch('/cancel-order', order.cancelOrder);

module.exports = router;