const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chart');

router.get('/charts/sales-by-category', chartController.getSalesByCategory);
router.get('/charts/monthly-sales', chartController.getMonthlySales);
router.get('/charts/revenue-distribution', chartController.getRevenueDistribution);

module.exports = router;
