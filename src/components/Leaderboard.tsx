import React, { useState } from "react";
import { db } from "../db/database";
import { GRADES } from "../data/lessons";
import sounds from "../hooks/useSound";

interface LeaderboardProps {
  currentGrade: string;
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentGrade, onBack }) => {
  const [filter, setFilter] = useState<string>("all");

  const entries = db.getLeaderboard(filter === "all" ? undefined : filter);
  const gradeKeys = Object.keys(GRADES);

  const getRankEmoji = (rank: number) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `#${rank + 1}`;
  };

  const getAverageColor = (avg: number) => {
    if (avg >= 80) return "text-green-400";
    if (avg >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => { sounds.click(); onBack(); }}
            className="text-white/80 hover:text-white font-bold flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-black text-white">🏆 Tabla de Líderes</h1>
          <div />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filter tabs */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { sounds.click(); setFilter("all"); }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filter === "all"
                  ? "bg-yellow-500 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              🌍 Todos
            </button>
            {gradeKeys.map((g) => (
              <button
                key={g}
                onClick={() => { sounds.click(); setFilter(g); }}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === g
                    ? "bg-yellow-500 text-white"
                    : g === currentGrade
                      ? "bg-blue-500/30 text-blue-300 hover:bg-blue-500/40"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {GRADES[g].emoji} {GRADES[g].label}
              </button>
            ))}
          </div>
        </div>

        {/* Podium - top 3 */}
        {entries.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd */}
            <div className="text-center flex-1 max-w-[120px]">
              <div className="text-3xl mb-1">🥈</div>
              <div className="bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-2xl p-4 h-24 flex flex-col justify-end">
                <div className="text-2xl">{entries[1]?.name?.[0] ?? "?"}</div>
                <div className="text-white font-bold text-xs truncate">{entries[1]?.name}</div>
                <div className="text-white/80 text-xs">⭐ {entries[1]?.totalPoints}</div>
              </div>
            </div>
            {/* 1st */}
            <div className="text-center flex-1 max-w-[140px]">
              <div className="text-4xl mb-1">🥇</div>
              <div className="bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-2xl p-4 h-36 flex flex-col justify-end">
                <div className="text-3xl">{entries[0]?.name?.[0] ?? "?"}</div>
                <div className="text-white font-bold text-sm truncate">{entries[0]?.name}</div>
                <div className="text-white/80 text-xs">⭐ {entries[0]?.totalPoints}</div>
              </div>
            </div>
            {/* 3rd */}
            <div className="text-center flex-1 max-w-[120px]">
              <div className="text-3xl mb-1">🥉</div>
              <div className="bg-gradient-to-t from-amber-700 to-amber-500 rounded-t-2xl p-4 h-20 flex flex-col justify-end">
                <div className="text-2xl">{entries[2]?.name?.[0] ?? "?"}</div>
                <div className="text-white font-bold text-xs truncate">{entries[2]?.name}</div>
                <div className="text-white/80 text-xs">⭐ {entries[2]?.totalPoints}</div>
              </div>
            </div>
          </div>
        )}

        {/* Full list */}
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏜️</div>
            <p className="text-white/40 text-xl">No hay datos aún</p>
            <p className="text-white/30 text-sm mt-2">¡Sé el primero en completar lecciones!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  i === 0
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : i === 1
                      ? "bg-gray-400/10 border-gray-400/30"
                      : i === 2
                        ? "bg-amber-600/10 border-amber-600/30"
                        : entry.grade === currentGrade
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-white/5 border-white/10"
                }`}
              >
                {/* Rank */}
                <div className="w-10 text-center text-2xl font-black">
                  {i < 3 ? (
                    getRankEmoji(i)
                  ) : (
                    <span className="text-white/40 text-sm">#{i + 1}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold truncate">{entry.name}</span>
                    {entry.grade === currentGrade && (
                      <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">Tú</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/40 text-xs">{entry.studentCode}</span>
                    <span className="text-white/30 text-xs">•</span>
                    <span className="text-white/50 text-xs">
                      {GRADES[entry.grade]?.emoji} {GRADES[entry.grade]?.label}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <div className="text-yellow-400 font-black">
                    ⭐ {entry.totalPoints}
                  </div>
                  <div className={`text-sm font-bold ${getAverageColor(entry.average)}`}>
                    {entry.average}% avg
                  </div>
                  <div className="text-white/30 text-xs">
                    {entry.gamesPlayed} juegos
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
