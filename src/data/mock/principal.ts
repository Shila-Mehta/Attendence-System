/* =========================================================
   KPIs
   ========================================================= */

export type PrincipalKpis = {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRate: number;      // 0-100
  unexplainedCount: number;
  classesSubmitted: number;
  classesTotal: number;
};

export const principalKpis: PrincipalKpis = {
  totalStudents: 248,
  presentToday: 226,
  absentToday: 14,
  lateToday: 8,
  attendanceRate: 91,
  unexplainedCount: 3,
  classesSubmitted: 9,
  classesTotal: 12,
};

/* =========================================================
   7-day attendance trend
   ========================================================= */

export type TrendPoint = {
  day: string;       // "Mon", "Tue"…
  date: string;      // YYYY-MM-DD
  present: number;
  absent: number;
  late: number;
  rate: number;      // 0-100
};

export const attendanceTrend: TrendPoint[] = [
  { day: "Mon", date: "2026-09-07", present: 220, absent: 20, late: 8,  rate: 89 },
  { day: "Tue", date: "2026-09-08", present: 232, absent: 10, late: 6,  rate: 94 },
  { day: "Wed", date: "2026-09-09", present: 228, absent: 12, late: 8,  rate: 92 },
  { day: "Thu", date: "2026-09-10", present: 224, absent: 16, late: 8,  rate: 90 },
  { day: "Fri", date: "2026-09-11", present: 230, absent: 12, late: 6,  rate: 93 },
  { day: "Sat", date: "2026-09-12", present: 226, absent: 14, late: 8,  rate: 91 },
  { day: "Mon", date: "2026-09-14", present: 234, absent: 8,  late: 6,  rate: 94 },
];

/* =========================================================
   Class status board
   ========================================================= */

export type ClassStatus = {
  classId: string;
  name: string;
  grade: string;
  teacher: string;
  status: "Submitted" | "Pending" | "Overdue";
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;      // 0-100
};

export const classStatuses: ClassStatus[] = [
  { classId: "CL001", name: "Class A", grade: "Grade 5", teacher: "Fatima Iqbal", status: "Submitted", present: 9, absent: 2, late: 1, total: 12, rate: 75 },
  { classId: "CL002", name: "Class B", grade: "Grade 5", teacher: "Ahmed Hassan", status: "Submitted", present: 8, absent: 1, late: 1, total: 10, rate: 80 },
  { classId: "CL003", name: "Class A", grade: "Grade 4", teacher: "Sana Yousuf",  status: "Submitted", present: 8, absent: 0, late: 0, total: 8,  rate: 100 },
  { classId: "CL004", name: "Class B", grade: "Grade 4", teacher: "Fatima Iqbal", status: "Pending",   present: 0, absent: 0, late: 0, total: 24, rate: 0 },
  { classId: "CL005", name: "Class A", grade: "Grade 6", teacher: "Ahmed Hassan", status: "Overdue",   present: 0, absent: 0, late: 0, total: 31, rate: 0 },
  { classId: "CL006", name: "Class B", grade: "Grade 6", teacher: "Sana Yousuf",  status: "Submitted", present: 19, absent: 2, late: 1, total: 22, rate: 86 },
];

/* =========================================================
   Unexplained absences (principal summary)
   ========================================================= */

export type UnexplainedSummary = {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  className: string;
  date: string;
  guardianName: string;
  guardianPhone: string;
  status: "Awaiting parent" | "Parent responded" | "Escalated";
};

export const unexplainedSummary: UnexplainedSummary[] = [
  { id: "UA001", studentId: "ST014", studentName: "Faizan Ali",    grade: "Grade 5", className: "Class A", date: "2026-09-12", guardianName: "Ali Akbar",   guardianPhone: "+92 300 2000001", status: "Awaiting parent" },
  { id: "UA002", studentId: "ST017", studentName: "Idrees Khan",   grade: "Grade 5", className: "Class A", date: "2026-09-12", guardianName: "Khan Wali",   guardianPhone: "+92 300 2000002", status: "Parent responded" },
  { id: "UA003", studentId: "ST021", studentName: "Muneeb Ahmed",  grade: "Grade 5", className: "Class B", date: "2026-09-11", guardianName: "Ahmed Raza",  guardianPhone: "+92 300 2000003", status: "Escalated" },
];

/* =========================================================
   Student drill-down (for /principal/students)
   ========================================================= */

