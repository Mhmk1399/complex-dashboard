import jwt from 'jsonwebtoken';

export function generateToken(payload: any) {
  const tokenSecret = process.env.JWT_SECRET;
  if (!tokenSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, tokenSecret, { expiresIn: '1h' });
}