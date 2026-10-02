import React from 'react';
import { Skull, Shield, CheckCircle2, UserX } from 'lucide-react';

export const PlayerCard = ({
  player,
  isSelf,
  canSelect,
  isSelected,
  onSelect,
  voteCount = 0,
  phase
}) => {
  const { id, name, isAlive, isHost, role, roleDef } = player;

  return (
    <div
      onClick={() => canSelect && isAlive && onSelect && onSelect(id)}
      className={`relative p-4 rounded-xl border transition-all duration-200 select-none ${
        !isAlive
          ? 'bg-[#0f1420]/60 border-gray-800/60 opacity-60 grayscale'
          : isSelected
          ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50 scale-[1.02]'
          : canSelect
          ? 'bg-[#151c2c] border-[#2a3449] hover:border-rose-500/60 cursor-pointer hover:bg-[#1a2338]'
          : 'bg-[#151c2c] border-[#2a3449]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
            !isAlive 
              ? 'bg-gray-800 text-gray-500'
              : isSelf
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}>
            {isAlive ? name.charAt(0).toUpperCase() : <Skull className="w-5 h-5 text-gray-500" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-sm ${isSelf ? 'text-rose-400 font-bold' : 'text-gray-200'}`}>
                {name}
              </span>
              {isSelf && (
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono">
                  YOU
                </span>
              )}
              {isHost && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                  HOST
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
              {isAlive ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Alive
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <UserX className="w-3 h-3" />
                  Eliminated
                </span>
              )}

              {/* Display role ONLY if available (self, fellow mafia, or game over) */}
              {role && (
                <span className="ml-2 font-semibold text-rose-400">
                  • {role}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Vote Badge */}
        {voteCount > 0 && (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-600 text-white font-bold text-xs shadow-md animate-bounce">
            {voteCount}
          </div>
        )}

        {/* Selection Checkmark */}
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-rose-500" />
        )}
      </div>
    </div>
  );
};
