import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { QrCode, ArrowRight } from 'lucide-react';

export const Join = () => {
  const { code } = useParams();
  const [playerName, setPlayerName] = useState('');
  const { joinGame, gameState, errorMessage } = useSocket();
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !code) return;
    joinGame(code.toUpperCase(), playerName.trim());
  };

  React.useEffect(() => {
    if (gameState?.code === code?.toUpperCase()) {
      if (gameState.status === 'LOBBY') {
        navigate(`/lobby/${gameState.code}`);
      } else {
        navigate(`/game/${gameState.code}`);
      }
    }
  }, [gameState, code, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      <Navbar gameCode={code} />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#151c2c] border border-[#2a3449] rounded-2xl p-6 md:p-8 shadow-2xl text-center space-y-6">
          
          <div className="inline-flex p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <QrCode className="w-10 h-10" />
          </div>

          <div>
            <h2 className="font-cinzel text-2xl font-bold text-gray-100">Joining Room</h2>
            <div className="inline-block bg-[#0b0f19] px-4 py-1.5 rounded-full border border-rose-500/40 text-rose-400 font-mono text-xl font-black mt-2">
              {code?.toUpperCase()}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs text-center">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Enter Your Display Name
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={16}
                placeholder="e.g., Agent Zero"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-[#0b0f19] border border-[#2a3449] focus:border-rose-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 group transition-all"
            >
              <span>Join Lobby</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
