const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review');
const {isAuthenticatedUser,authorizeRoles} = require('../middlewares/auth')
// Get items from an order to review
router.get('/order-items/:order_id', reviewController.getItemsByOrder);
router.post('/reviews', reviewController.createReviews);


router.get('/reviews/all',isAuthenticatedUser,authorizeRoles('admin'), reviewController.getAllReviews);
router.delete('/reviews/:id',isAuthenticatedUser,authorizeRoles('admin'), reviewController.deleteReview);

module.exports = router;
