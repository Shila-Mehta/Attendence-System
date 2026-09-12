export type ParentAttendanceRecord = {
  date: string;             // YYYY-MM-DD
  status: "Present" | "Absent" | "Late";
  arrivalTime?: string;
  note?: string;
};

export type ParentChild = {
  studentId: string;
  name: string;
  grade: string;
  class: string;
  room: string;
  teacher: string;
  guardianName: string;
  guardianPhone: string;
};

export const parentChild: ParentChild = {
  studentId: "ST001",
  name: "Ayesha Khan",
  grade: "Grade 5",
  class: "Class A",
  room: "R-101",
  teacher: "Fatima Iqbal",
  guardianName: "Imran Khan",
  guardianPhone: "+92 300 1111111",
};

export const parentRecords: ParentAttendanceRecord[] = [
  { date: "2026-09-12", status: "Present" },
  { date: "2026-09-11", status: "Present" },
  { date: "2026-09-10", status: "Late", arrivalTime: "09:08", note: "Bus delayed" },
  { date: "2026-09-09", status: "Present" },
  { date: "2026-09-08", status: "Present" },
  { date: "2026-09-07", status: "Absent", note: "Sick — reported by parent" },
  { date: "2026-09-04", status: "Present" },
  { date: "2026-09-03", status: "Present" },
  { date: "2026-09-02", status: "Present" },
  { date: "2026-09-01", status: "Present" },
  { date: "2026-08-31", status: "Late", arrivalTime: "09:20", note: "Doctor's appointment" },
  { date: "2026-08-28", status: "Present" },
  { date: "2026-08-27", status: "Present" },
  { date: "2026-08-26", status: "Absent", note: "Family emergency" },
  { date: "2026-08-25", status: "Present" },
  { date: "2026-08-22", status: "Present" },
  { date: "2026-08-21", status: "Present" },
  { date: "2026-08-20", status: "Present" },
];

export type ParentAlert = {
  id: string;
  date: string;
  createdAt: string;
  studentId: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "danger";
  read: boolean;
  acknowledged: boolean;
};

export const parentAlerts: ParentAlert[] = [
  {
    id: "AL001",
    date: "2026-09-07",
    createdAt: "09:55",
    studentId: "ST001",
    title: "Unexplained absence",
    message:
      "Ayesha was marked absent but no reason was provided. Please confirm the reason.",
    severity: "danger",
    read: false,
    acknowledged: false,
  },
  {
    id: "AL002",
    date: "2026-08-26",
    createdAt: "10:15",
    studentId: "ST001",
    title: "Unexplained absence",
    message:
      "Ayesha was marked absent but no reason was provided. This has been acknowledged by the Office.",
    severity: "warning",
    read: true,
    acknowledged: true,
  },
];

/* ---------------- absence reasons ---------------- */

export type AbsenceReasonId =
  | "sickness"
  | "appointment"
  | "emergency"
  | "authorised";

export type AbsenceReason = {
  id: AbsenceReasonId;
  label: string;
  desc: string;
};

export const absenceReasons: AbsenceReason[] = [
  {
    id: "sickness",
    label: "Sickness",
    desc: "Fever, cold, flu or other illness.",
  },
  {
    id: "appointment",
    label: "Appointment",
    desc: "Doctor, dentist or medical visit.",
  },
  {
    id: "emergency",
    label: "Emergency",
    desc: "Family or urgent personal matter.",
  },
  {
    id: "authorised",
    label: "Authorised leave",
    desc: "Planned absence approved by the school.",
  },
];