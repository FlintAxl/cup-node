const express = require('express');
const router = express.Router();
const order = require('../controllers/order');
const {isAuthenticatedUser,authorizeRoles} = require('../middlewares/auth')
router.post('/order', order.createOrder);
router.get('/my-orders/:customer_id', order.getCustomerOrders);
router.patch('/cancel-order', order.cancelOrder);

// ✅ NEW: Admin - get all orders
router.get('/all',isAuthenticatedUser,authorizeRoles('admin'),order.getAllOrders);
router.patch('/update-status', order.updateOrderStatus);

module.exports = router;
