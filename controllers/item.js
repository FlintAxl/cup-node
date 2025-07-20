const connection = require('../config/database');

exports.getAllItems = (req, res) => {
  const sql = `
    SELECT 
  i.*, 
  c.description AS category_name,
  GROUP_CONCAT(img.image_path) AS images
FROM item i
LEFT JOIN item_images img ON i.item_id = img.item_id
LEFT JOIN categories c ON i.category_id = c.id
GROUP BY i.item_id


  `;

  connection.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Query failed', details: err });

    const data = rows.map(row => ({
      ...row,
      images: row.images ? row.images.split(',') : []
    }));

    return res.status(200).json({ data });
  });
};



exports.getSingleItem = (req, res) => {
    const sql = 'SELECT * FROM item WHERE item_id = ?';
    const values = [parseInt(req.params.id)];

    connection.execute(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Query error', details: err });
        }
        return res.status(200).json({
            success: true,
            result
        });
    });
};




exports.createItem = (req, res) => {
    const { pname, description, cost_price, sell_price, stock, category_id } = req.body;
    const images = req.files;

    // Validate required fields
    if (!description || !cost_price || !sell_price || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert into item table
    const insertItemSql = `
        INSERT INTO item (pname, description, cost_price, sell_price, stock, category_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const itemValues = [pname, description, cost_price, sell_price, stock, category_id];


    connection.execute(insertItemSql, itemValues, (err, result) => {
        if (err) return res.status(500).json({ error: 'Error inserting item', details: err });

        const itemId = result.insertId;

        // Handle image uploads
        if (images && images.length > 0) {
            const insertImageSql = 'INSERT INTO item_images (item_id, image_path) VALUES ?';
            const imagePaths = images.map(file => [itemId, file.path.replace(/\\/g, '/')]);

            connection.query(insertImageSql, [imagePaths], (err) => {
                if (err) return res.status(500).json({ error: 'Error inserting images', details: err });

                return res.status(201).json({
                    success: true,
                    message: 'Item and images saved successfully',
                    itemId,
                    stock,
                    category_id
                });
            });
        } else {
            // No images provided
            return res.status(201).json({
                success: true,
                message: 'Item saved without images',
                itemId,
                stock,
                category_id
            });
        }
    });
};



const fs = require('fs');
const path = require('path');

exports.updateItem = (req, res, next) => {
    const id = req.params.id;
    const { pname, description, cost_price, sell_price, stock, category_id } = req.body;


    let imagePath = [];

    if (req.files && req.files.length > 0) {
        imagePath = req.files.map(file => file.path.replace(/\\/g, "/"));
    }

    if (!pname || !description || !cost_price || !sell_price || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

        // ✅ Validate category_id
      if (!category_id || category_id.trim() === '' || category_id === '0') {
        return res.status(400).json({ error: 'Category is required' });
      }

    const itemSql = `
  UPDATE item 
  SET pname = ?, description = ?, cost_price = ?, sell_price = ?, stock = ?, category_id = ?
  WHERE item_id = ?
`;
const itemValues = [pname, description, cost_price, sell_price, stock, category_id, id];


    connection.execute(itemSql, itemValues, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error updating item', details: err });
        }

        // If new images uploaded, replace current images
        if (imagePath.length > 0) {
            const deleteSql = 'DELETE FROM item_images WHERE item_id = ?';
            connection.execute(deleteSql, [id], (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Failed to delete old images' });
                }

                const insertSql = 'INSERT INTO item_images (item_id, image_path) VALUES ?';
                const imageValues = imagePath.map(p => [id, p]);

                connection.query(insertSql, [imageValues], (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ error: 'Failed to insert new images' });
                    }

                    return res.status(200).json({ success: true, message: 'Item updated with new images' });
                });
            });
        } else {
            // No new image uploaded
            return res.status(200).json({ success: true, message: 'Item updated successfully (no new images)' });
        }
    });
};


exports.deleteItem = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM item WHERE item_id = ?';
    const values = [id];

    connection.execute(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error deleting item', details: err });
        }
        return res.status(200).json({
            success: true,
            message: 'item deleted'
        });
    });
}

exports.getCategories = (req, res) => {
  const sql = "SELECT id, description FROM categories"; 
  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching categories', details: err });
    }
    return res.status(200).json({ categories: result });
  });
};




exports.getItemWithReviews = (req, res) => {
  const itemId = req.params.id;

  // ✅ Query to get item details + category name + images
  const itemSql = `
    SELECT 
      i.item_id,
      i.pname,
      i.description,
      i.sell_price,
      i.stock,
      c.description AS category_name,
      GROUP_CONCAT(img.image_path) AS images
    FROM item i
    LEFT JOIN item_images img ON i.item_id = img.item_id
    LEFT JOIN categories c ON i.category_id = c.id
    WHERE i.item_id = ?
    GROUP BY i.item_id
  `;

  connection.query(itemSql, [itemId], (err, itemRows) => {
    if (err) {
      console.error('Item query error:', err);
      return res.status(500).json({ error: 'Failed to fetch item details' });
    }

    if (itemRows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = {
      item_id: itemRows[0].item_id,
      pname: itemRows[0].pname,
      description: itemRows[0].description,
      sell_price: itemRows[0].sell_price,
      stock: itemRows[0].stock,
      category_name: itemRows[0].category_name || 'No category',
      images: itemRows[0].images ? itemRows[0].images.split(',') : []
    };

    // ✅ Query to get reviews
    const reviewSql = `
      SELECT 
        r.rating, r.comment, u.name AS reviewer_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.item_id = ?
    `;

    connection.query(reviewSql, [itemId], (err, reviewRows) => {
      if (err) {
        console.error('Review query error:', err);
        return res.status(500).json({ error: 'Failed to fetch reviews' });
      }

      item.reviews = reviewRows;

      return res.status(200).json({ success: true, data: item });
    });
  });
};




// ✅ Search items by name or description
exports.searchItems = (req, res) => {
  const keyword = req.query.q || '';

  if (!keyword) {
    return res.status(400).json({ error: 'Missing search query (?q=)' });
  }

  const sql = `
    SELECT 
      i.*, 
      c.description AS category_name,
      GROUP_CONCAT(img.image_path) AS images
    FROM item i
    LEFT JOIN item_images img ON i.item_id = img.item_id
    LEFT JOIN categories c ON i.category_id = c.id
    WHERE i.pname LIKE ? OR i.description LIKE ?
    GROUP BY i.item_id
  `;

  const like = `%${keyword}%`;
  connection.query(sql, [like, like], (err, rows) => {
    if (err) {
      console.error('Search query failed:', err);
      return res.status(500).json({ error: 'Search query failed', details: err });
    }

    const data = rows.map(row => ({
      ...row,
      images: row.images ? row.images.split(',') : []
    }));

    return res.status(200).json({ success: true, data });
  });
};
