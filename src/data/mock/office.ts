/* =========================================================
   Shared shapes
   ========================================================= */

export type SubmissionStatus = "Submitted" | "Pending" | "Overdue" | "Draft";

export type ClassSnapshot = {
  classId: string;
  name: string;
  grade: string;
  room: string;
  teacher: string;
  status: SubmissionStatus;
  submittedAt?: string;   // HH:MM
  present: number;
  absent: number;
  late: number;
  total: number;
};

/* =========================================================
   Live Attendance Board
   ========================================================= */

export const liveClasses: ClassSnapshot[] = [
  { classId: "CL001", name: "Class A", grade: "Grade 5", room: "R-101", teacher: "Fatima Iqbal", status: "Submitted", submittedAt: "08:58", present: 9, absent: 2, late: 1, total: 12 },
  { classId: "CL002", name: "Class B", grade: "Grade 5", room: "R-102", teacher: "Ahmed Hassan", status: "Submitted", submittedAt: "09:02", present: 8, absent: 1, late: 1, total: 10 },
  { classId: "CL003", name: "Class A", grade: "Grade 4", room: "R-201", teacher: "Sana Yousuf",  status: "Submitted", submittedAt: "08:47", present: 8, absent: 0, late: 0, total: 8 },
  { classId: "CL004", name: "Class B", grade: "Grade 4", room: "R-202", teacher: "Fatima Iqbal", status: "Pending",   present: 0, absent: 0, late: 0, total: 24 },
  { classId: "CL005", name: "Class A", grade: "Grade 6", room: "R-301", teacher: "Ahmed Hassan", status: "Overdue",   present: 0, absent: 0, late: 0, total: 31 },
  { classId: "CL006", name: "Class B", grade: "Grade 6", room: "R-302", teacher: "Sana Yousuf",  status: "Draft",     present: 12, absent: 3, late: 0, total: 22 },
];

/* =========================================================
   Unexplained Absence Queue
   ========================================================= */

export type UnexplainedCase = {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  className: string;
  date: string;              // YYYY-MM-DD
  reportedAt: string;        // HH:MM
  notifiedAt?: string;       // HH:MM — parent was alerted
  guardianName: string;
  guardianPhone: string;
  status: "Awaiting parent" | "Parent responded" | "Resolved" | "Escalated";
  note?: string;
};

export const unexplainedCases: UnexplainedCase[] = [
  {
    id: "UA001",
    studentId: "ST014",
    studentName: "Faizan Ali",
    grade: "Grade 5",
    className: "Class A",
    date: "2026-09-12",
    reportedAt: "09:52",
    notifiedAt: "10:22",
    guardianName: "Ali Akbar",
    guardianPhone: "+92 300 2000001",
    status: "Awaiting parent",
  },
  {
    id: "UA002",
    studentId: "ST017",
    studentName: "Idrees Khan",
    grade: "Grade 5",
    className: "Class A",
    date: "2026-09-12",
    reportedAt: "09:52",
    notifiedAt: "10:22",
    guardianName: "Khan Wali",
    guardianPhone: "+92 300 2000002",
    status: "Parent responded",
    note: "Parent replied — child unwell.",
  },
  {
    id: "UA003",
    studentId: "ST021",
    studentName: "Muneeb Ahmed",
    grade: "Grade 5",
    className: "Class B",
    date: "2026-09-11",
    reportedAt: "10:05",
    guardianName: "Ahmed Raza",
    guardianPhone: "+92 300 2000003",
    status: "Escalated",
    note: "No response in 24 hours.",
  },
  {
    id: "UA004",
    studentId: "ST009",
    studentName: "Areeba Khan",
    grade: "Grade 4",
    className: "Class A",
    date: "2026-09-10",
    reportedAt: "09:58",
    notifiedAt: "10:30",
    guardianName: "Kashif Khan",
    guardianPhone: "+92 300 2000004",
    status: "Resolved",
    note: "Medical note received.",
  },
];

/* =========================================================
   Front-Desk Log
   ========================================================= */

