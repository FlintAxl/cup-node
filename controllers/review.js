// controllers/review.js
const connection = require('../config/database');


exports.getItemsByOrder = (req, res) => {
  const orderId = req.params.order_id;
  const userId = req.query.user_id; // Get user_id from query

  const sql = `
    SELECT 
      i.item_id, i.pname, i.image, ol.quantity,
      r.rating, r.comment
    FROM orderline ol
    JOIN item i ON ol.item_id = i.item_id
    LEFT JOIN reviews r 
      ON r.item_id = i.item_id 
      AND r.order_id = ol.orderinfo_id 
      AND r.user_id = ?
    WHERE ol.orderinfo_id = ?
  `;

  connection.query(sql, [userId, orderId], (err, result) => {
    if (err) {
      console.error('Error fetching order items:', err);
      return res.status(500).json({ error: 'Failed to fetch items' });
    }

    res.status(200).json({ data: result });
  });
};


exports.createReviews = (req, res) => {
  const reviews = req.body.reviews; // Array of { user_id, item_id, order_id, rating, comment }

  if (!Array.isArray(reviews) || reviews.length === 0) {
    return res.status(400).json({ error: 'No reviews provided' });
  }

  const sql = `
    INSERT INTO reviews (user_id, item_id, order_id, rating, comment, created_at)
    VALUES ?
  `;

  const values = reviews.map(r => [
    r.user_id,
    r.item_id,
    r.order_id,
    r.rating,
    r.comment,
    new Date()
  ]);

  connection.query(sql, [values], (err, result) => {
    if (err) {
      console.error('Review insert error:', err);
      return res.status(500).json({ error: 'Error inserting reviews', details: err });
    }

    res.status(201).json({ message: 'Reviews submitted', inserted: result.affectedRows });
  });
};


// Get all reviews
exports.getAllReviews = (req, res) => {
  const sql = `
  SELECT r.id AS review_id, r.rating, r.comment, r.created_at,
         u.name AS user_name,
         i.pname AS item_name,
         r.order_id
  FROM reviews r
  JOIN users u ON r.user_id = u.id
  JOIN item i ON r.item_id = i.item_id
  ORDER BY r.created_at DESC
`;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
    res.json({ data: results });
  });
};

// Delete a review
exports.deleteReview = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM reviews WHERE id = ?`;

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete review' });
    }
    res.json({ message: 'Review deleted' });
  });
};
