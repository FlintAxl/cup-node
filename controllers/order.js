const connection = require('../config/database');

exports.createOrder = (req, res) => {
    console.log('Received order:', req.body);
  const { customer_id, items } = req.body; // items = [{ item_id, quantity }]
  if (!customer_id || !Array.isArray(items)) {
    return res.status(400).json({ error: "Missing customer_id or items" });
  }

  const orderSql = 'INSERT INTO orderinfo (customer_id) VALUES (?)';
  connection.execute(orderSql, [customer_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Insert orderinfo failed', details: err });

    const orderId = result.insertId;
    const orderLines = items.map(item => [orderId, item.item_id, item.quantity]);

    const orderLineSql = 'INSERT INTO orderline (orderinfo_id, item_id, quantity) VALUES ?';
    connection.query(orderLineSql, [orderLines], (err2, result2) => {
      if (err2) return res.status(500).json({ error: 'Insert orderline failed', details: err2 });

      return res.status(200).json({ success: true, orderId });
    });
  });
};
