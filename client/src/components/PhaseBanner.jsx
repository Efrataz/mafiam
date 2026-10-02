import React, { useState, useEffect } from 'react';
import { Moon, Sun, Vote, Trophy, Users, Clock, ShieldAlert } from 'lucide-react';

export const PhaseBanner = ({ status, round, winner, phaseTimerSeconds = 90 }) => {
  const [timeLeft, setTimeLeft] = useState(phaseTimerSeconds);

  useEffect(() => {
    setTimeLeft(phaseTimerSeconds);
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [status, round, phaseTimerSeconds]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getBannerConfig = () => {
    switch (status) {
      case 'NIGHT':
        return {
          title: `NIGHT ${round}`,
          subtitle: 'The village sleeps... Special roles select your secret targets.',
          bgColor: 'bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 border-indigo-500/50 neon-glow-blue',
          textColor: 'text-indigo-300',
          timerBg: 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300',
          icon: <Moon className="w-10 h-10 text-indigo-400 animate-pulse" />
        };
      case 'DAY_DISCUSSION':
        return {
          title: `DAY ${round} - DISCUSSION PHASE`,
          subtitle: 'Who is suspicious? Discuss theories and defend against accusations.',
          bgColor: 'bg-gradient-to-r from-amber-950/90 via-yellow-950/70 to-slate-900 border-amber-500/50 glow-text-gold',
          textColor: 'text-amber-300',
          timerBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
          icon: <Sun className="w-10 h-10 text-amber-400 animate-spin-slow" />
        };
      case 'DAY_VOTING':
        return {
          title: `DAY ${round} - VOTING PHASE`,
          subtitle: 'Who should be eliminated? Cast your votes now.',
          bgColor: 'bg-gradient-to-r from-rose-950/90 via-red-950/80 to-slate-900 border-rose-600/60 neon-glow-red',
          textColor: 'text-rose-400 glow-text-red',
          timerBg: 'bg-rose-950/90 border-rose-500/60 text-rose-300',
          icon: <Vote className="w-10 h-10 text-rose-400 animate-bounce" />
        };
      case 'GAME_OVER':
        return {
          title: `GAME OVER - ${winner} VICTORY!`,
          subtitle: winner === 'MAFIA' ? 'The Mafia infiltrated and took over the village!' : 'The Villagers successfully eliminated all secret Mafia members!',
          bgColor: winner === 'MAFIA' ? 'bg-gradient-to-r from-rose-950 via-black to-red-950 border-rose-600 neon-glow-red' : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-emerald-500 neon-glow-green',
          textColor: winner === 'MAFIA' ? 'text-rose-400 glow-text-red' : 'text-emerald-300',
          timerBg: 'bg-black/60 border-gray-700 text-gray-300',
          icon: <Trophy className="w-10 h-10 text-amber-400" />
        };
      case 'LOBBY':
      default:
        return {
          title: 'MAFIA NIGHT ADDIS',
          subtitle: 'Waiting for players to join before starting the match.',
          bgColor: 'bg-[#151c2c] border-[#2a3449]',
          textColor: 'text-gray-200',
          timerBg: 'bg-gray-900 border-gray-800 text-gray-400',
          icon: <Users className="w-10 h-10 text-rose-500" />
        };
    }
  };

  const config = getBannerConfig();

  return (
    <div className={`w-full p-4 md:p-6 rounded-2xl border ${config.bgColor} shadow-2xl mb-6 transition-all duration-300 relative overflow-hidden`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-3.5 bg-black/50 rounded-2xl border border-white/10 shadow-inner">
            {config.icon}
          </div>
          <div>
            <h2 className={`font-cinzel text-2xl md:text-3xl font-black tracking-wider ${config.textColor}`}>
              {config.title}
            </h2>
            <p className="text-xs md:text-sm text-gray-300 mt-1 font-medium">
              {config.subtitle}
            </p>
          </div>
        </div>

        {status !== 'LOBBY' && status !== 'GAME_OVER' && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-mono font-bold shadow-lg ${config.timerBg}`}>
            <Clock className="w-4 h-4 animate-pulse" />
            <span>⏱ {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
