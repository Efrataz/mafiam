import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../mafia-db.json');

let dbData = {
  admins: [],
  games: [],
  game_logs: []
};

const persistDb = async () => {
  try {
    await fs.writeFile(dbPath, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to persist database to file:', err.message);
  }
};

export const initDb = async () => {
  try {
    const content = await fs.readFile(dbPath, 'utf-8');
    dbData = JSON.parse(content);
    console.log('[DB] Loaded existing database storage.');
  } catch (err) {
    console.log('[DB] Initializing new database storage.');
    dbData = { admins: [], games: [], game_logs: [] };
    await persistDb();
  }

  // Seed admin account securely if empty
  if (!dbData.admins || dbData.admins.length === 0) {
    const defaultPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPass123!';
    const defaultUsername = process.env.ADMIN_USERNAME || process.env.ADMIN_DEFAULT_USERNAME || 'admin';
    const hash = await bcrypt.hash(defaultPassword, 10);
    dbData.admins.push({
      id: 1,
      username: defaultUsername,
      password_hash: hash,
      created_at: new Date().toISOString()
    });
    await persistDb();
    console.log(`[DB] Created admin account '${defaultUsername}'.`);
  }
};

export const createAdminAccount = async (username, password) => {
  const hash = await bcrypt.hash(password, 10);
  const existing = dbData.admins.find(a => a.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    existing.password_hash = hash;
    await persistDb();
    return existing;
  }

  const newAdmin = {
    id: dbData.admins.length + 1,
    username,
    password_hash: hash,
    created_at: new Date().toISOString()
  };
  dbData.admins.push(newAdmin);
  await persistDb();
  return newAdmin;
};

export const getAdminByUsername = async (username) => {
  if (!dbData.admins) return null;
  return dbData.admins.find(a => a.username.toLowerCase() === username.toLowerCase()) || null;
};

export const recordGameLog = async (gameCode, phase, eventType, message) => {
  const logEntry = {
    id: dbData.game_logs.length + 1,
    game_code: gameCode,
    phase,
    event_type: eventType,
    message,
    timestamp: new Date().toISOString()
  };
  dbData.game_logs.push(logEntry);
  await persistDb();
  return logEntry;
};

export const saveGameSession = async (code, status, winner = null) => {
  const existingIndex = dbData.games.findIndex(g => g.code === code);
  if (existingIndex >= 0) {
    dbData.games[existingIndex].status = status;
    dbData.games[existingIndex].winner = winner;
    dbData.games[existingIndex].ended_at = new Date().toISOString();
  } else {
    dbData.games.push({
      id: dbData.games.length + 1,
      code,
      status,
      winner,
      created_at: new Date().toISOString(),
      ended_at: null
    });
  }
  await persistDb();
};

export default {
  initDb,
  createAdminAccount,
  getAdminByUsername,
  recordGameLog,
  saveGameSession
};
