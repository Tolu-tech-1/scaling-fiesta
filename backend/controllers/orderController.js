const db = require('../config/db');

async function createOrder(req, res) {
  try {
    const { items, total, payment_method, customer_name, customer_email, shipping_address } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    const orderResult = await db.query(
      `INSERT INTO orders (user_id, total_amount, payment_method, customer_name, customer_email, shipping_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [
        req.user ? req.user.id : null,
        Number(total),
        payment_method || 'cash_on_delivery',
        customer_name || '',
        customer_email || '',
        shipping_address || '',
      ]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, selected_size, selected_color)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          item.product_id,
          item.name,
          Number(item.quantity || 1),
          Number(item.price || 0),
          item.selected_size || null,
          item.selected_color || null,
        ]
      );
    }

    return res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create order' });
  }
}

async function getMyOrders(req, res) {
  try {
    const result = await db.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json({ orders: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load orders' });
  }
}

async function getAllOrders(req, res) {
  try {
    const result = await db.query(
      `SELECT * FROM orders ORDER BY created_at DESC`
    );
    return res.json({ orders: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load orders' });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
};
