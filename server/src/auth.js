import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getAdminByUsername } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mafia_secret_key_antigravity_2026';

export const loginAdmin = async (username, password) => {
  const admin = await getAdminByUsername(username);
  if (!admin) {
    throw new Error('Invalid username or password');
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    throw new Error('Invalid username or password');
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { token, username: admin.username };
};

export const verifyAdminToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') return null;
    return decoded;
  } catch (err) {
    return null;
  }
};

export const generatePlayerToken = (gameCode, playerId) => {
  return jwt.sign({ gameCode, playerId }, JWT_SECRET, { expiresIn: '12h' });
};

export const verifyPlayerToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
