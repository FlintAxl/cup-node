const connection = require('../config/database');

// Sales by Category (Bar Chart)
exports.getSalesByCategory = (req, res) => {
  const sql = `
    SELECT c.description AS category, SUM(ol.quantity) AS total_sales
    FROM orderline ol
    JOIN item i ON ol.item_id = i.item_id
    JOIN categories c ON i.category_id = c.id
    GROUP BY c.description
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching sales by category:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const labels = results.map(r => r.category);
    const data = results.map(r => r.total_sales);

    res.json({ labels, data });
  });
};

// Monthly Sales Trend (Line Chart)
exports.getMonthlySales = (req, res) => {
  const sql = `
    SELECT DATE_FORMAT(o.date_placed, '%Y-%m') AS month, SUM(ol.quantity * i.sell_price) AS revenue
    FROM orderinfo o
    JOIN orderline ol ON o.order_id = ol.orderinfo_id
    JOIN item i ON ol.item_id = i.item_id
    GROUP BY month
    ORDER BY month ASC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching monthly sales:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const labels = results.map(r => r.month);
    const data = results.map(r => r.revenue);

    res.json({ labels, data });
  });
};

// Revenue Distribution (Pie Chart)
exports.getRevenueDistribution = (req, res) => {
  const sql = `
    SELECT i.pname AS item, SUM(ol.quantity * i.sell_price) AS revenue
    FROM orderline ol
    JOIN item i ON ol.item_id = i.item_id
    GROUP BY i.item_id
    ORDER BY revenue DESC
    LIMIT 5
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching revenue distribution:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const labels = results.map(r => r.item);
    const data = results.map(r => r.revenue);

    res.json({ labels, data });
  });
};
