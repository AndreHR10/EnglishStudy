import React, { useState, useEffect } from "react";
import { Student, db } from "../db/database";
import { GRADES, getLessonsByGrade, Lesson } from "../data/lessons";
import sounds from "../hooks/useSound";

interface DashboardProps {
  student: Student;
  onStartLesson: (lesson: Lesson) => void;
  onLogout: () => void;
  onShowLeaderboard: () => void;
  onUpdateStudent: (s: Student) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  student,
  onStartLesson,
  onLogout,
  onShowLeaderboard,
  onUpdateStudent,
}) => {
  const [currentStudent, setCurrentStudent] = useState<Student>(student);
  const lessons = getLessonsByGrade(student.grade);
  const gradeInfo = GRADES[student.grade];
  const average = db.getGradeAverage(student.id);

  useEffect(() => {
    const s = db.getStudent(student.id);
    if (s) {
      setCurrentStudent(s);
      onUpdateStudent(s);
    }
  }, []);

  const getScoreForLesson = (lessonId: string) => {
    const records = currentStudent.scores.filter((s) => s.lessonId === lessonId);
    if (records.length === 0) return null;
    return records[records.length - 1];
  };

  const completedLessons = lessons.filter(
    (l) => getScoreForLesson(l.id) !== null
  ).length;

  const getLetterGrade = (avg: number) => {
    if (avg >= 90) return "A+";
    if (avg >= 80) return "A";
    if (avg >= 70) return "B";
    if (avg >= 60) return "C";
    if (avg >= 50) return "D";
    return "F";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      {/* Top Navigation */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentStudent.avatar}</span>
            <div>
              <p className="text-white font-bold text-sm leading-none">
                {currentStudent.name}
              </p>
              <p className="text-blue-300 text-xs">
                {gradeInfo.emoji} {gradeInfo.label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
              <span className="text-yellow-400">⭐</span>
              <span className="text-yellow-300 font-bold text-sm">
                {currentStudent.totalPoints} pts
              </span>
            </div>
            <button
              onClick={() => { sounds.click(); onShowLeaderboard(); }}
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-full text-sm font-semibold transition"
            >
              🏆 Ranking
            </button>
            <button
              onClick={() => { sounds.click(); onLogout(); }}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-full text-sm font-semibold transition"
            >
              🚪 Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Grade Info Banner */}
        <div className={`bg-gradient-to-r ${gradeInfo.color} rounded-3xl p-6 mb-6 shadow-2xl`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-white drop-shadow">
                {gradeInfo.emoji} {gradeInfo.label}
              </h1>
              <p className="text-white/80 text-lg font-semibold">
                Nivel: {gradeInfo.level}
              </p>
              <p className="text-white/60 text-sm mt-1">
                🎫 Código: {currentStudent.studentCode}
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-black text-white drop-shadow-lg">
                {average}%
              </div>
              <div className="text-white/80 text-sm font-bold">
                Promedio General
              </div>
              <div className={`text-3xl font-black mt-1 ${average >= 80 ? "text-green-200" : average >= 60 ? "text-yellow-200" : "text-red-200"}`}>
                {getLetterGrade(average)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Lecciones Completadas", value: completedLessons, total: lessons.length, icon: "📚", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
            { label: "Puntos Totales", value: currentStudent.totalPoints, total: null, icon: "⭐", color: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/30" },
            { label: "Juegos Jugados", value: currentStudent.gamesPlayed, total: null, icon: "🎮", color: "from-purple-500/20 to-violet-500/20", border: "border-purple-500/30" },
            { label: "Promedio", value: `${average}%`, total: null, icon: "📊", color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30" },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-4 text-center`}>
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-white">
                {stat.value}
                {stat.total !== null && <span className="text-white/40 text-lg">/{stat.total}</span>}
              </div>
              <div className="text-white/60 text-xs font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Lessons Grid */}
        <h2 className="text-xl font-black text-white mb-4">
          📖 Tus Lecciones
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson, idx) => {
            const score = getScoreForLesson(lesson.id);
            const isCompleted = score !== null;
            const pct = isCompleted ? score!.percentage : 0;

            return (
              <div
                key={lesson.id}
                className={`group relative bg-white/5 backdrop-blur-sm border rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer overflow-hidden ${
                  isCompleted ? "border-white/20" : "border-white/10"
                }`}
                onClick={() => {
                  sounds.click();
                  onStartLesson(lesson);
                }}
              >
                {/* Lesson number badge */}
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-white/50 text-xs font-bold">{idx + 1}</span>
                </div>

                {/* Completed badge */}
                {isCompleted && (
                  <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold ${
                    pct >= 80 ? "bg-green-500/30 text-green-300" :
                    pct >= 60 ? "bg-yellow-500/30 text-yellow-300" :
                    "bg-red-500/30 text-red-300"
                  }`}>
                    ✓ {pct}%
                  </div>
                )}

                <div className="mt-4">
                  <div className="text-4xl mb-3">{lesson.icon}</div>
                  <h3 className="text-white font-bold text-lg leading-tight mb-1">
                    {lesson.title}
                  </h3>
                  <p className="text-white/50 text-sm mb-3">{lesson.description}</p>

                  {/* Topic badge */}
                  <span className="inline-block bg-white/10 text-white/60 text-xs px-2 py-1 rounded-full mb-3">
                    {lesson.topic}
                  </span>

                  {/* Score bar */}
                  {isCompleted && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>Puntaje</span>
                        <span>{score!.points}/{score!.maxPoints}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                            pct >= 80 ? "from-green-400 to-emerald-500" :
                            pct >= 60 ? "from-yellow-400 to-amber-500" :
                            "from-red-400 to-rose-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Play button */}
                  <div className={`mt-3 w-full py-2 rounded-xl text-sm font-bold text-center transition-all duration-200 bg-gradient-to-r ${gradeInfo.color} text-white opacity-80 group-hover:opacity-100`}>
                    {isCompleted ? "🔄 Repetir" : "▶️ Comenzar"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Score History */}
        {currentStudent.scores.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-black text-white mb-4">
              📊 Historial de Puntajes
            </h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-left text-white/60 text-xs font-bold px-4 py-3">Lección</th>
                      <th className="text-center text-white/60 text-xs font-bold px-4 py-3">Puntos</th>
                      <th className="text-center text-white/60 text-xs font-bold px-4 py-3">%</th>
                      <th className="text-center text-white/60 text-xs font-bold px-4 py-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...currentStudent.scores].reverse().slice(0, 10).map((score, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="text-white text-sm px-4 py-3">{score.lessonName}</td>
                        <td className="text-center">
                          <span className="text-yellow-400 font-bold text-sm">
                            ⭐ {score.points}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`font-bold text-sm ${
                            score.percentage >= 80 ? "text-green-400" :
                            score.percentage >= 60 ? "text-yellow-400" : "text-red-400"
                          }`}>
                            {score.percentage}%
                          </span>
                        </td>
                        <td className="text-center text-white/40 text-xs px-4 py-3">
                          {new Date(score.date).toLocaleDateString("es-MX")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
