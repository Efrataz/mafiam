import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

import { initDb } from './db.js';
import { loginAdmin, verifyAdminToken } from './auth.js';
import { setupSocketHandlers } from './socketHandlers.js';
import { gameManager } from './gameEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());

// Initialize Database
await initDb();

// Setup WebSockets
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocketHandlers(io);

// REST API Endpoints

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', activeRooms: gameManager.rooms.size, timestamp: new Date().toISOString() });
});

/**
 * Admin Login
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginAdmin(username, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

/**
 * Generate QR code for game lobby join URL
 */
app.get('/api/game/qr/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const hostHeader = req.headers.host || `localhost:${PORT}`;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const joinUrl = `${protocol}://${hostHeader}/join/${code.toUpperCase()}`;
    
    const qrDataUrl = await QRCode.toDataURL(joinUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    });

    res.json({ code, joinUrl, qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Serve frontend static assets in production
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`[MAFIA SERVER] Running on port ${PORT}`);
  console.log(`[MAFIA SERVER] Local join URL: ${CLIENT_URL}`);
  console.log(`===================================================`);
});