export type FrontDeskEntry = {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  className: string;
  type: "Late Arrival" | "Early Collection";
  time: string;              // HH:MM
  date: string;              // YYYY-MM-DD
  reason: string;
  personName: string;        // who collected / dropped
  personRelation: string;    // e.g. Mother
  loggedBy: string;
};

export const frontDeskEntries: FrontDeskEntry[] = [
  { id: "FD001", studentId: "ST012", studentName: "Daniyal Iqbal", grade: "Grade 5", className: "Class A", type: "Late Arrival",      time: "09:12", date: "2026-09-12", reason: "Bus delayed",           personName: "Bus driver",     personRelation: "Transport",  loggedBy: "Junaid Akhtar" },
  { id: "FD002", studentId: "ST019", studentName: "Kashif Raza",   grade: "Grade 5", className: "Class A", type: "Late Arrival",      time: "09:05", date: "2026-09-12", reason: "Doctor's appointment",  personName: "Sajid Raza",     personRelation: "Father",     loggedBy: "Junaid Akhtar" },
  { id: "FD003", studentId: "ST007", studentName: "Maryam Noor",   grade: "Grade 4", className: "Class A", type: "Early Collection",  time: "11:40", date: "2026-09-12", reason: "Dentist appointment",   personName: "Noor Hassan",    personRelation: "Mother",     loggedBy: "Hina Latif" },
  { id: "FD004", studentId: "ST030", studentName: "Vania Saeed",   grade: "Grade 5", className: "Class B", type: "Early Collection",  time: "13:15", date: "2026-09-11", reason: "Family emergency",      personName: "Saeed Anwar",    personRelation: "Father",     loggedBy: "Junaid Akhtar" },
  { id: "FD005", studentId: "ST024", studentName: "Pariwash Khan", grade: "Grade 5", className: "Class B", type: "Late Arrival",      time: "09:35", date: "2026-09-11", reason: "Traffic",               personName: "Khan Bahadur",   personRelation: "Father",     loggedBy: "Junaid Akhtar" },
];

/* =========================================================
   Attendance Corrections
   ========================================================= */

export type CorrectionRequest = {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  className: string;
  date: string;              // YYYY-MM-DD
  currentStatus: "Present" | "Absent" | "Late";
  requestedStatus: "Present" | "Absent" | "Late";
  requestedBy: string;       // teacher name
  requestedAt: string;       // HH:MM
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  reviewedBy?: string;
};

export const correctionRequests: CorrectionRequest[] = [
  {
    id: "CR001",
    studentId: "ST018",
    studentName: "Javeria Noor",
    grade: "Grade 5",
    className: "Class A",
    date: "2026-09-12",
    currentStatus: "Absent",
    requestedStatus: "Present",
    requestedBy: "Fatima Iqbal",
    requestedAt: "10:45",
    reason: "Student was present but marked absent by mistake.",
    status: "Pending",
  },
  {
    id: "CR002",
    studentId: "ST016",
    studentName: "Hira Aslam",
    grade: "Grade 5",
    className: "Class A",
    date: "2026-09-11",
    currentStatus: "Late",
    requestedStatus: "Present",
    requestedBy: "Fatima Iqbal",
    requestedAt: "11:10",
    reason: "Arrived on time but traffic delay in roll call.",
    status: "Pending",
  },
  {
    id: "CR003",
    studentId: "ST023",
    studentName: "Omar Farooq",
    grade: "Grade 5",
    className: "Class B",
    date: "2026-09-10",
    currentStatus: "Absent",
    requestedStatus: "Present",
    requestedBy: "Ahmed Hassan",
    requestedAt: "09:30",
    reason: "Present in class — duplicate entry.",
    status: "Approved",
    reviewedBy: "Junaid Akhtar",
  },
  {
    id: "CR004",
    studentId: "ST027",
    studentName: "Saad Mirza",
    grade: "Grade 5",
    className: "Class B",
    date: "2026-09-09",
    currentStatus: "Present",
    requestedStatus: "Late",
    requestedBy: "Ahmed Hassan",
    requestedAt: "14:20",
    reason: "Arrived after roll call, correction to Late.",
    status: "Rejected",
    reviewedBy: "Junaid Akhtar",
  },
];