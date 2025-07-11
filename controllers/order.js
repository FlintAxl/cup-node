const connection = require('../config/database');

exports.createOrder = (req, res) => {
  const { customer_id, items } = req.body;

  if (!customer_id || !Array.isArray(items)) {
    return res.status(400).json({ error: "Missing customer_id or items" });
  }

  // 1. Check all stocks first
  const checkStockSql = `
    SELECT item_id, stock 
    FROM item 
    WHERE item_id IN (${items.map(i => '?').join(',')})
  `;

  const itemIds = items.map(i => i.item_id);

  connection.query(checkStockSql, itemIds, (err, stockRows) => {
    if (err) return res.status(500).json({ error: 'Stock check failed', details: err });

    // 2. Validate stock availability
    for (const item of items) {
      const dbItem = stockRows.find(r => r.item_id === item.item_id);
      if (!dbItem || dbItem.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for item_id ${item.item_id}` 
        });
      }
    }

    // 3. Proceed to insert order
    const orderSql = 'INSERT INTO orderinfo (customer_id) VALUES (?)';
    connection.execute(orderSql, [customer_id], (err2, result) => {
      if (err2) return res.status(500).json({ error: 'Insert orderinfo failed', details: err2 });

      const orderId = result.insertId;
      const orderLines = items.map(item => [orderId, item.item_id, item.quantity]);

      const orderLineSql = 'INSERT INTO orderline (orderinfo_id, item_id, quantity) VALUES ?';
      connection.query(orderLineSql, [orderLines], (err3) => {
        if (err3) return res.status(500).json({ error: 'Insert orderline failed', details: err3 });

        // 4. Deduct stock
        const updateStockQueries = items.map(item => {
          return new Promise((resolve, reject) => {
            const updateSql = 'UPDATE item SET stock = stock - ? WHERE item_id = ?';
            connection.execute(updateSql, [item.quantity, item.item_id], (err4) => {
              if (err4) reject(err4);
              else resolve();
            });
          });
        });

        Promise.all(updateStockQueries)
          .then(() => {
            return res.status(200).json({ success: true, orderId });
          })
          .catch(err5 => {
            return res.status(500).json({ error: 'Stock deduction failed', details: err5 });
          });
      });
    });
  });
};


exports.getCustomerOrders = (req, res) => {
  const customer_id = req.params.customer_id;

  const sql = `
    SELECT 
      o.order_id, o.date_placed, o.status,
      GROUP_CONCAT(CONCAT(i.pname, ' x', ol.quantity) SEPARATOR ', ') AS items,
      SUM(i.sell_price * ol.quantity) AS total_price
    FROM orderinfo o
    JOIN orderline ol ON o.order_id = ol.orderinfo_id
    JOIN item i ON ol.item_id = i.item_id
    WHERE o.customer_id = ?
    GROUP BY o.order_id
    ORDER BY o.date_placed DESC
  `;

  connection.query(sql, [customer_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch orders', details: err });
    res.status(200).json({ data: result });
  });
};

exports.cancelOrder = (req, res) => {
  const { order_id } = req.body;

  const sql = `UPDATE orderinfo SET status = 'cancelled' WHERE order_id = ? AND status = 'pending'`;

  connection.query(sql, [order_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to cancel order', details: err });

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Order not found or already processed' });
    }

    res.status(200).json({ success: true, message: 'Order cancelled' });
  });
};
