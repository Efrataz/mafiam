import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Moon, Sun, Vote, Trophy, Users, Clock, Skull, Flame, MessageSquare, ShieldAlert } from 'lucide-react';

export const PublicStreamView = () => {
  const { code } = useParams();
  const [liveState, setLiveState] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
    const newSocket = io(backendUrl, { transports: ['websocket', 'polling'] });

    newSocket.on('connect', () => {
      console.log('[PublicStream] Connected to server stream:', newSocket.id);
      newSocket.emit('join_public_live', { gameCode: code.toUpperCase() });
    });

    newSocket.on('public_live_update', (state) => {
      console.log('[PublicStream] Received live update:', state);
      setLiveState(state);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [code]);

  if (!liveState) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-xs font-mono">Connecting to TikTok Live Game Stream...</p>
        </div>
      </div>
    );
  }

  const { 
    status, 
    round, 
    winner, 
    phaseTimeRemaining = 90, 
    players = [], 
    voteTally = {}, 
    dramaticAnnouncement, 
    eliminatedLastRound,
    chatMessages = [] 
  } = liveState;

  const aliveCount = players.filter(p => p.isAlive).length;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#060911] text-gray-100 font-sans p-4 md:p-8 flex flex-col justify-between select-none">
      
      {/* BRANDING & STREAM HEADER */}
      <header className="flex items-center justify-between border-b border-rose-500/30 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-600/20 border border-rose-500/50 flex items-center justify-center text-2xl shadow-lg neon-glow-red">
            🐺
          </div>
          <div>
            <div className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> TIKTOK LIVE GAME STREAM
            </div>
            <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white glow-text-red">
              WEREWOLF NIGHT ADDIS
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#151c2c] border border-gray-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-gray-400 font-mono block">ROOM CODE</span>
            <span className="font-mono text-lg font-black text-rose-400 tracking-wider">{code}</span>
          </div>

          <div className="bg-[#151c2c] border border-gray-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-gray-400 font-mono block">ALIVE PLAYERS</span>
            <span className="font-mono text-lg font-black text-emerald-400">{aliveCount} / {players.length}</span>
          </div>
        </div>
      </header>

      {/* DRAMATIC ANNOUNCEMENT OVERLAY */}
      {dramaticAnnouncement && (
        <div className="my-4 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-rose-950/95 via-[#1a080f] to-black border-2 border-rose-600 text-center space-y-3 shadow-2xl neon-glow-red animate-bounce">
          <div className="w-20 h-20 rounded-full bg-rose-950 border-2 border-rose-500 mx-auto flex items-center justify-center shadow-2xl">
            {dramaticAnnouncement.type === 'NIGHT_KILL' ? (
              <Skull className="w-10 h-10 text-rose-500 animate-pulse" />
            ) : (
              <Flame className="w-10 h-10 text-amber-400" />
            )}
          </div>

          <h2 className="font-cinzel text-2xl md:text-4xl font-black text-rose-400 tracking-wider glow-text-red">
            {dramaticAnnouncement.message}
          </h2>

          {dramaticAnnouncement.role && dramaticAnnouncement.role !== 'HIDDEN' && (
            <div className="inline-block bg-rose-950 border border-rose-600 px-4 py-1 rounded-full text-rose-300 font-mono text-xs font-bold">
              ROLE REVEALED: {dramaticAnnouncement.role}
            </div>
          )}
        </div>
      )}

      {/* PHASE BANNER */}
      <div className="bg-[#151c2c] border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-black/40 rounded-2xl border border-white/10 shadow-inner">
            {status === 'NIGHT' && <Moon className="w-10 h-10 text-indigo-400 animate-pulse" />}
            {status === 'DAY_DISCUSSION' && <Sun className="w-10 h-10 text-amber-400 animate-spin-slow" />}
            {status === 'DAY_VOTING' && <Vote className="w-10 h-10 text-rose-400 animate-bounce" />}
            {status === 'GAME_OVER' && <Trophy className="w-10 h-10 text-amber-400" />}
            {status === 'LOBBY' && <Users className="w-10 h-10 text-rose-500" />}
          </div>

          <div>
            <h2 className="font-cinzel text-2xl md:text-3xl font-black text-white">
              {status === 'NIGHT' && `NIGHT ${round} - THE VILLAGE SLEEPS`}
              {status === 'DAY_DISCUSSION' && `DAY ${round} - DISCUSSION PHASE`}
              {status === 'DAY_VOTING' && `DAY ${round} - VOTING IN PROGRESS`}
              {status === 'VOTING_ENDED_PENDING_ADMIN_DECISION' && `DAY ${round} - VOTING COMPLETE`}
              {status === 'GAME_OVER' && `GAME OVER - ${winner} VICTORY!`}
              {status === 'LOBBY' && `LOBBY - WAITING FOR PLAYERS`}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {status === 'NIGHT' && 'Secret roles are making their choices...'}
              {status === 'DAY_DISCUSSION' && 'Players discuss: Who is the Werewolf?'}
              {status === 'DAY_VOTING' && 'Cast your votes on who should be lynched.'}
              {status === 'VOTING_ENDED_PENDING_ADMIN_DECISION' && 'Awaiting final Lynch Decision from the Moderator.'}
            </p>
          </div>
        </div>

        {status !== 'LOBBY' && status !== 'GAME_OVER' && (
          <div className="flex items-center gap-2 bg-black/60 border border-gray-700 px-5 py-3 rounded-2xl text-base font-mono font-bold text-rose-400 shadow-xl">
            <Clock className="w-5 h-5 text-rose-400 animate-pulse" />
            <span>⏱ {formatTime(phaseTimeRemaining)}</span>
          </div>
        )}
      </div>

      {/* MAIN STREAM CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* PLAYERS LIST (UNMASKED ROLES ARE NEVER SHOWN HERE!) */}
        <div className="lg:col-span-2 bg-[#151c2c] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="font-cinzel text-base font-bold text-gray-200 uppercase tracking-wider">
              VILLAGE PLAYERS ({aliveCount} ALIVE)
            </h3>
            <span className="text-xs text-gray-400 font-mono">🔒 Secret Roles Hidden</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {players.map((p) => (
              <div
                key={p.id}
                className={`p-4 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                  !p.isAlive 
                    ? 'bg-[#0b0f19] border-gray-800/60 opacity-50 grayscale'
                    : 'bg-[#0b0f19] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 ${
                  !p.isAlive ? 'bg-gray-800 text-gray-500' : 'bg-rose-950 text-rose-300 border border-rose-500/40 shadow-md'
                }`}>
                  {p.isAlive ? p.name.charAt(0).toUpperCase() : <Skull className="w-6 h-6 text-gray-500" />}
                </div>

                <span className="font-bold text-xs text-gray-200 truncate w-full">{p.name}</span>
                
                <span className={`text-[10px] font-mono mt-1 px-2 py-0.5 rounded font-bold ${
                  p.isAlive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                }`}>
                  {p.isAlive ? 'ALIVE' : 'ELIMINATED'}
                </span>
              </div>
            ))}
          </div>

          {/* VOTE TALLY BAR CHART (IF CONFIGURED VISIBLE) */}
          {Object.keys(voteTally).length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <Vote className="w-4 h-4" /> Live Vote Progress Tally
              </h4>
              <div className="space-y-2">
                {Object.entries(voteTally).map(([targetId, count]) => {
                  const candidate = players.find(p => p.id === targetId);
                  return (
                    <div key={targetId} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-300 font-semibold">
                        <span>{candidate ? candidate.name : 'Unknown'}</span>
                        <span className="text-rose-400 font-bold">{count} votes</span>
                      </div>
                      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500" style={{ width: `${Math.min(100, count * 15)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CHAT / DISCUSSION STREAM FEED */}
        <div className="bg-[#151c2c] border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="font-cinzel text-base font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-400" /> Discussion Feed
            </h3>
          </div>

          <div className="flex-1 bg-[#0b0f19] border border-gray-800 rounded-xl p-3 h-80 overflow-y-auto space-y-2 text-xs font-medium">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="border-b border-gray-900 pb-1.5">
                <span className="font-bold text-rose-400">{msg.senderName}: </span>
                <span className="text-gray-200">{msg.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <footer className="mt-6 pt-3 text-center text-xs text-gray-500 border-t border-gray-800">
        WEREWOLF NIGHT ADDIS • TIKTOK LIVE GAME STREAM SCREEN
      </footer>
    </div>
  );
};
