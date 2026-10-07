const { Pool } = require('pg');
const { newDb } = require('pg-mem');
require('dotenv').config();

const realPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const memDb = newDb();
const memPg = memDb.adapters.createPg();
const memPool = new memPg.Pool();
let activePool = process.env.DATABASE_URL ? realPool : memPool;

realPool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

realPool.on('error', (error) => {
  console.warn('PostgreSQL pool error:', error.message);
});

function getErrorText(error) {
  const seen = new Set();
  const items = [];

  function walk(value) {
    if (!value || typeof value !== 'object') {
      return;
    }

    if (seen.has(value)) {
      return;
    }
    seen.add(value);

    if (typeof value.message === 'string') items.push(value.message);
    if (typeof value.code === 'string') items.push(value.code);
    if (Array.isArray(value.errors)) {
      for (const nested of value.errors) walk(nested);
    }
    if (value.cause) walk(value.cause);
    if (value.parent) walk(value.parent);
  }

  walk(error);
  return items.join(' ');
}

async function query(text, params) {
  try {
    return await activePool.query(text, params);
  } catch (error) {
    const errorText = getErrorText(error);
    const shouldFallback =
      !process.env.DATABASE_URL ||
      /(ECONNREFUSED|ECONNRESET|ENOTFOUND|timeout|could not connect|database .* does not exist|password authentication failed|AggregateError)/i.test(errorText);

    if (shouldFallback && activePool !== memPool) {
      activePool = memPool;
      console.warn('PostgreSQL unavailable. Falling back to pg-mem for local development.');
      return memPool.query(text, params);
    }

    throw error;
  }
}

module.exports = {
  query,
  get pool() {
    return activePool;
  },
};
