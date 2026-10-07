const db = require('../config/db');

async function getProducts(req, res) {
  try {
    const result = await db.query(
      `SELECT * FROM products ORDER BY price ASC`
    );
    return res.json({ products: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load products' });
  }
}

async function getProductById(req, res) {
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ product: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
}

async function createProduct(req, res) {
  try {
    const { name, price, tag, image_url, description, size_options, color_options, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const result = await db.query(
      `INSERT INTO products (seller_id, name, price, tag, image_url, description, size_options, color_options, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id,
        name,
        Number(price),
        tag || 'new',
        image_url || '',
        description || '',
        size_options || ['S', 'M', 'L', 'XL'],
        color_options || ['Black', 'White', 'Red', 'Blue'],
        Number(stock || 0),
      ]
    );

    return res.status(201).json({ product: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create product' });
  }
}

async function updateProduct(req, res) {
  try {
    const result = await db.query(
      `UPDATE products
       SET name = COALESCE($2, name),
           price = COALESCE($3, price),
           tag = COALESCE($4, tag),
           image_url = COALESCE($5, image_url),
           description = COALESCE($6, description),
           size_options = COALESCE($7, size_options),
           color_options = COALESCE($8, color_options),
           stock = COALESCE($9, stock)
       WHERE id = $1 AND seller_id = $10
       RETURNING *`,
      [
        req.params.id,
        req.body.name,
        req.body.price,
        req.body.tag,
        req.body.image_url,
        req.body.description,
        req.body.size_options,
        req.body.color_options,
        req.body.stock,
        req.user.id,
      ]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Product not found or not owned by seller' });
    }

    return res.json({ product: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update product' });
  }
}

async function deleteProduct(req, res) {
  try {
    const result = await db.query(
      'DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Product not found or not owned by seller' });
    }

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete product' });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
