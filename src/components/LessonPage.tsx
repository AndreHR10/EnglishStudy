import React, { useState, useEffect, useRef } from "react";
import { Lesson, Question } from "../data/lessons";
import { Student, db } from "../db/database";
import sounds from "../hooks/useSound";
import { GRADES } from "../data/lessons";

interface LessonPageProps {
  lesson: Lesson;
  student: Student;
  onComplete: (points: number, maxPoints: number, student: Student) => void;
  onBack: () => void;
}

type Phase = "vocabulary" | "quiz" | "result";

const LessonPage: React.FC<LessonPageProps> = ({
  lesson,
  student,
  onComplete,
  onBack,
}) => {
  const [phase, setPhase] = useState<Phase>("vocabulary");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [points, setPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [vocabIndex, setVocabIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gradeInfo = GRADES[student.grade];
  const questions = lesson.questions;
  const vocab = lesson.vocabulary ?? [];
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAnswer = (optionIndex: number) => {
    if (showFeedback) return;
    const question = questions[currentQ];
    const correct =
      typeof question.correct === "number"
        ? optionIndex === question.correct
        : optionIndex === parseInt(String(question.correct));

    setSelected(optionIndex);
    setIsCorrect(correct);
    setShowFeedback(true);
    setShowExplanation(true);

    if (correct) {
      sounds.correct();
      setPoints((p) => p + question.points);
      setCorrectCount((c) => c + 1);
    } else {
      sounds.wrong();
    }
    setAnswers((prev) => [...prev, correct]);

    timeoutRef.current = setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ((q) => q + 1);
        setSelected(null);
        setShowFeedback(false);
        setShowExplanation(false);
      } else {
        setPhase("result");
        const pct = Math.round(((correct ? correctCount + 1 : correctCount) / questions.length) * 100);
        if (pct === 100) sounds.perfect();
        else if (pct >= 60) sounds.levelUp();
      }
    }, 2200);
  };

  const handleFinish = () => {
    const pct = Math.round((correctCount / questions.length) * 100);
    const updatedStudent = db.saveScore(student.id, {
      lessonId: lesson.id,
      lessonName: lesson.title,
      grade: student.grade,
      points,
      maxPoints: totalPoints,
      percentage: pct,
      topic: lesson.topic,
    });
    sounds.click();
    onComplete(points, totalPoints, updatedStudent!);
  };

  const getOptionStyle = (idx: number, question: Question) => {
    const base = "w-full text-left px-5 py-4 rounded-2xl font-semibold text-base transition-all duration-200 border-2 flex items-center gap-3";
    if (!showFeedback) {
      return `${base} bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:scale-102 active:scale-98 cursor-pointer`;
    }
    const correct =
      typeof question.correct === "number"
        ? idx === question.correct
        : idx === parseInt(String(question.correct));

    if (correct) {
      return `${base} bg-green-500/30 border-green-400 text-green-200`;
    }
    if (idx === selected && !correct) {
      return `${base} bg-red-500/30 border-red-400 text-red-200`;
    }
    return `${base} bg-white/5 border-white/10 text-white/30`;
  };

  const getOptionIcon = (idx: number, question: Question) => {
    if (!showFeedback) return ["A", "B", "C", "D"][idx];
    const correct =
      typeof question.correct === "number"
        ? idx === question.correct
        : idx === parseInt(String(question.correct));
    if (correct) return "✅";
    if (idx === selected && !correct) return "❌";
    return ["A", "B", "C", "D"][idx];
  };

  // ── VOCABULARY PHASE ─────────────────────────────────────
  if (phase === "vocabulary") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${lesson.color} p-4`}>
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={() => { sounds.click(); onBack(); }}
              className="text-white/80 hover:text-white text-sm font-semibold flex items-center gap-2"
            >
              ← Volver
            </button>
            <h1 className="text-white font-black text-lg">{lesson.title}</h1>
            <div className="text-white/60 text-sm">{gradeInfo.label}</div>
          </div>
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          {/* Vocabulary header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-white">📖 Vocabulario</h2>
            <p className="text-white/50 mt-1">Aprende estas palabras antes de comenzar</p>
          </div>

          {vocab.length > 0 ? (
            <>
              {/* Flashcard */}
              <div className={`bg-gradient-to-br ${lesson.color} rounded-3xl p-8 text-center shadow-2xl mb-6`}>
                <div className="text-8xl mb-4 animate-bounce">{vocab[vocabIndex].emoji}</div>
                <div className="text-5xl font-black text-white mb-2">{vocab[vocabIndex].word}</div>
                <div className="text-2xl text-white/80">{vocab[vocabIndex].translation}</div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => { sounds.click(); setVocabIndex((i) => Math.max(0, i - 1)); }}
                  disabled={vocabIndex === 0}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-full text-xl font-bold transition"
                >
                  ←
                </button>
                <div className="flex gap-2">
                  {vocab.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { sounds.click(); setVocabIndex(i); }}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${i === vocabIndex ? "bg-white scale-125" : "bg-white/30"}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => { sounds.click(); setVocabIndex((i) => Math.min(vocab.length - 1, i + 1)); }}
                  disabled={vocabIndex === vocab.length - 1}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-full text-xl font-bold transition"
                >
                  →
                </button>
              </div>

              {/* All vocab list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {vocab.map((v, i) => (
                  <div
                    key={i}
                    onClick={() => { sounds.click(); setVocabIndex(i); }}
                    className={`bg-white/5 hover:bg-white/10 border rounded-xl p-3 text-center cursor-pointer transition ${
                      i === vocabIndex ? "border-white/40" : "border-white/10"
                    }`}
                  >
                    <div className="text-2xl">{v.emoji}</div>
                    <div className="text-white font-bold text-sm">{v.word}</div>
                    <div className="text-white/50 text-xs">{v.translation}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-white/50 py-10 text-xl">
              📖 Prepárate para las preguntas!
            </div>
          )}

          <button
            onClick={() => { sounds.click(); setPhase("quiz"); }}
            className={`w-full bg-gradient-to-r ${lesson.color} text-white font-black py-5 rounded-2xl text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200`}
          >
            🚀 ¡Comenzar Quiz!
          </button>
        </div>
      </div>
    );
  }

  // ── QUIZ PHASE ────────────────────────────────────────────
  if (phase === "quiz") {
    const question = questions[currentQ];
    const progress = ((currentQ) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${lesson.color} p-4`}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => { sounds.click(); onBack(); }}
                className="text-white/80 hover:text-white text-sm font-semibold"
              >
                ← Salir
              </button>
              <div className="flex items-center gap-3">
                <span className="text-white/80 text-sm font-bold">
                  ⭐ {points} pts
                </span>
                <span className="text-white font-black text-sm bg-white/20 px-3 py-1 rounded-full">
                  {currentQ + 1} / {questions.length}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col">
          {/* Score indicators */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {answers.map((correct, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  correct ? "bg-green-500/30 text-green-400" : "bg-red-500/30 text-red-400"
                }`}
              >
                {correct ? "✓" : "✗"}
              </div>
            ))}
            {Array.from({ length: questions.length - answers.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  i === 0 && !showFeedback ? "border-white/60 animate-pulse" : "border-white/20"
                }`}
              />
            ))}
          </div>

          {/* Question card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 mb-5 flex-1 flex flex-col">
            <div className="flex items-start gap-3 mb-6">
              <div className={`w-10 h-10 flex-shrink-0 bg-gradient-to-br ${lesson.color} rounded-xl flex items-center justify-center text-white font-black`}>
                {currentQ + 1}
              </div>
              <h2 className="text-white text-xl font-bold leading-snug flex-1">
                {question.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 flex-1">
              {question.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showFeedback}
                  className={getOptionStyle(idx, question)}
                >
                  <span className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-sm ${
                    showFeedback
                      ? typeof question.correct === "number"
                        ? idx === question.correct
                          ? "bg-green-500 text-white"
                          : idx === selected
                            ? "bg-red-500 text-white"
                            : "bg-white/10 text-white/30"
                        : "bg-white/10 text-white"
                      : "bg-white/10 text-white"
                  }`}>
                    {getOptionIcon(idx, question)}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              ))}
            </div>

            {/* Feedback */}
            {showFeedback && showExplanation && (
              <div className={`mt-4 p-4 rounded-2xl border ${
                isCorrect
                  ? "bg-green-500/20 border-green-400/40 text-green-200"
                  : "bg-red-500/20 border-red-400/40 text-red-200"
              } animate-fade-in`}>
                <div className="flex items-start gap-2">
                  <span className="text-2xl flex-shrink-0">{isCorrect ? "🎉" : "💡"}</span>
                  <div>
                    <p className="font-bold text-sm mb-1">
                      {isCorrect ? "¡Correcto! +" + question.points + " puntos" : "¡Casi! Sigue intentando"}
                    </p>
                    <p className="text-sm opacity-90">{question.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Points display */}
          <div className="text-center">
            <span className="text-white/40 text-sm">
              Puntos: <span className="text-yellow-400 font-bold">{points}</span> / {totalPoints}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT PHASE ──────────────────────────────────────────
  const percentage = Math.round((correctCount / questions.length) * 100);

  const getResultEmoji = () => {
    if (percentage === 100) return "🏆";
    if (percentage >= 80) return "⭐";
    if (percentage >= 60) return "👍";
    if (percentage >= 40) return "📚";
    return "💪";
  };

  const getResultMessage = () => {
    if (percentage === 100) return "¡PERFECTO! ¡Eres increíble!";
    if (percentage >= 80) return "¡Excelente trabajo!";
    if (percentage >= 60) return "¡Muy bien! ¡Sigue así!";
    if (percentage >= 40) return "¡Buen intento! Practica más";
    return "¡No te rindas! Inténtalo de nuevo";
  };

  const getResultColor = () => {
    if (percentage >= 80) return "from-green-500 to-emerald-600";
    if (percentage >= 60) return "from-yellow-500 to-amber-600";
    return "from-red-500 to-rose-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Result card */}
        <div className={`bg-gradient-to-br ${getResultColor()} rounded-3xl p-8 text-center shadow-2xl mb-6`}>
          <div className="text-8xl mb-4 animate-bounce">{getResultEmoji()}</div>
          <h2 className="text-3xl font-black text-white mb-2">{getResultMessage()}</h2>
          <div className="text-7xl font-black text-white/90 my-4">{percentage}%</div>
          <div className="text-white/80 text-lg">
            {correctCount} / {questions.length} respuestas correctas
          </div>
          <div className="mt-4 bg-white/20 rounded-2xl p-4">
            <div className="text-white/70 text-sm">Puntos obtenidos</div>
            <div className="text-4xl font-black text-white">
              ⭐ {points} <span className="text-2xl text-white/60">/ {totalPoints}</span>
            </div>
          </div>
        </div>

        {/* Answer breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <h3 className="text-white font-bold mb-3 text-center">📊 Respuestas</h3>
          <div className="grid grid-cols-5 gap-2">
            {answers.map((correct, i) => (
              <div
                key={i}
                className={`rounded-xl p-2 text-center text-sm font-bold ${
                  correct
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                <div className="text-lg">{correct ? "✅" : "❌"}</div>
                <div className="text-xs">P.{i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleFinish}
            className={`w-full bg-gradient-to-r ${getResultColor()} text-white font-black py-4 rounded-2xl text-lg shadow-lg hover:scale-105 active:scale-95 transition-all duration-200`}
          >
            💾 Guardar y Continuar
          </button>
          <button
            onClick={() => {
              sounds.click();
              setPhase("vocabulary");
              setCurrentQ(0);
              setSelected(null);
              setShowFeedback(false);
              setShowExplanation(false);
              setPoints(0);
              setCorrectCount(0);
              setAnswers([]);
              setVocabIndex(0);
            }}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl text-lg transition-all duration-200 border border-white/20"
          >
            🔄 Intentar de Nuevo
          </button>
          <button
            onClick={() => { sounds.click(); onBack(); }}
            className="w-full text-white/50 hover:text-white font-semibold py-2 transition text-sm"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
