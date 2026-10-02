import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { Play, QrCode, Shield, Users, Sparkles, ArrowRight, BookOpen, Clock, HelpCircle, Search } from 'lucide-react';
import { ROLES_LIST } from '../data/rolesData.js';

export const Home = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [mode, setMode] = useState('join'); // 'join' | 'create'
  const [activeTab, setActiveTab] = useState('app'); // 'app' | 'howToPlay' | 'roleDirectory'
  const [roleSearch, setRoleSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('ALL');

  const { createGame, joinGame, gameState, errorMessage } = useSocket();
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    createGame(playerName.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !gameCode.trim()) return;
    joinGame(gameCode.trim(), playerName.trim());
  };

  React.useEffect(() => {
    if (gameState?.code) {
      if (gameState.status === 'LOBBY') {
        navigate(`/lobby/${gameState.code}`);
      } else {
        navigate(`/game/${gameState.code}`);
      }
    }
  }, [gameState, navigate]);

  const filteredRoles = ROLES_LIST.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(roleSearch.toLowerCase()) || r.description.toLowerCase().includes(roleSearch.toLowerCase());
    const matchesTeam = teamFilter === 'ALL' || r.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8">
        
        {/* HERO HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            90-Second Automatic Timer • Secret Roles • 42 Telegram Roles
          </div>
          <h1 className="font-cinzel text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-300 to-amber-200 glow-text-red">
            WEREWOLF & MAFIA NIGHT
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
            Social deduction game platform. Roles are strictly secret. Automatic 90-second rounds keep games fast and intense!
          </p>
        </div>

        {/* NAVIGATION TABS FOR ONBOARDING */}
        <div className="flex bg-[#151c2c] p-1.5 rounded-2xl border border-gray-800 max-w-xl mx-auto shadow-xl">
          <button
            onClick={() => setActiveTab('app')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'app' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            🎮 Play / Create Game
          </button>
          <button
            onClick={() => setActiveTab('howToPlay')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'howToPlay' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            📖 How to Play
          </button>
          <button
            onClick={() => setActiveTab('roleDirectory')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'roleDirectory' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            🎭 All 42 Roles Directory
          </button>
        </div>

        {errorMessage && (
          <div className="w-full max-w-md mx-auto p-4 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs text-center shadow-lg">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* TAB 1: PLAY / CREATE FORM */}
        {activeTab === 'app' && (
          <div className="w-full max-w-md mx-auto bg-[#151c2c] border border-[#2a3449] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex bg-[#0b0f19] p-1 rounded-xl border border-gray-800">
              <button
                type="button"
                onClick={() => setMode('join')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'join' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Join Game Room
              </button>
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'create' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Create New Lobby
              </button>
            </div>

            {mode === 'join' ? (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Your Display Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="e.g., Detective Smith"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#2a3449] focus:border-rose-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    6-Digit Room Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g., 492018"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#0b0f19] border border-[#2a3449] focus:border-rose-500 rounded-xl px-4 py-3 text-base font-mono font-bold tracking-widest text-rose-400 text-center focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 group transition-all"
                >
                  <span>Join Lobby</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Host Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="e.g., GameMaster"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#2a3449] focus:border-rose-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                  <p className="font-semibold">👑 Host Features:</p>
                  <p className="text-gray-400">Generates a QR Code for mobile players. Includes automatic 90-second round timers and manual phase override controls.</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 group transition-all"
                >
                  <span>Create & Generate QR Code</span>
                  <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: HOW TO PLAY GUIDE */}
        {activeTab === 'howToPlay' && (
          <div className="bg-[#151c2c] border border-[#2a3449] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="font-cinzel text-2xl font-black text-rose-400 flex items-center gap-2">
                <BookOpen className="w-6 h-6" /> HOW TO PLAY WEREWOLF & MAFIA
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Learn the rules, round timers, and win conditions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-300">
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 space-y-2">
                <h3 className="font-bold text-sm text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> 1. Automatic 90-Second Timers
                </h3>
                <p className="leading-relaxed">
                  Every phase (Night, Day Discussion, Day Voting) runs on an **automatic 90-second countdown timer**. Once the timer hits 0, the server automatically resolves actions and advances the phase!
                </p>
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 space-y-2">
                <h3 className="font-bold text-sm text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> 2. Night Phase Questions
                </h3>
                <p className="leading-relaxed">
                  During Night (90s), special roles (Werewolves, Seer, Doctor, Detective, Harlot, Cupid) receive interactive action questions on their secret role cards to select their targets.
                </p>
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 space-y-2">
                <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 3. Day Discussion & Accusations
                </h3>
                <p className="leading-relaxed">
                  During Day Discussion (90s), players debate suspicions. Use quick accusation buttons (`ACCUSE @player`, `DEFEND @player`) to target suspects in the live feed.
                </p>
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 space-y-2">
                <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> 4. Day Voting & Auto Lynching
                </h3>
                <p className="leading-relaxed">
                  During Day Voting (90s), living players select a suspect. When voting ends, the highest-voted player is lynched and their secret role is revealed!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALL 42 ROLES ENCYCLOPEDIA */}
        {activeTab === 'roleDirectory' && (
          <div className="bg-[#151c2c] border border-[#2a3449] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <h2 className="font-cinzel text-2xl font-black text-rose-400">
                  ALL 42 WEREWOLF & MAFIA ROLES DIRECTORY
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Explore every role's abilities, team alignments, and night actions.</p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-gray-800 focus:border-rose-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white"
                  />
                </div>

                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="bg-[#0b0f19] border border-gray-800 text-xs text-gray-200 rounded-xl px-3 py-2 font-mono font-bold"
                >
                  <option value="ALL">All Teams</option>
                  <option value="WEREWOLF">Werewolf Team 🐺</option>
                  <option value="VILLAGER">Villager Team 👱</option>
                  <option value="NEUTRAL">Neutral & Solo 🔪</option>
                  <option value="CULT">Cult Team 👤</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredRoles.map((r) => (
                <div key={r.id} className="bg-[#0b0f19] border border-gray-800 rounded-xl p-4 space-y-2 hover:border-rose-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{r.emoji}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      r.team === 'WEREWOLF' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      r.team === 'VILLAGER' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      r.team === 'CULT' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {r.team}
                    </span>
                  </div>

                  <h3 className="font-cinzel text-base font-bold text-white">{r.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