export type PrincipalStudent = {
  studentId: string;
  name: string;
  grade: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  status: "Active" | "Inactive";
  presentCount: number;
  absentCount: number;
  lateCount: number;
  rate: number;
  recent: { date: string; status: "Present" | "Absent" | "Late"; note?: string }[];
};

export const principalStudents: PrincipalStudent[] = [
  {
    studentId: "ST001",
    name: "Ayesha Khan",
    grade: "Grade 5",
    className: "Class A",
    guardianName: "Imran Khan",
    guardianPhone: "+92 300 1111111",
    status: "Active",
    presentCount: 172,
    absentCount: 8,
    lateCount: 4,
    rate: 93,
    recent: [
      { date: "2026-09-12", status: "Present" },
      { date: "2026-09-11", status: "Present" },
      { date: "2026-09-10", status: "Late", note: "Bus delayed" },
      { date: "2026-09-09", status: "Present" },
      { date: "2026-09-08", status: "Present" },
      { date: "2026-09-07", status: "Absent", note: "Sick" },
    ],
  },
  {
    studentId: "ST014",
    name: "Faizan Ali",
    grade: "Grade 5",
    className: "Class A",
    guardianName: "Ali Akbar",
    guardianPhone: "+92 300 2000001",
    status: "Active",
    presentCount: 160,
    absentCount: 18,
    lateCount: 6,
    rate: 87,
    recent: [
      { date: "2026-09-12", status: "Absent", note: "Unexplained" },
      { date: "2026-09-11", status: "Present" },
      { date: "2026-09-10", status: "Present" },
      { date: "2026-09-09", status: "Late", note: "Traffic" },
      { date: "2026-09-08", status: "Present" },
      { date: "2026-09-07", status: "Present" },
    ],
  },
  {
    studentId: "ST017",
    name: "Idrees Khan",
    grade: "Grade 5",
    className: "Class A",
    guardianName: "Khan Wali",
    guardianPhone: "+92 300 2000002",
    status: "Active",
    presentCount: 150,
    absentCount: 22,
    lateCount: 10,
    rate: 82,
    recent: [
      { date: "2026-09-12", status: "Absent", note: "Parent responded" },
      { date: "2026-09-11", status: "Absent", note: "Sick" },
      { date: "2026-09-10", status: "Present" },
      { date: "2026-09-09", status: "Present" },
      { date: "2026-09-08", status: "Late", note: "Doctor" },
      { date: "2026-09-07", status: "Present" },
    ],
  },
  {
    studentId: "ST021",
    name: "Muneeb Ahmed",
    grade: "Grade 5",
    className: "Class B",
    guardianName: "Ahmed Raza",
    guardianPhone: "+92 300 2000003",
    status: "Active",
    presentCount: 142,
    absentCount: 26,
    lateCount: 8,
    rate: 79,
    recent: [
      { date: "2026-09-11", status: "Absent", note: "Unexplained" },
      { date: "2026-09-10", status: "Present" },
      { date: "2026-09-09", status: "Present" },
      { date: "2026-09-08", status: "Present" },
      { date: "2026-09-07", status: "Late", note: "Family matter" },
      { date: "2026-09-04", status: "Present" },
    ],
  },
  {
    studentId: "ST003",
    name: "Sara Ahmed",
    grade: "Grade 4",
    className: "Class B",
    guardianName: "Nadia Ahmed",
    guardianPhone: "+92 300 3333333",
    status: "Active",
    presentCount: 176,
    absentCount: 4,
    lateCount: 2,
    rate: 97,
    recent: [
      { date: "2026-09-12", status: "Present" },
      { date: "2026-09-11", status: "Present" },
      { date: "2026-09-10", status: "Present" },
      { date: "2026-09-09", status: "Present" },
      { date: "2026-09-08", status: "Present" },
      { date: "2026-09-07", status: "Late", note: "Bus delayed" },
    ],
  },
  {
    studentId: "ST005",
    name: "Zainab Malik",
    grade: "Grade 5",
    className: "Class B",
    guardianName: "Faisal Malik",
    guardianPhone: "+92 300 5555555",
    status: "Inactive",
    presentCount: 40,
    absentCount: 30,
    lateCount: 4,
    rate: 54,
    recent: [
      { date: "2026-06-20", status: "Absent" },
      { date: "2026-06-19", status: "Absent" },
      { date: "2026-06-18", status: "Present" },
      { date: "2026-06-17", status: "Absent" },
      { date: "2026-06-16", status: "Present" },
      { date: "2026-06-13", status: "Present" },
    ],
  },
];