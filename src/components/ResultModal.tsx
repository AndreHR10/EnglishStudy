import React, { useEffect } from "react";
import sounds from "../hooks/useSound";

interface ResultModalProps {
  points: number;
  maxPoints: number;
  totalPoints: number;
  onContinue: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({
  points,
  maxPoints,
  totalPoints,
  onContinue,
}) => {
  const percentage = Math.round((points / maxPoints) * 100);

  useEffect(() => {
    if (percentage >= 80) sounds.perfect();
    else if (percentage >= 60) sounds.levelUp();
  }, []);

  const getEmoji = () => {
    if (percentage === 100) return "🏆";
    if (percentage >= 80) return "⭐";
    if (percentage >= 60) return "👍";
    return "💪";
  };

  const getMessage = () => {
    if (percentage === 100) return "¡PERFECTO! 🎉";
    if (percentage >= 80) return "¡Excelente!";
    if (percentage >= 60) return "¡Bien hecho!";
    return "¡Sigue practicando!";
  };

  const getColor = () => {
    if (percentage >= 80) return "from-green-500 to-emerald-600";
    if (percentage >= 60) return "from-yellow-500 to-amber-600";
    return "from-red-500 to-rose-600";
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-sm w-full bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
        <div className={`bg-gradient-to-br ${getColor()} p-8 text-center`}>
          <div className="text-7xl mb-3 animate-bounce">{getEmoji()}</div>
          <h2 className="text-3xl font-black text-white">{getMessage()}</h2>
          <div className="text-6xl font-black text-white/90 mt-3">{percentage}%</div>
        </div>
        <div className="p-6 text-center">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-4">
            <p className="text-white/60 text-sm">Puntos en esta lección</p>
            <p className="text-yellow-400 font-black text-3xl">⭐ +{points}</p>
            <p className="text-white/40 text-xs mt-1">Total acumulado: {totalPoints} pts</p>
          </div>
          <button
            onClick={() => { sounds.click(); onContinue(); }}
            className={`w-full bg-gradient-to-r ${getColor()} text-white font-black py-4 rounded-2xl text-lg hover:scale-105 active:scale-95 transition-all`}
          >
            ✅ ¡Continuar!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
