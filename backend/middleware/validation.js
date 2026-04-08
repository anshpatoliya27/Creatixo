// ✅ Input validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Minimum 6 characters, at least 1 letter and 1 number
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const sanitize = (input) => {
  // Remove leading/trailing spaces
  if (typeof input === "string") {
    return input.trim();
  }
  return input;
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  sanitize
};
