import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ gameCode, isHost }) => {
  const { isAdmin, adminUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-[#151c2c]/80 backdrop-blur-md border-b border-[#2a3449] sticky top-0 z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🕵️‍♂️</span>
          <span className="font-cinzel text-xl font-black tracking-wider text-rose-500 group-hover:text-rose-400 transition-colors">
            MAFIA
          </span>
        </Link>

        {gameCode && (
          <div className="flex items-center gap-2 bg-[#0b0f19] px-3 py-1.5 rounded-full border border-rose-500/30">
            <span className="text-xs uppercase text-gray-400 font-semibold">ROOM CODE:</span>
            <span className="font-mono text-base font-bold text-rose-400 tracking-wider">{gameCode}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <Link 
                to={gameCode ? `/admin/${gameCode}` : '/admin'}
                className="flex items-center gap-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 px-3 py-1.5 rounded-lg border border-rose-500/30 text-xs font-semibold transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                Admin Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                title="Logout Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="text-gray-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-gray-800/60 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
