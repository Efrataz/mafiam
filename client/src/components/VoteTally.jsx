import React from 'react';
import { BarChart3 } from 'lucide-react';

export const VoteTally = ({ voteTally = {}, players = [] }) => {
  const getPlayerName = (id) => {
    const player = players.find(p => p.id === id);
    return player ? player.name : 'Unknown';
  };

  const tallyEntries = Object.entries(voteTally);

  if (tallyEntries.length === 0) {
    return (
      <div className="bg-[#151c2c] border border-[#2a3449] rounded-xl p-4 text-center">
        <p className="text-xs text-gray-400">No votes cast yet for this phase.</p>
      </div>
    );
  }

  // Calculate total votes cast
  const totalVotes = tallyEntries.reduce((sum, [_, count]) => sum + count, 0);

  return (
    <div className="bg-[#151c2c] border border-[#2a3449] rounded-xl p-4 shadow-lg mb-6">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-rose-400" />
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Real-Time Vote Tally
        </h4>
      </div>

      <div className="space-y-2">
        {tallyEntries.map(([targetId, count]) => {
          const name = getPlayerName(targetId);
          const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

          return (
            <div key={targetId} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-300 font-medium">
                <span>{name}</span>
                <span className="text-rose-400 font-bold">{count} {count === 1 ? 'vote' : 'votes'}</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
