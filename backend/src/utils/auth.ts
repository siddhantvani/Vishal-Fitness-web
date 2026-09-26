import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET environment variable is missing.');
}

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
};
