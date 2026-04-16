import React, { useState, useEffect } from "react";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import LessonPage from "./components/LessonPage";
import Leaderboard from "./components/Leaderboard";
import ResultModal from "./components/ResultModal";
import { Student } from "./db/database";
import { Lesson } from "./data/lessons";

type View = "auth" | "dashboard" | "lesson" | "leaderboard";

const SESSION_KEY = "english_academy_session";

const App: React.FC = () => {
  const [view, setView] = useState<View>("auth");
  const [student, setStudent] = useState<Student | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{
    points: number;
    maxPoints: number;
    updatedStudent: Student;
  } | null>(null);

  // Restore session from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudent(parsed);
        setView("dashboard");
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const handleLogin = (s: Student) => {
    setStudent(s);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setView("dashboard");
  };

  const handleLogout = () => {
    setStudent(null);
    sessionStorage.removeItem(SESSION_KEY);
    setView("auth");
    setActiveLesson(null);
  };

  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setView("lesson");
  };

  const handleLessonComplete = (
    points: number,
    maxPoints: number,
    updatedStudent: Student
  ) => {
    setStudent(updatedStudent);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedStudent));
    setLastResult({ points, maxPoints, updatedStudent });
    setShowResult(true);
  };

  const handleResultContinue = () => {
    setShowResult(false);
    setView("dashboard");
    setActiveLesson(null);
  };

  const handleUpdateStudent = (s: Student) => {
    setStudent(s);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  };

  return (
    <div className="font-sans">
      {/* AUTH */}
      {view === "auth" && <AuthPage onLogin={handleLogin} />}

      {/* DASHBOARD */}
      {view === "dashboard" && student && (
        <Dashboard
          student={student}
          onStartLesson={handleStartLesson}
          onLogout={handleLogout}
          onShowLeaderboard={() => setView("leaderboard")}
          onUpdateStudent={handleUpdateStudent}
        />
      )}

      {/* LESSON */}
      {view === "lesson" && student && activeLesson && (
        <LessonPage
          lesson={activeLesson}
          student={student}
          onComplete={handleLessonComplete}
          onBack={() => {
            setView("dashboard");
            setActiveLesson(null);
          }}
        />
      )}

      {/* LEADERBOARD */}
      {view === "leaderboard" && student && (
        <Leaderboard
          currentGrade={student.grade}
          onBack={() => setView("dashboard")}
        />
      )}

      {/* RESULT MODAL */}
      {showResult && lastResult && student && (
        <ResultModal
          points={lastResult.points}
          maxPoints={lastResult.maxPoints}
          totalPoints={lastResult.updatedStudent.totalPoints}
          onContinue={handleResultContinue}
        />
      )}
    </div>
  );
};

export default App;
