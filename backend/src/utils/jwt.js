import jwt from 'jsonwebtoken';

export const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
};

export const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
};
