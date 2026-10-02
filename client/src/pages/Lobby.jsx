import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { Users, Copy, Check, Play, QrCode, ShieldAlert, Sparkles } from 'lucide-react';

export const Lobby = () => {
  const { code } = useParams();
  const { gameState, startGame, errorMessage } = useSocket();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const isHost = gameState?.self?.isHost;
  const players = gameState?.players || [];
  const joinUrl = `${window.location.origin}/join/${code}`;

  useEffect(() => {
    if (gameState?.status && gameState.status !== 'LOBBY') {
      navigate(`/game/${code}`);
    }
  }, [gameState?.status, code, navigate]);

  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleStart = () => {
    startGame(code);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      <Navbar gameCode={code} isHost={isHost} />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-6">
        
        {/* LOBBY HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#151c2c] border border-[#2a3449] rounded-2xl p-6 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Game Lobby Active
            </div>
            <h1 className="font-cinzel text-3xl font-black text-white">
              ROOM CODE: <span className="text-rose-500 font-mono">{code}</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Scan the QR Code or share the link to invite players.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyJoinLink}
              className="flex items-center gap-2 bg-[#0b0f19] hover:bg-gray-800 text-gray-200 border border-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-rose-400" />}
              <span>{copied ? 'Link Copied!' : 'Copy Join Link'}</span>
            </button>

            {isHost && (
              <button
                onClick={handleStart}
                disabled={players.length < 3}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  players.length >= 3
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-950/60'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Game ({players.length} Joined)</span>
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs text-center shadow-lg">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* QR CODE CARD */}
          <div className="bg-[#151c2c] border border-[#2a3449] rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <QrCode className="w-4 h-4 text-rose-400" />
              Mobile QR Join Code
            </div>

            <div className="p-4 bg-white rounded-xl shadow-xl border-4 border-rose-500/30">
              <QRCodeSVG
                value={joinUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#0b0f19"
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="text-[11px] text-gray-400 font-mono break-all px-2 bg-[#0b0f19] py-1.5 rounded-lg border border-gray-800">
              {joinUrl}
            </p>
          </div>

          {/* PLAYERS LIST */}
          <div className="md:col-span-2 bg-[#151c2c] border border-[#2a3449] rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-400" />
                  <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">
                    Joined Players ({players.length})
                  </h3>
                </div>
                {players.length < 3 && (
                  <span className="text-xs text-amber-400 flex items-center gap-1 font-mono">
                    <ShieldAlert className="w-3.5 h-3.5" /> Need {3 - players.length} more to start
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b0f19] border border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold flex items-center justify-center text-sm">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-gray-200 block">
                          {p.name}
                        </span>
                        {p.isHost && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded">
                            HOST
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      Ready
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {isHost && (
              <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-400 text-center">
                Press "Start Game" above once all players have joined. Roles will be distributed privately and automatically.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
