import React, { useState } from "react";
import { db } from "../db/database";
import { GRADES, AVATARS } from "../data/lessons";
import sounds from "../hooks/useSound";

interface AuthPageProps {
  onLogin: (student: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    studentCode: "",
    password: "",
    name: "",
    grade: "primary_1",
    avatar: "🐶",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "login") {
      if (!form.studentCode || !form.password) {
        setError("Por favor completa todos los campos.");
        setLoading(false);
        return;
      }
      const result = db.loginStudent(form.studentCode, form.password);
      if (result.success && result.student) {
        sounds.login();
        setTimeout(() => {
          onLogin(result.student);
        }, 500);
      } else {
        sounds.wrong();
        setError(result.message);
      }
    } else {
      if (!form.studentCode || !form.password || !form.name || !form.grade) {
        setError("Por favor completa todos los campos.");
        setLoading(false);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Las contraseñas no coinciden.");
        setLoading(false);
        return;
      }
      if (form.password.length < 4) {
        setError("La contraseña debe tener al menos 4 caracteres.");
        setLoading(false);
        return;
      }
      if (form.studentCode.length < 3) {
        setError("El código de alumno debe tener al menos 3 caracteres.");
        setLoading(false);
        return;
      }
      const result = db.registerStudent(
        form.studentCode,
        form.password,
        form.name,
        form.grade,
        form.avatar
      );
      if (result.success && result.student) {
        sounds.levelUp();
        setTimeout(() => {
          onLogin(result.student);
        }, 500);
      } else {
        sounds.wrong();
        setError(result.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {["🔤", "📚", "🎓", "✏️", "🌍", "⭐", "🏆", "💡", "🎯", "📖"].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-10 animate-bounce"
            style={{
              left: `${(i * 11) % 95}%`,
              top: `${(i * 17) % 85}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3 animate-bounce">🇺🇸</div>
          <h1 className="text-4xl font-black text-white drop-shadow-lg">
            English Academy
          </h1>
          <p className="text-blue-200 mt-2 text-lg">
            ¡Aprende inglés de forma divertida!
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Tab Switch */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); sounds.click(); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                mode === "login"
                  ? "bg-white text-indigo-700 shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              🔑 Iniciar Sesión
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); sounds.click(); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                mode === "register"
                  ? "bg-white text-indigo-700 shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              📝 Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-1">
                  👤 Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
            )}

            {/* Student Code */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-1">
                🎫 Código de Alumno
              </label>
              <input
                type="text"
                name="studentCode"
                value={form.studentCode}
                onChange={handleChange}
                placeholder="Ej: ALU2024001"
                className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition uppercase"
              />
            </div>

            {/* Grade (register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-1">
                  🏫 Grado Escolar
                </label>
                <select
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  <optgroup label="📚 Primaria" className="bg-indigo-900">
                    {["primary_1","primary_2","primary_3","primary_4","primary_5","primary_6"].map(g => (
                      <option key={g} value={g} className="bg-indigo-900">
                        {GRADES[g].emoji} {GRADES[g].label} — {GRADES[g].level}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🎓 Secundaria" className="bg-purple-900">
                    {["secondary_1","secondary_2","secondary_3","secondary_4","secondary_5"].map(g => (
                      <option key={g} value={g} className="bg-purple-900">
                        {GRADES[g].emoji} {GRADES[g].label} — {GRADES[g].level}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}

            {/* Avatar (register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  🎭 Elige tu Avatar
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => { setForm({ ...form, avatar: av }); sounds.click(); }}
                      className={`text-2xl p-2 rounded-xl transition-all duration-200 ${
                        form.avatar === av
                          ? "bg-white/40 scale-110 ring-2 ring-white"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-1">
                🔐 Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Tu contraseña"
                  className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-xl"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password (register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-1">
                  🔐 Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-500/30 border border-red-400/50 rounded-xl p-3 text-red-200 text-sm text-center animate-pulse">
                ❌ {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black py-4 rounded-2xl text-lg shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Procesando...
                </span>
              ) : mode === "login" ? (
                "🚀 ¡Entrar a Aprender!"
              ) : (
                "🎉 ¡Crear mi Cuenta!"
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-4 text-center text-white/40 text-xs">
            {mode === "login"
              ? "¿No tienes cuenta? Regístrate arriba"
              : "¿Ya tienes cuenta? Inicia sesión arriba"}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">
          🌟 English Learning Academy v1.0 • Todos los grados
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
