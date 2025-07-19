const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review');

// Get items from an order to review
router.get('/order-items/:order_id', reviewController.getItemsByOrder);
router.post('/reviews', reviewController.createReviews);

router.get('/reviews/all', reviewController.getAllReviews);
router.delete('/reviews/:id', reviewController.deleteReview);

module.exports = router;
