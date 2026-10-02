import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Shield, Eye, Skull, Vote, RefreshCw, Activity, Clock, Flame, Settings, MessageSquare, Trash2, VolumeX, Volume2 } from 'lucide-react';

export const AdminDashboard = () => {
  const { code: codeParam } = useParams();
  const [gameCodeInput, setGameCodeInput] = useState(codeParam || '');
  const [activeCode, setActiveCode] = useState(codeParam || '');
  const [adminState, setAdminState] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [activeTab, setActiveTab] = useState('control'); // 'control' | 'players' | 'config' | 'chat' | 'events'

  const { socket, sendHostAction } = useSocket();
  const { adminToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    if (!socket || !activeCode) return;

    socket.emit('join_admin_dashboard', { gameCode: activeCode, adminToken });

    const handleAdminUpdate = (state) => {
      console.log('[AdminDashboard] Received unsanitized state:', state);
      setAdminState(state);
    };

    socket.on('admin_state_update', handleAdminUpdate);

    return () => {
      socket.off('admin_state_update', handleAdminUpdate);
    };
  }, [socket, activeCode, adminToken, navigate]);

  const handleConnectCode = (e) => {
    e.preventDefault();
    if (!gameCodeInput.trim()) return;
    setActiveCode(gameCodeInput.trim().toUpperCase());
  };

  const handleAdminAction = (actionType) => {
    if (!activeCode) return;
    sendHostAction(activeCode, actionType, selectedPlayerId);
    setSelectedPlayerId(null);
  };

  const handleLynchDecision = (targetId) => {
    if (!socket || !activeCode) return;
    socket.emit('admin_lynch_decision', { gameCode: activeCode, targetId });
  };

  const handleUpdateConfig = (newConfig) => {
    if (!socket || !activeCode) return;
    socket.emit('admin_update_config', { gameCode: activeCode, config: newConfig });
  };

  const handleDeleteChatMessage = (messageId) => {
    if (!socket || !activeCode) return;
    socket.emit('admin_delete_chat_message', { gameCode: activeCode, messageId });
  };

  const handleToggleMute = (playerId) => {
    if (!socket || !activeCode) return;
    socket.emit('admin_mute_player', { gameCode: activeCode, playerId });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      <Navbar gameCode={activeCode} isHost={true} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6">
        
        {/* MODERATOR DASHBOARD HEADER */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-[#151c2c] border border-rose-600/50 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 neon-glow-red">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-rose-600/20 border border-rose-500/40 rounded-xl text-rose-400">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
                  Werewolf Night - Admin Control Dashboard
                </h1>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                All-in-one console to control phases, manage unmasked players, configure rules, and trigger candidate lynches.
              </p>
            </div>
          </div>

          <form onSubmit={handleConnectCode} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="ENTER ROOM CODE"
              maxLength={6}
              value={gameCodeInput}
              onChange={(e) => setGameCodeInput(e.target.value.toUpperCase())}
              className="bg-[#0b0f19] border border-rose-500/40 focus:border-rose-400 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-rose-300 placeholder-gray-600 focus:outline-none uppercase text-center"
            />
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg transition-all"
            >
              Monitor Room
            </button>
          </form>
        </div>

        {!activeCode ? (
          <div className="bg-[#151c2c] border border-gray-800 rounded-2xl p-12 text-center text-gray-400 space-y-3">
            <Eye className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-sm">Enter an active 6-digit game code above to open the Moderator Dashboard.</p>
          </div>
        ) : !adminState ? (
          <div className="bg-[#151c2c] border border-gray-800 rounded-2xl p-12 text-center text-gray-400 space-y-3">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm">Connecting to game room <strong>{activeCode}</strong> live stream...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* LYNCH DECISION BANNER (WHEN VOTING ENDED & PENDING ADMIN DECISION) */}
            {adminState.status === 'VOTING_ENDED_PENDING_ADMIN_DECISION' && (
              <div className="bg-gradient-to-r from-amber-950 via-red-950 to-rose-950 border-2 border-amber-500 rounded-2xl p-6 shadow-2xl animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-amber-400 animate-bounce" />
                  <div>
                    <h2 className="font-cinzel text-xl font-black text-amber-200 uppercase tracking-wide">
                      ⚖️ ADMIN LYNCH DECISION REQUIRED
                    </h2>
                    <p className="text-xs text-amber-300">
                      Voting phase has ended. Select a candidate below or confirm the village vote to execute the lynch.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-500/30">
                  {/* Candidate buttons */}
                  {adminState.players
                    ?.filter(p => p.isAlive)
                    .map(player => {
                      const voteCount = adminState.players.filter(v => v.voteTargetId === player.id).length;
                      return (
                        <button
                          key={player.id}
                          onClick={() => handleLynchDecision(player.id)}
                          className="bg-red-800 hover:bg-red-700 border border-red-500 text-white px-5 py-3 rounded-xl font-mono text-xs font-bold shadow-lg transition-all flex items-center gap-2"
                        >
                          <Skull className="w-4 h-4 text-red-300" />
                          <span>LYNCH {player.name.toUpperCase()} ({voteCount} votes - {player.role || 'Role'})</span>
                        </button>
                      );
                    })}

                  <button
                    onClick={() => handleLynchDecision('NO_LYNCH')}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 px-5 py-3 rounded-xl font-mono text-xs font-bold shadow-lg transition-all flex items-center gap-2"
                  >
                    <span>🚫 NO LYNCH (SPARE ALL)</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB NAVIGATION HEADER */}
            <div className="flex bg-[#151c2c] p-1.5 rounded-xl border border-gray-800 flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('control')}
                className={`flex-1 min-w-[120px] py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'control' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                🎮 Control & Lynch
              </button>
              <button
                onClick={() => setActiveTab('players')}
                className={`flex-1 min-w-[120px] py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'players' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                👥 Roles & Players ({adminState.players?.length})
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`flex-1 min-w-[120px] py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'config' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                ⚙️ Room Rules & Config
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 min-w-[120px] py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'chat' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                💬 Chat & Moderation
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`flex-1 min-w-[120px] py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'events' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                📜 Event Logs
              </button>
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT CONTROL PANEL */}
              <div className="bg-[#151c2c] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Game State Status</span>
                  <span className="font-mono text-xs text-rose-400 font-bold bg-rose-950 px-2 py-1 rounded border border-rose-800">
                    {adminState.status} - R{adminState.round}
                  </span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleAdminAction('RESOLVE_NIGHT')}
                    className="w-full text-left bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-200 p-3.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-between"
                  >
                    <span>🌙 Start Discussion Phase</span>
                    <Clock className="w-4 h-4 text-indigo-400" />
                  </button>

                  <button
                    onClick={() => handleAdminAction('START_DAY_VOTING')}
                    className="w-full text-left bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-200 p-3.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-between"
                  >
                    <span>🗳️ Start Voting Phase</span>
                    <Vote className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={() => handleAdminAction('RESOLVE_DAY_VOTING')}
                    className="w-full text-left bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 p-3.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-between"
                  >
                    <span>⚖️ Reveal Voting Result & Lynch</span>
                    <Flame className="w-4 h-4 text-rose-400" />
                  </button>

                  {selectedPlayerId && (
                    <button
                      onClick={() => handleLynchDecision(selectedPlayerId)}
                      className="w-full text-left bg-red-800 hover:bg-red-700 border border-red-500 text-white p-3.5 rounded-xl text-xs font-bold transition-all shadow-xl animate-bounce flex items-center justify-between"
                    >
                      <span>☠️ Lynch Selected ({adminState.players.find(p => p.id === selectedPlayerId)?.name})</span>
                      <Skull className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleAdminAction('RESTART_GAME')}
                    className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 p-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
                  >
                    <span>🔄 End Game & Return to Lobby</span>
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* RIGHT MAIN DYNAMIC TAB PANEL */}
              <div className="lg:col-span-2 bg-[#151c2c] border border-[#2a3449] rounded-2xl p-6 shadow-2xl space-y-4">
                
                {/* CONTROL / PLAYERS TAB */}
                {(activeTab === 'control' || activeTab === 'players') && (
                  <>
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <h3 className="font-cinzel text-lg font-black text-white">
                        UNMASKED PLAYERS (SERVER ROLES & LIVE STATUS)
                      </h3>
                      <span className="text-xs text-rose-400 font-mono">
                        Click player row to select for admin lynch
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[480px] overflow-y-auto">
                      {adminState.players?.map((player) => (
                        <div
                          key={player.id}
                          onClick={() => setSelectedPlayerId(player.id === selectedPlayerId ? null : player.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            selectedPlayerId === player.id
                              ? 'bg-rose-950/60 border-rose-500 neon-glow-red scale-[1.01]'
                              : 'bg-[#0b0f19] border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                              player.team === 'WEREWOLVES' ? 'bg-rose-950 text-rose-400 border border-rose-700' : 'bg-slate-800 text-emerald-400 border border-slate-700'
                            }`}>
                              {player.emoji || player.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-200">{player.name}</span>
                                {player.isHost && (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded">
                                    HOST
                                  </span>
                                )}
                                {player.isMuted && (
                                  <span className="text-[10px] bg-red-500/20 text-red-400 font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <VolumeX className="w-3 h-3" /> MUTED
                                  </span>
                                )}
                              </div>
                              <span className={`font-mono text-xs font-bold ${
                                player.team === 'WEREWOLVES' ? 'text-rose-400' :
                                player.team === 'VILLAGERS' ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {player.role || 'Unassigned'} ({player.team || 'VILLAGERS'})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {player.voteTargetId && (
                              <span className="text-[11px] font-mono bg-rose-950 text-rose-300 px-2 py-1 rounded border border-rose-800">
                                Voted: {adminState.players.find(p => p.id === player.voteTargetId)?.name}
                              </span>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleMute(player.id);
                              }}
                              title={player.isMuted ? "Unmute player" : "Mute player"}
                              className="p-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-all"
                            >
                              {player.isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                            </button>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              player.isAlive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                            }`}>
                              {player.isAlive ? 'Alive' : 'Eliminated'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ROOM CONFIGURATION TAB */}
                {activeTab === 'config' && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-800 pb-3">
                      <h3 className="font-cinzel text-lg font-black text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-rose-400" />
                        ROOM CONFIGURATION & RULES
                      </h3>
                      <p className="text-xs text-gray-400">Configure vote visibility, role reveal settings, and chat status.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-800 space-y-2">
                        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                          Vote Visibility Option
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['VISIBLE', 'HIDDEN', 'REVEAL_AFTER'].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => handleUpdateConfig({ voteVisibility: mode })}
                              className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                                (adminState.config?.voteVisibility || 'VISIBLE') === mode
                                  ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-800 flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                            Reveal Role on Death
                          </label>
                          <p className="text-[11px] text-gray-500">Publicly announce player role when eliminated</p>
                        </div>
                        <button
                          onClick={() => handleUpdateConfig({ revealRoleOnDeath: !(adminState.config?.revealRoleOnDeath ?? true) })}
                          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                            (adminState.config?.revealRoleOnDeath ?? true)
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          {(adminState.config?.revealRoleOnDeath ?? true) ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>

                      <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-800 flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                            In-Game Chat Toggle
                          </label>
                          <p className="text-[11px] text-gray-500">Allow players to send public chat messages</p>
                        </div>
                        <button
                          onClick={() => handleUpdateConfig({ chatEnabled: !(adminState.config?.chatEnabled ?? true) })}
                          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                            (adminState.config?.chatEnabled ?? true)
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          {(adminState.config?.chatEnabled ?? true) ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CHAT MODERATION TAB */}
                {activeTab === 'chat' && (
                  <div className="space-y-4">
                    <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
                      <h3 className="font-cinzel text-lg font-black text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-rose-400" />
                        LIVE CHAT MODERATION
                      </h3>
                      <span className="text-xs font-mono text-gray-400">
                        {adminState.chatMessages?.length || 0} messages recorded
                      </span>
                    </div>

                    <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-4 h-96 overflow-y-auto space-y-3 font-mono text-xs">
                      {adminState.chatMessages?.length === 0 ? (
                        <p className="text-center text-gray-600 py-8">No chat messages yet.</p>
                      ) : (
                        adminState.chatMessages?.map((msg) => (
                          <div key={msg.id} className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-gray-800">
                            <div>
                              <span className="text-rose-400 font-bold mr-2">{msg.senderName}:</span>
                              <span className="text-gray-200">{msg.text}</span>
                              <span className="text-[10px] text-gray-600 ml-2">
                                [{new Date(msg.timestamp).toLocaleTimeString()}]
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteChatMessage(msg.id)}
                              title="Delete message"
                              className="p-1 text-gray-500 hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* EVENTS TAB */}
                {activeTab === 'events' && (
                  <div className="space-y-4">
                    <div className="border-b border-gray-800 pb-3">
                      <h3 className="font-cinzel text-lg font-black text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-rose-400" />
                        EVENT AUDIT TIMELINE
                      </h3>
                    </div>

                    <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-4 h-96 overflow-y-auto font-mono text-xs space-y-2">
                      {adminState.logs?.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between text-gray-400 border-b border-gray-900 pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className="text-rose-400 font-bold">[{log.eventType}]</span>
                            <span className="text-gray-200">{log.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
};
