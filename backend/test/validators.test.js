const test = require('node:test');
const assert = require('node:assert/strict');
const { isStrongSellerEmail, isValidEmail } = require('../utils/validators');

test('accepts valid seller emails with required special character and digits', () => {
  assert.equal(isStrongSellerEmail('seller123!@camp.com'), true);
  assert.equal(isStrongSellerEmail('store#456@camp.ng'), true);
  assert.equal(isValidEmail('seller123!@camp.com'), true);
});

test('rejects invalid seller emails', () => {
  assert.equal(isStrongSellerEmail('seller@camp.com'), false);
  assert.equal(isStrongSellerEmail('seller123@camp.com'), false);
  assert.equal(isStrongSellerEmail('seller12!@camp.com'), false);
});
