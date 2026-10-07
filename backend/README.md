# CAMP Backend

Production-ready backend foundation for the CAMP storefront.

## Tech stack
- Node.js
- Express.js
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- Stripe Payments
- Cloudinary image storage

## Setup

1. Install Node.js LTS.
2. Open a terminal inside this folder.
3. Run:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and fill in the environment variables.
5. Start PostgreSQL and create a database named `camp`.
6. Start the server:
   ```bash
   npm run dev
   ```

## Default endpoints
- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/orders`
- `GET /api/orders/me`
- `GET /api/orders`
- `POST /api/payments/create-checkout-session`

## Environment example
See `.env.example` for the variables needed.
