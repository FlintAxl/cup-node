const express = require('express');
const router = express.Router();
const order = require('../controllers/order'); // <-- Add this line


router.post('/order', order.createOrder);


module.exports = router;