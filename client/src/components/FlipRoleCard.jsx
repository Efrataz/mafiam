import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Skull, Search, UserCheck, Lock, Cross } from 'lucide-react';

const getRoleIcon = (roleId) => {
  switch (roleId) {
    case 'MAFIA':
      return <Skull className="w-12 h-12 text-rose-500 animate-pulse" />;
    case 'DOCTOR':
      return <Shield className="w-12 h-12 text-emerald-400" />;
    case 'DETECTIVE':
      return <Search className="w-12 h-12 text-sky-400" />;
    case 'VILLAGER':
    default:
      return <UserCheck className="w-12 h-12 text-teal-400" />;
  }
};

export const FlipRoleCard = ({ role, roleDef }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!role || !roleDef) {
    return (
      <div className="bg-[#151c2c] border border-gray-800 rounded-2xl p-6 text-center shadow-xl">
        <p className="text-gray-400 text-sm">Assigning secret roles...</p>
      </div>
    );
  }

  const isMafia = role === 'MAFIA';
  const isDoctor = role === 'DOCTOR';
  const isDetective = role === 'DETECTIVE';

  return (
    <div className="w-full max-w-sm mx-auto my-4">
      <div className="text-center mb-2 flex items-center justify-center gap-2">
        <Lock className="w-4 h-4 text-rose-400" />
        <span className="text-xs font-semibold text-rose-300 tracking-wider uppercase">
          Private Role Card (Hold to Reveal)
        </span>
      </div>

      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseDown={() => setIsFlipped(true)}
        onMouseUp={() => setIsFlipped(false)}
        onTouchStart={() => setIsFlipped(true)}
        onTouchEnd={() => setIsFlipped(false)}
        className="relative w-full h-80 cursor-pointer perspective-1000 select-none group"
      >
        <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* FRONT OF CARD (CLOSED / SECRET COVER) */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1a2336] via-[#111827] to-[#0b0f19] border-2 border-rose-500/50 rounded-2xl p-6 flex flex-col items-center justify-between backface-hidden shadow-2xl group-hover:border-rose-500 transition-colors">
            <div className="w-full flex justify-between items-center text-xs text-rose-400 font-mono tracking-widest">
              <span>MAFIA NIGHT</span>
              <span>CONFIDENTIAL</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-rose-950/40 border-2 border-rose-500/40 flex items-center justify-center shadow-inner neon-glow-red">
                <span className="text-5xl">🐺</span>
              </div>
              <h3 className="font-cinzel text-2xl font-black text-gray-100 glow-text-red">SECRET ROLE</h3>
              <p className="text-xs text-gray-400 text-center max-w-[220px]">
                Hold or click card to privately view your assigned role identity.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-rose-600/20 text-rose-300 px-4 py-2 rounded-full text-xs font-bold border border-rose-500/40">
              <Eye className="w-4 h-4" />
              <span>Press & Hold to Reveal</span>
            </div>
          </div>

          {/* BACK OF CARD (REVEALED ROLE) */}
          <div className={`absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col items-center justify-between backface-hidden rotate-y-180 shadow-2xl border-2 ${
            isMafia 
              ? 'bg-gradient-to-br from-rose-950 via-[#1f0a12] to-[#0b0407] border-rose-600 neon-glow-red' 
              : isDoctor
              ? 'bg-gradient-to-br from-emerald-950 via-[#071d18] to-[#040f0c] border-emerald-500 neon-glow-green'
              : isDetective
              ? 'bg-gradient-to-br from-sky-950 via-[#0a1829] to-[#050e19] border-sky-500 neon-glow-blue'
              : 'bg-gradient-to-br from-slate-900 via-[#131d31] to-[#0a101d] border-teal-500/60'
          }`}>
            <div className="w-full flex justify-between items-center text-xs font-mono">
              <span className={isMafia ? 'text-rose-400' : isDoctor ? 'text-emerald-400' : isDetective ? 'text-sky-400' : 'text-teal-400'}>
                YOUR ASSIGNED IDENTITY
              </span>
              <span className="text-gray-400 font-bold">TEAM: {roleDef.team}</span>
            </div>

            <div className="flex flex-col items-center text-center gap-2 my-auto">
              <div className="p-3.5 rounded-full bg-black/60 border border-white/20 shadow-xl">
                {getRoleIcon(role)}
              </div>
              <h2 className={`font-cinzel text-3xl font-black tracking-wider ${
                isMafia ? 'text-rose-400 glow-text-red' : isDoctor ? 'text-emerald-300' : isDetective ? 'text-sky-300' : 'text-teal-300'
              }`}>
                {roleDef.name}
              </h2>
              <p className="text-xs text-gray-300 max-w-[260px] leading-relaxed mt-1 font-medium">
                {roleDef.description}
              </p>
            </div>

            <div className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 bg-black/40 py-2 rounded-xl">
              <EyeOff className="w-4 h-4 text-gray-400" />
              <span>Release to hide card</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
