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

  // First, get items and quantities of this order
  const getItemsSql = `
    SELECT item_id, quantity 
    FROM orderline 
    WHERE orderinfo_id = ?
  `;

  connection.query(getItemsSql, [order_id], (err, itemRows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch order items', details: err });

    if (itemRows.length === 0) {
      return res.status(404).json({ error: 'Order not found or has no items' });
    }

    // Rollback stock for each item
    const rollbackPromises = itemRows.map(item => {
      return new Promise((resolve, reject) => {
        const rollbackSql = `UPDATE item SET stock = stock + ? WHERE item_id = ?`;
        connection.query(rollbackSql, [item.quantity, item.item_id], (err2) => {
          if (err2) reject(err2);
          else resolve();
        });
      });
    });

    Promise.all(rollbackPromises)
      .then(() => {
        // After rollback, update the order status to cancelled
        const updateStatusSql = `
          UPDATE orderinfo
          SET status = 'cancelled'
          WHERE order_id = ? AND status = 'pending'
        `;

        connection.query(updateStatusSql, [order_id], (err3, result) => {
          if (err3) return res.status(500).json({ error: 'Failed to cancel order', details: err3 });

          if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Order not found or not in pending status' });
          }

          return res.status(200).json({ success: true, message: 'Order cancelled and stock rolled back' });
        });
      })
      .catch(err4 => {
        return res.status(500).json({ error: 'Stock rollback failed', details: err4 });
      });
  });
};








