const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { isStrongSellerEmail } = require('../utils/validators');
require('dotenv').config();

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function signup(req, res) {
  try {
    const { username, email, password, storeName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (!isStrongSellerEmail(email)) {
      return res.status(400).json({
        message: 'Email must contain at least one of !, #, $, or & and at least three different numeric digits.',
      });
    }

    const existing = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await db.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, 'seller')
       RETURNING id, username, email, role`,
      [username, email, passwordHash]
    );

    const user = userResult.rows[0];

    if (storeName) {
      await db.query(
        `INSERT INTO sellers (user_id, store_name)
         VALUES ($1, $2)`,
        [user.id, storeName]
      );
    }

    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during signup' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = signToken(safeUser);
    return res.json({ token, user: safeUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during login' });
  }
}

async function me(req, res) {
  try {
    const result = await db.query('SELECT id, username, email, role FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch user data' });
  }
}

module.exports = {
  signup,
  login,
  me,
};
