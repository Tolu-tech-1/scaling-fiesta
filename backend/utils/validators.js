function isValidEmail(email) {
  return /^[A-Za-z0-9._%+\-!#$&]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

function isStrongSellerEmail(email) {
  if (!email || !isValidEmail(email)) return false;

  const hasSpecial = /[!#$&]/.test(email);
  const digits = email.match(/\d/g) || [];
  const hasThreeDigits = digits.length >= 3;
  const digitsAreDistinct = new Set(digits).size >= 3;

  return hasSpecial && hasThreeDigits && digitsAreDistinct;
}

module.exports = {
  isValidEmail,
  isStrongSellerEmail,
};
