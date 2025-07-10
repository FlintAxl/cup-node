const connection = require('../config/database');

exports.getAllItems = (req, res) => {
    const sql = 'SELECT * FROM item i INNER JOIN stock s ON i.item_id = s.item_id';
    try {
        connection.query(sql, (err, rows, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return;
            }

            // console.log(rows);
            // console.log(fields);
            return res.status(200).json({
                rows,
            })
        });
    } catch (error) {
        console.log(error)
    }
};

exports.getSingleItem = (req, res, ) => {
    const sql = 'SELECT * FROM item i INNER JOIN stock s ON i.item_id = s.item_id  WHERE i.item_id = ?'
    const values = [parseInt(req.params.id)];
    try {
        connection.execute(sql, values, (err, result, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return;
            }

            return res.status(200).json({
                success: true,
                result
            })
        });
    } catch (error) {
        console.log(error)
    }
}

exports.createItem = (req, res, next) => {

    console.log(req.body, req.file)
    const item = req.body
    const image = req.file
 console.log(item, image)
    const { description, cost_price, sell_price, quantity } = req.body;
    let imagePath = [];
    if (req.files && req.files.length > 0) {
        imagePath = req.files.map(file => file.path.replace(/\\/g, "/"));
    }

    if (!description || !cost_price || !sell_price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = 'INSERT INTO item (description, cost_price, sell_price, image) VALUES (?, ?, ?, ?)';
    const values = [description, cost_price, sell_price, JSON.stringify(imagePath)];

    connection.execute(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error inserting item', details: err });
        }

        const itemId = result.insertId
        console.log('item id', itemId)

        const stockSql = 'INSERT INTO stock (item_id, quantity) VALUES (?, ?)';
        const stockValues = [itemId, quantity];

        connection.execute(stockSql, stockValues, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error inserting item', details: err });
            }

            
            return res.status(201).json({
                success: true,
                itemId: itemId,
                image: imagePath,
                quantity,
                result
            });
        });
    });
}

exports.updateItem = (req, res, next) => {
    const id = req.params.id;
    const { description, cost_price, sell_price, quantity } = req.body;

    let imagePath = null;
    if (req.file) {
        imagePath = req.file.path.replace(/\\/g, "/");
    }

    if (!description || !cost_price || !sell_price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const itemSql = imagePath
        ? 'UPDATE item SET description = ?, cost_price = ?, sell_price = ?, image = ? WHERE item_id = ?'
        : 'UPDATE item SET description = ?, cost_price = ?, sell_price = ? WHERE item_id = ?';

    const itemValues = imagePath
        ? [description, cost_price, sell_price, JSON.stringify(imagePath), id]
        : [description, cost_price, sell_price, id];

    connection.execute(itemSql, itemValues, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error updating item (item table)', details: err });
        }

        const stockSql = 'UPDATE stock SET quantity = ? WHERE item_id = ?';
        const stockValues = [quantity, id];

        connection.execute(stockSql, stockValues, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error updating item (stock table)', details: err });
            }

            return res.status(200).json({
                success: true,
                message: 'Item updated successfully'
            });
        });
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
