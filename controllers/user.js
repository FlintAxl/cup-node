const connection = require('../config/database');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.registerUser = async (req, res) => {

  const { name, password, email, } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userSql = 'INSERT INTO users (name, password, email) VALUES (?, ?, ?)';
  try {
    connection.execute(userSql, [name, hashedPassword, email], (err, result) => {
      if (err instanceof Error) {
        console.log(err);

        return res.status(401).json({
          error: err
        });
      }

      return res.status(200).json({
        success: true,
        result
      })
    });
  } catch (error) {
    console.log(error)
  }

};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  // ✅ Form validation
  if (!email || email.trim() === '') {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!password || password.trim() === '') {
    return res.status(400).json({ error: 'Password is required' });
  }

  // First, get the user regardless of is_active to check status
  const sql = `
  SELECT id, name, email, password, is_active, role
  FROM users
  WHERE email = ? AND deleted_at IS NULL
`;



  connection.execute(sql, [email], async (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error logging in', details: err });
    }

    if (results.length === 0) {
      // No user with that email
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = results[0];

    // ✅ Check if inactive
    if (user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: 'User is inactive'
      });
    }

    // ✅ Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }



    // ✅ Generate token if active & password matches
    // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

    const updateTokenSql = 'UPDATE users SET token = ? WHERE id = ?';
    connection.execute(updateTokenSql, [token, user.id], (updateErr) => {
      if (updateErr) {
        console.log(updateErr);
        return res.status(500).json({ error: 'Error saving token', details: updateErr });
      }

      delete user.password;
      return res.status(200).json({
        success: "welcome back",
        user,
        token
      });
    });
  });
};



exports.updateUser = (req, res) => {
  const { name, address, phone, userId } = req.body;
  let image = null;

  if (req.file) {
    image = req.file.path.replace(/\\/g, "/");
  }

  // Build the base SQL dynamically depending on image presence
  let sql = `
    UPDATE users 
    SET name = ?, 
        address = ?, 
        phone = ?`;

  const params = [name, address, phone];

  if (image) {
    sql += `, image_path = ?`;
    params.push(image);
  }

  sql += ` WHERE id = ?`;
  params.push(userId);

  connection.execute(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error updating user', details: err });
    }
    return res.status(200).json({ success: true, message: 'Profile updated', result });
  });
};








//for admin side
exports.deactivateUser = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const sql = 'UPDATE users SET deleted_at = ? WHERE email = ?';
  const timestamp = new Date();

  connection.execute(sql, [timestamp, email], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error deactivating user', details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      email,
      deleted_at: timestamp
    });
  });
};

exports.getAllUsers = (req, res) => {
  const sql = 'SELECT id, name,address, phone, email, role, is_active, created_at FROM users';
  connection.execute(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching users', details: err });
    }
    res.status(200).json({ data: results });
  });
};

exports. updateUserRole = (req, res) => {
  const { userId, role } = req.body;
  const sql = 'UPDATE users SET role = ? WHERE id = ?';
  connection.execute(sql, [role, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating role', details: err });
    }
    res.status(200).json({ success: true, message: 'Role updated successfully' });
  });
};

exports.softDeleteUser = (req, res) => {
  const { userId } = req.body;
  const sql = 'UPDATE users SET is_active = 0 WHERE id = ?';
  connection.execute(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error deactivating user', details: err });
    }
    res.status(200).json({ success: true, message: 'User deactivated' });
  });
};

exports.activateUser = (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const sql = 'UPDATE users SET is_active = 1, deleted_at = NULL WHERE id = ?';

  connection.execute(sql, [userId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error reactivating user', details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'User reactivated successfully',
      userId
    });
  });
};

exports.getUserProfile = (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const sql = 'SELECT id, name, address, phone, email, image_path FROM users WHERE id = ? AND deleted_at IS NULL';
  connection.execute(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching user profile', details: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ success: true, user: results[0] });
  });
};