//admin
exports.getAllOrders = (req, res) => {
  const sql = `
    SELECT 
      o.order_id,
      u.name AS customer_name,
      o.date_placed,
      o.status,
      (
        SELECT SUM(ol.quantity * i.sell_price)
        FROM orderline ol
        JOIN item i ON ol.item_id = i.item_id
        WHERE ol.orderinfo_id = o.order_id
      ) AS total_amount,
      (
        SELECT GROUP_CONCAT(i.pname SEPARATOR ', ')
        FROM orderline ol
        JOIN item i ON ol.item_id = i.item_id
        WHERE ol.orderinfo_id = o.order_id
      ) AS items
    FROM orderinfo o
    LEFT JOIN users u ON o.customer_id = u.id
    ORDER BY o.date_placed DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: results });
  });
};


// exports.updateOrderStatus = (req, res) => {
//   const { order_id, status } = req.body;

//   const validStatuses = ['pending', 'received', 'cancelled', 'shipped']; // added 'shipped'
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({ error: 'Invalid status' });
//   }

//   const sql = `UPDATE orderinfo SET status = ? WHERE order_id = ?`;

//   connection.execute(sql, [status, order_id], (err, result) => {
//     if (err) return res.status(500).json({ error: 'Failed to update status', details: err });

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.status(200).json({ success: true, message: 'Status updated' });
//   });
// };


// const { sendOrderStatusEmail } = require('../utils/mailer'); // import helper

// exports.updateOrderStatus = (req, res) => {
//   const { order_id, status } = req.body;

//   const validStatuses = ['pending', 'received', 'cancelled', 'shipped'];
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({ error: 'Invalid status' });
//   }

//   // First, update the status
//   const sql = `UPDATE orderinfo SET status = ? WHERE order_id = ?`;

//   connection.execute(sql, [status, order_id], (err, result) => {
//     if (err) return res.status(500).json({ error: 'Failed to update status', details: err });
//     if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });

//     // ✅ Now fetch customer email
//     const getEmailSql = `
//       SELECT u.email, o.order_id
//       FROM orderinfo o
//       JOIN users u ON o.customer_id = u.id
//       WHERE o.order_id = ?
//     `;
//     connection.query(getEmailSql, [order_id], async (err2, rows) => {
//       if (err2) {
//         console.error('Failed to fetch customer email:', err2);
//         return res.status(500).json({ error: 'Failed to fetch customer email' });
//       }

//       if (rows.length > 0) {
//         const customerEmail = rows[0].email;

//         try {
//           await sendOrderStatusEmail(customerEmail, order_id, status);
//           console.log('📧 Email sent to', customerEmail);
//         } catch (emailErr) {
//           console.error('❌ Failed to send email:', emailErr);
//         }
//       }

//       return res.status(200).json({ success: true, message: 'Status updated and email sent' });
//     });
//   });
// };

// const { generateReceiptPDF, sendReceiptEmail } = require('../utils/mailer');

// exports.updateOrderStatus = (req, res) => {
//   const { order_id, status } = req.body;

//   const validStatuses = ['pending', 'received', 'cancelled', 'shipped'];
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({ error: 'Invalid status' });
//   }

//   // 1. Update status
//   connection.execute(`UPDATE orderinfo SET status = ? WHERE order_id = ?`, [status, order_id], (err, result) => {
//     if (err) return res.status(500).json({ error: 'Failed to update status', details: err });
//     if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });

//     // 2. Fetch details for receipt if marked as received
//     if (status === 'received') {
//       const detailSql = `
//         SELECT o.order_id, o.date_placed, o.status, u.name AS customer_name, u.email,
//           (SELECT SUM(ol.quantity * i.sell_price)
//            FROM orderline ol
//            JOIN item i ON ol.item_id = i.item_id
//            WHERE ol.orderinfo_id = o.order_id) AS total_amount
//         FROM orderinfo o
//         JOIN users u ON o.customer_id = u.id
//         WHERE o.order_id = ?
//       `;

//       connection.query(detailSql, [order_id], (err2, rows) => {
//         if (err2 || rows.length === 0) {
//           console.error('❌ Fetch order details failed', err2);
//           return res.status(200).json({ success: true, message: 'Status updated but receipt not sent' });
//         }

//         const order = rows[0];

//         // Fetch items
//         const itemsSql = `
//           SELECT i.pname, ol.quantity, (ol.quantity * i.sell_price) as total_price
//           FROM orderline ol
//           JOIN item i ON ol.item_id = i.item_id
//           WHERE ol.orderinfo_id = ?
//         `;
//         connection.query(itemsSql, [order_id], async (err3, itemRows) => {
//           if (err3) {
//             console.error('❌ Fetch order items failed', err3);
//             return res.status(200).json({ success: true, message: 'Status updated but receipt not sent' });
//           }

//           order.items = itemRows;

//           try {
//             const pdfBuffer = await generateReceiptPDF(order);
//             await sendReceiptEmail(order.email, order, pdfBuffer);
//             console.log('📎 Receipt email sent');
//           } catch (pdfErr) {
//             console.error('❌ Failed to send receipt email', pdfErr);
//           }

//           return res.status(200).json({ success: true, message: 'Status updated and receipt sent' });
//         });
//       });
//     } else {
//       // If not received, just update status
//       return res.status(200).json({ success: true, message: 'Status updated' });
//     }
//   });
// };


const { generateReceiptPDF, sendReceiptEmail, sendOrderStatusEmail } = require('../utils/mailer');

exports.updateOrderStatus = (req, res) => {
  const { order_id, status } = req.body;

  const validStatuses = ['pending', 'received', 'cancelled', 'shipped'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // ✅ First: if cancelling, fetch items to rollback stock
  if (status === 'cancelled') {
    const getItemsSql = `
      SELECT item_id, quantity 
      FROM orderline 
      WHERE orderinfo_id = ?
    `;
    connection.query(getItemsSql, [order_id], (err, itemRows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch order items', details: err });

      if (itemRows.length === 0) {
        return res.status(404).json({ error: 'No items found for this order' });
      }

      // Rollback stock
      const rollbackPromises = itemRows.map(item => {
        return new Promise((resolve, reject) => {
          const rollbackSql = `UPDATE item SET stock = stock + ? WHERE item_id = ?`;
          connection.query(rollbackSql, [item.quantity, item.item_id], (err2) => {
            if (err2) reject(err2);
            else resolve();
          });
        });
      });

      Promise.all(rollbackPromises)
        .then(() => {
          // After rollback, update order status
          finalizeStatusUpdate(order_id, status, res);
        })
        .catch(err3 => {
          return res.status(500).json({ error: 'Stock rollback failed', details: err3 });
        });
    });
  } else {
    // For non-cancelled statuses, just update status
    finalizeStatusUpdate(order_id, status, res);
  }
};

// ✅ Helper function to finalize status update and send emails
function finalizeStatusUpdate(order_id, status, res) {
  connection.execute(
    `UPDATE orderinfo SET status = ? WHERE order_id = ?`,
    [status, order_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to update status', details: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });

      // Fetch email + details
      const getEmailSql = `
        SELECT o.order_id, o.date_placed, o.status, u.name AS customer_name, u.email
        FROM orderinfo o
        JOIN users u ON o.customer_id = u.id
        WHERE o.order_id = ?
      `;
      connection.query(getEmailSql, [order_id], (err2, rows) => {
        if (err2 || rows.length === 0) {
          console.error('❌ Failed to fetch customer email', err2);
          return res.status(200).json({ success: true, message: 'Status updated (email not sent)' });
        }

        const order = rows[0];

        if (status === 'received') {
          const itemsSql = `
            SELECT i.pname, ol.quantity, (ol.quantity * i.sell_price) as total_price
            FROM orderline ol
            JOIN item i ON ol.item_id = i.item_id
            WHERE ol.orderinfo_id = ?
          `;
          connection.query(itemsSql, [order_id], async (err3, itemRows) => {
            if (err3) {
              console.error('❌ Fetch order items failed', err3);
              return res.status(200).json({ success: true, message: 'Status updated but receipt not sent' });
            }

            order.items = itemRows;
            order.total_amount = itemRows.reduce((sum, i) => sum + i.total_price, 0);

            try {
              const pdfBuffer = await generateReceiptPDF(order);
              await sendReceiptEmail(order.email, order, pdfBuffer);
              console.log('📎 Receipt email sent');
            } catch (pdfErr) {
              console.error('❌ Failed to send receipt email', pdfErr);
            }

            return res.status(200).json({ success: true, message: 'Status updated and receipt sent' });
          });
        } else {
          // For cancelled, shipped, pending → just send status email
          sendOrderStatusEmail(order.email, order.order_id, status)
            .then(() => {
              console.log('📧 Status update email sent');
              return res.status(200).json({ success: true, message: 'Status updated and email sent' });
            })
            .catch(err => {
              console.error('❌ Failed to send status email', err);
              return res.status(200).json({ success: true, message: 'Status updated (but email failed)' });
            });
        }
      });
    }
  );
}
