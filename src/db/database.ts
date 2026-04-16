// ============================================================
// DATABASE MODULE - LocalStorage-based JSON Database
// English Learning Academy
// ============================================================

export interface Student {
  id: string;
  studentCode: string;
  password: string;
  name: string;
  grade: string; // e.g. "primary_1", "primary_2", ..., "secondary_5"
  avatar: string;
  createdAt: string;
  scores: ScoreRecord[];
  totalPoints: number;
  gamesPlayed: number;
}

export interface ScoreRecord {
  id: string;
  lessonId: string;
  lessonName: string;
  grade: string;
  points: number;
  maxPoints: number;
  percentage: number;
  date: string;
  topic: string;
}

export interface LeaderboardEntry {
  studentCode: string;
  name: string;
  grade: string;
  totalPoints: number;
  average: number;
  gamesPlayed: number;
}

const DB_KEY = "english_academy_db";

const initDB = () => {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    const initialData = {
      students: [] as Student[],
      version: "1.0.0",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  }
};

const getDB = () => {
  initDB();
  const raw = localStorage.getItem(DB_KEY)!;
  return JSON.parse(raw);
};

const saveDB = (data: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// ── Students ──────────────────────────────────────────────
export const db = {
  registerStudent: (
    studentCode: string,
    password: string,
    name: string,
    grade: string,
    avatar: string
  ): { success: boolean; message: string; student?: Student } => {
    const data = getDB();
    const exists = data.students.find(
      (s: Student) => s.studentCode === studentCode.toUpperCase()
    );
    if (exists) {
      return { success: false, message: "El código de alumno ya está registrado." };
    }
    const student: Student = {
      id: crypto.randomUUID(),
      studentCode: studentCode.toUpperCase(),
      password,
      name,
      grade,
      avatar,
      createdAt: new Date().toISOString(),
      scores: [],
      totalPoints: 0,
      gamesPlayed: 0,
    };
    data.students.push(student);
    saveDB(data);
    return { success: true, message: "Registro exitoso.", student };
  },

  loginStudent: (
    studentCode: string,
    password: string
  ): { success: boolean; message: string; student?: Student } => {
    const data = getDB();
    const student = data.students.find(
      (s: Student) =>
        s.studentCode === studentCode.toUpperCase() && s.password === password
    );
    if (!student) {
      return { success: false, message: "Código o contraseña incorrectos." };
    }
    return { success: true, message: "Bienvenido.", student };
  },

  saveScore: (studentId: string, record: Omit<ScoreRecord, "id" | "date">): Student | null => {
    const data = getDB();
    const idx = data.students.findIndex((s: Student) => s.id === studentId);
    if (idx === -1) return null;

    const scoreRecord: ScoreRecord = {
      ...record,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    data.students[idx].scores.push(scoreRecord);
    data.students[idx].totalPoints += record.points;
    data.students[idx].gamesPlayed += 1;
    saveDB(data);
    return data.students[idx];
  },

  getStudent: (studentId: string): Student | null => {
    const data = getDB();
    return data.students.find((s: Student) => s.id === studentId) ?? null;
  },

  getLeaderboard: (grade?: string): LeaderboardEntry[] => {
    const data = getDB();
    let students: Student[] = data.students;
    if (grade) {
      students = students.filter((s: Student) => s.grade === grade);
    }
    return students
      .map((s: Student) => ({
        studentCode: s.studentCode,
        name: s.name,
        grade: s.grade,
        totalPoints: s.totalPoints,
        average:
          s.scores.length > 0
            ? Math.round(
                s.scores.reduce((acc, sc) => acc + sc.percentage, 0) /
                  s.scores.length
              )
            : 0,
        gamesPlayed: s.gamesPlayed,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  },

  getGradeAverage: (studentId: string): number => {
    const data = getDB();
    const student: Student = data.students.find((s: Student) => s.id === studentId);
    if (!student || student.scores.length === 0) return 0;
    const avg =
      student.scores.reduce((acc, sc) => acc + sc.percentage, 0) /
      student.scores.length;
    return Math.round(avg);
  },

  updateStudent: (studentId: string, updates: Partial<Student>): Student | null => {
    const data = getDB();
    const idx = data.students.findIndex((s: Student) => s.id === studentId);
    if (idx === -1) return null;
    data.students[idx] = { ...data.students[idx], ...updates };
    saveDB(data);
    return data.students[idx];
  },
};
