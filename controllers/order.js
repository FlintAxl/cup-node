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
