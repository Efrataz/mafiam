import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { PhaseBanner } from '../components/PhaseBanner';
import { FlipRoleCard } from '../components/FlipRoleCard';
import { PlayerCard } from '../components/PlayerCard';
import { VoteTally } from '../components/VoteTally';
import { Shield, Skull, Eye, Vote, RefreshCw, MessageSquare, Send, Flame, ShieldAlert, Sparkles, Search, UserCheck, HelpCircle, Heart } from 'lucide-react';

export const GameRoom = () => {
  const { code } = useParams();
  const { 
    gameState, 
    privateRole, 
    investigationResult,
    submitVote, 
    submitNightAction, 
    sendHostAction,
    errorMessage 
  } = useSocket();

  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [extraCupidTargetId, setExtraCupidTargetId] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatFeed, setChatFeed] = useState([
    { sender: 'System', text: 'Welcome to Werewolf Night! Keep your secret role private.', time: '21:40' }
  ]);

  const navigate = useNavigate();

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-xs">Connecting to game room...</p>
        </div>
      </div>
    );
  }

  const { status, round, winner, phaseTimeRemaining = 90, players, voteTally, self, eliminatedLastRound } = gameState;
  const isHost = self?.isHost;
  const isAlive = self?.isAlive;
  const myRole = privateRole?.role || self?.role;
  const myRoleDef = privateRole?.roleDef || self?.roleDef;

  const handlePlayerSelect = (targetId) => {
    if (myRole === 'CUPID' && status === 'NIGHT') {
      if (!selectedTargetId) {
        setSelectedTargetId(targetId);
      } else if (!extraCupidTargetId && targetId !== selectedTargetId) {
        setExtraCupidTargetId(targetId);
      } else {
        setSelectedTargetId(targetId);
        setExtraCupidTargetId(null);
      }
    } else {
      if (targetId === selectedTargetId) {
        setSelectedTargetId(null);
      } else {
        setSelectedTargetId(targetId);
      }
    }
  };

  const handleConfirmVote = () => {
    if (!selectedTargetId) return;
    submitVote(code, selectedTargetId);
  };

  const handleConfirmNightAction = () => {
    if (!selectedTargetId) return;
    submitNightAction(code, selectedTargetId, extraCupidTargetId);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const newEntry = {
      sender: self?.name || 'You',
      text: chatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatFeed(prev => [...prev, newEntry]);
    setChatMessage('');
  };

  const handleQuickAccuse = (actionText) => {
    if (!selectedTargetId) return;
    const targetPlayer = players.find(p => p.id === selectedTargetId);
    if (!targetPlayer) return;

    const newEntry = {
      sender: self?.name || 'You',
      text: `${actionText} @${targetPlayer.name}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatFeed(prev => [...prev, newEntry]);
  };

  const getRoleQuestion = () => {
    switch (myRole) {
      case 'WEREWOLF':
      case 'ALPHA_WOLF':
      case 'WOLF_CUB':
      case 'WOLFMAN':
        return {
          question: '🐺 WEREWOLF PACK QUESTION: Who do you want to hunt and eliminate tonight?',
          color: 'text-rose-400',
          borderColor: 'border-rose-500'
        };
      case 'SEER':
        return {
          question: '👳 SEER QUESTION: Whose secret role do you want to divine in your crystal ball tonight?',
          color: 'text-amber-300',
          borderColor: 'border-amber-500'
        };
      case 'DOCTOR':
      case 'GUARDIAN_ANGEL':
        return {
          question: '🩺 DOCTOR QUESTION: Who do you want to protect from death tonight?',
          color: 'text-emerald-400',
          borderColor: 'border-emerald-500'
        };
      case 'DETECTIVE':
        return {
          question: '🕵 DETECTIVE QUESTION: Whose team alignment do you want to investigate tonight?',
          color: 'text-sky-300',
          borderColor: 'border-sky-500'
        };
      case 'CUPID':
        return {
          question: '🏹 CUPID QUESTION: Select 2 players from the list below to bind in eternal love!',
          color: 'text-pink-400',
          borderColor: 'border-pink-500'
        };
      case 'HARLOT':
        return {
          question: '💋 HARLOT QUESTION: Who do you want to visit tonight?',
          color: 'text-pink-400',
          borderColor: 'border-pink-500'
        };
      case 'SERIAL_KILLER':
        return {
          question: '🔪 SERIAL KILLER QUESTION: Who do you want to murder tonight?',
          color: 'text-rose-500',
          borderColor: 'border-rose-600'
        };
      case 'CULTIST':
        return {
          question: '👤 CULTIST QUESTION: Who do you want to recruit into the Cult tonight?',
          color: 'text-purple-400',
          borderColor: 'border-purple-500'
        };
      default:
        return {
          question: '👱 VILLAGER NIGHT STATUS: The village is sleeping. Waiting for night role actions to complete...',
          color: 'text-gray-300',
          borderColor: 'border-gray-700'
        };
    }
  };

  const roleQ = getRoleQuestion();

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      <Navbar gameCode={code} isHost={isHost} />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 space-y-6">
        
        {/* PHASE BANNER WITH 90-SECOND COUNTDOWN */}
        <PhaseBanner status={status} round={round} winner={winner} phaseTimerSeconds={phaseTimeRemaining} />

        {/* ERROR NOTIFICATION */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs text-center shadow-lg">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* ELIMINATION REVEAL BANNER */}
        {eliminatedLastRound && status !== 'LOBBY' && (
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-rose-950/90 via-[#1f0910] to-[#0d0407] border-2 border-rose-600 shadow-2xl overflow-hidden text-center space-y-2 neon-glow-red my-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-rose-950 border-2 border-rose-500 mx-auto flex items-center justify-center neon-glow-red">
              <Skull className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>

            <h3 className="font-cinzel text-xl md:text-3xl font-black text-rose-400 tracking-wider glow-text-red">
              {eliminatedLastRound.name.toUpperCase()} HAS BEEN ELIMINATED
            </h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950 border border-rose-600 text-rose-300 font-mono font-bold text-xs">
              <span>ROLE:</span>
              <span className="text-white">{eliminatedLastRound.role}</span>
            </div>
          </div>
        )}

        {/* DETECTIVE / SEER INVESTIGATION RESULT BANNER */}
        {investigationResult && (
          <div className="p-4 rounded-xl bg-sky-950/80 border border-sky-500/80 text-sky-200 text-xs font-bold flex items-center gap-2 shadow-xl animate-bounce">
            <Eye className="w-5 h-5 text-sky-400" />
            <span>
              Vision Result: <strong>{investigationResult.investigatedName}</strong> is 
              <span className={`ml-2 px-2 py-0.5 rounded text-white ${investigationResult.result === 'WEREWOLF' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                {investigationResult.result}
              </span>
            </span>
          </div>
        )}

        {/* MAIN GAME LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: PRIVATE ROLE CARD */}
          <div className="space-y-4">
            <FlipRoleCard role={myRole} roleDef={myRoleDef} />

            {!isAlive && status !== 'GAME_OVER' && (
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-center space-y-1">
                <Skull className="w-6 h-6 text-rose-500 mx-auto" />
                <h4 className="text-sm font-bold text-rose-400">YOU ARE ELIMINATED</h4>
                <p className="text-xs text-gray-500">
                  You are a spectator. Stay quiet and do not reveal secret role details!
                </p>
              </div>
            )}
          </div>

          {/* CENTER & RIGHT COLUMN: INTERACTIVE ROLE QUESTION & GRID */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* REAL-TIME VOTE TALLY */}
            {(status === 'DAY_VOTING' || status === 'DAY_DISCUSSION') && (
              <VoteTally voteTally={voteTally} players={players} />
            )}

            {/* INTERACTIVE NIGHT ROLE QUESTION PROMPT BANNER */}
            {isAlive && status === 'NIGHT' && (
              <div className={`bg-[#151c2c] border-2 ${roleQ.borderColor} rounded-2xl p-5 shadow-2xl space-y-3`}>
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className={`text-sm font-black ${roleQ.color} flex items-center gap-2 uppercase tracking-wide`}>
                    <HelpCircle className="w-5 h-5" /> NIGHT QUESTION & ACTION
                  </h4>
                  <span className="text-xs font-mono bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-800">
                    ⏱ {phaseTimeRemaining}s Left
                  </span>
                </div>

                <p className="text-sm text-gray-100 font-semibold leading-relaxed">
                  {roleQ.question}
                </p>

                {myRoleDef?.hasNightAction && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-400">
                      {selectedTargetId ? `Target Selected: ${players.find(p => p.id === selectedTargetId)?.name}` : 'Click a living player from the grid to answer.'}
                    </span>

                    <button
                      onClick={handleConfirmNightAction}
                      disabled={!selectedTargetId}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        selectedTargetId 
                          ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-rose-950/60' 
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                      }`}
                    >
                      Confirm Night Choice
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* DAY DISCUSSION QUICK ACCUSATION ACTIONS */}
            {isAlive && status === 'DAY_DISCUSSION' && (
              <div className="bg-[#151c2c] border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Discussion & Accusation Actions (90s Timer)
                </h4>
                <p className="text-xs text-gray-400">Select a player from the grid to target with quick theory actions:</p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleQuickAccuse('SURE')}
                    disabled={!selectedTargetId}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      selectedTargetId ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" /> ACCUSE @player
                  </button>

                  <button
                    onClick={() => handleQuickAccuse('DEFEND')}
                    disabled={!selectedTargetId}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      selectedTargetId ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" /> DEFEND @player
                  </button>
                </div>
              </div>
            )}

            {/* DAY VOTING PROMPT BANNER */}
            {isAlive && status === 'DAY_VOTING' && (
              <div className="bg-[#151c2c] border border-rose-500/50 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                    <Vote className="w-4 h-4" /> Cast Day Vote (Auto-Lynches in {phaseTimeRemaining}s)
                  </h4>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {selectedTargetId ? 'Target selected. Click confirm to lock in vote.' : 'Select a living player from the grid to vote against.'}
                  </p>
                </div>

                <button
                  onClick={handleConfirmVote}
                  disabled={!selectedTargetId}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    selectedTargetId 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60' 
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  }`}
                >
                  Confirm Vote
                </button>
              </div>
            )}

            {/* PLAYER SELECTION GRID */}
            <div className="bg-[#151c2c] border border-[#2a3449] rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">
                  Players ({players.filter(p => p.isAlive).length} Alive / {players.length} Total)
                </h3>
                <span className="text-xs text-gray-400 font-medium">
                  {status === 'DAY_VOTING' && 'Click player to vote'}
                  {status === 'NIGHT' && myRoleDef?.hasNightAction && 'Click player to select answer'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {players.map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    isSelf={p.id === self?.id}
                    canSelect={
                      isAlive && (
                        (status === 'DAY_VOTING') ||
                        (status === 'DAY_DISCUSSION') ||
                        (status === 'NIGHT' && myRoleDef?.hasNightAction)
                      )
                    }
                    isSelected={selectedTargetId === p.id || extraCupidTargetId === p.id}
                    onSelect={handlePlayerSelect}
                    voteCount={voteTally[p.id] || 0}
                    phase={status}
                  />
                ))}
              </div>
            </div>

            {/* LIVE DISCUSSION CHAT FEED */}
            <div className="bg-[#151c2c] border border-[#2a3449] rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2">
                <MessageSquare className="w-4 h-4 text-rose-400" />
                Live Discussion & Accusations Feed
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-3 h-40 overflow-y-auto space-y-2 text-xs">
                {chatFeed.map((msg, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 border-b border-gray-900 pb-1">
                    <div>
                      <span className="font-bold text-rose-400">{msg.sender}: </span>
                      <span className="text-gray-200">{msg.text}</span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your theory or response..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 bg-[#0b0f19] border border-gray-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* HOST CONTROL CONSOLE */}
            {isHost && status !== 'GAME_OVER' && (
              <div className="bg-gradient-to-r from-slate-900 via-[#161d2d] to-rose-950/40 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                  <h3 className="font-cinzel text-sm font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Host / Moderator Control Console
                  </h3>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 rounded border border-rose-500/30">
                    HOST PRIVILEGES
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {status === 'NIGHT' && (
                    <button
                      onClick={() => sendHostAction(code, 'RESOLVE_NIGHT')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
                    >
                      🌙 Force Resolve Night & Start Discussion
                    </button>
                  )}

                  {status === 'DAY_DISCUSSION' && (
                    <button
                      onClick={() => sendHostAction(code, 'START_DAY_VOTING')}
                      className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
                    >
                      🗳️ Force Open Day Voting Phase
                    </button>
                  )}

                  {status === 'DAY_VOTING' && (
                    <button
                      onClick={() => sendHostAction(code, 'RESOLVE_DAY_VOTING')}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
                    >
                      ⚖️ Force Calculate Tally & Lynch
                    </button>
                  )}

                  {selectedTargetId && (
                    <button
                      onClick={() => sendHostAction(code, 'EXECUTE_LYNCH', selectedTargetId)}
                      className="bg-red-800 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md border border-red-500/50 transition-all"
                    >
                      ☠️ Force Admin Lynch Selected Player
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* GAME OVER UNMASKED SUMMARY TABLE */}
            {status === 'GAME_OVER' && (
              <div className="bg-gradient-to-br from-[#151c2c] via-[#0b0f19] to-black border-2 border-rose-600 rounded-2xl p-6 shadow-2xl text-center space-y-6 neon-glow-red">
                <div>
                  <h3 className="font-cinzel text-3xl font-black text-rose-400 glow-text-red">
                    GAME OVER - {winner} VICTORY!
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">FINAL ROLES UNMASKED</p>
                </div>

                <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-4 divide-y divide-gray-800/80">
                  {players.map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between text-xs font-medium">
                      <span className="font-semibold text-gray-200">
                        {p.name}
                      </span>

                      <span className={`font-mono px-3 py-1 rounded font-bold border ${
                        p.role === 'WEREWOLF' || p.role === 'ALPHA_WOLF' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                        p.role === 'DOCTOR' || p.role === 'GUARDIAN_ANGEL' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                        p.role === 'SEER' || p.role === 'DETECTIVE' ? 'bg-sky-950 text-sky-400 border-sky-800' :
                        'bg-teal-950 text-teal-400 border-teal-800'
                      }`}>
                        {p.role}
                      </span>
                    </div>
                  ))}
                </div>

                {isHost && (
                  <button
                    onClick={() => sendHostAction(code, 'RESTART_GAME')}
                    className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg inline-flex items-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Return to Lobby & Play Again
                  </button>
                )}
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
};
