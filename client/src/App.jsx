import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { Join } from './pages/Join';
import { Lobby } from './pages/Lobby';
import { GameRoom } from './pages/GameRoom';
import { PublicStreamView } from './pages/PublicStreamView';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/join/:code" element={<Join />} />
            <Route path="/lobby/:code" element={<Lobby />} />
            <Route path="/game/:code" element={<GameRoom />} />
            <Route path="/game/:code/live" element={<PublicStreamView />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/:code" element={<AdminDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
