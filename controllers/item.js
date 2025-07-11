const connection = require('../config/database');

exports.getAllItems = (req, res) => {
  const sql = `
    SELECT 
    i.*, 
    i.stock, 
    GROUP_CONCAT(img.image_path) AS images
    FROM item i
    LEFT JOIN item_images img ON i.item_id = img.item_id
    GROUP BY i.item_id;

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
    const { pname, description, cost_price, sell_price, stock } = req.body;
    const images = req.files;

    // Validate required fields
    if (!description || !cost_price || !sell_price || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert into item table
    const insertItemSql = `
        INSERT INTO item (pname, description, cost_price, sell_price, stock)
        VALUES (?, ?, ?, ?, ?)
    `;
    const itemValues = [pname, description, cost_price, sell_price, stock];

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
                    stock
                });
            });
        } else {
            // No images provided
            return res.status(201).json({
                success: true,
                message: 'Item saved without images',
                itemId,
                stock
            });
        }
    });
};



const fs = require('fs');
const path = require('path');

exports.updateItem = (req, res, next) => {
    const id = req.params.id;
    const { pname, description, cost_price, sell_price, stock } = req.body;

    let imagePath = [];

    if (req.files && req.files.length > 0) {
        imagePath = req.files.map(file => file.path.replace(/\\/g, "/"));
    }

    if (!pname || !description || !cost_price || !sell_price || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const itemSql = `
        UPDATE item 
        SET pname = ?, description = ?, cost_price = ?, sell_price = ?, stock = ?
        WHERE item_id = ?
    `;
    const itemValues = [pname, description, cost_price, sell_price, stock, id];

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
