export type ReviewStatus = "Present" | "Absent" | "Late";
export type LeftEarlyReason = "Medical" | "Family" | "Appointment" | "Other";

export type ReviewRow = {
  studentId: string;
  name: string;
  status: ReviewStatus;
  arrivalTime?: string;   // when Late
  leftEarly?: boolean;
  leftEarlyTime?: string;
  leftEarlyReason?: LeftEarlyReason;
  note?: string;
};

export type ReviewSubmission = {
  id: string;
  classId: string;
  className: string;
  grade: string;
  room: string;
  teacher: string;
  submittedAt: string;    // HH:MM
  submittedBy: string;
  locked: boolean;
  rows: ReviewRow[];
};

export const reviewSubmission: ReviewSubmission = {
  id: "SUB-2026-09-12-CL001",
  classId: "CL001",
  className: "Class A",
  grade: "Grade 5",
  room: "R-101",
  teacher: "Fatima Iqbal",
  submittedAt: "08:58",
  submittedBy: "Fatima Iqbal",
  locked: false,
  rows: [
    { studentId: "ST001", name: "Ayesha Khan",   status: "Present" },
    { studentId: "ST002", name: "Ali Raza",      status: "Present" },
    { studentId: "ST012", name: "Daniyal Iqbal", status: "Late", arrivalTime: "09:12", note: "Bus delayed" },
    { studentId: "ST013", name: "Emaan Shah",    status: "Present" },
    { studentId: "ST014", name: "Faizan Ali",    status: "Absent", note: "Parent called — fever" },
    { studentId: "ST015", name: "Gul Nawaz",     status: "Present" },
    { studentId: "ST016", name: "Hira Aslam",    status: "Present" },
    { studentId: "ST017", name: "Idrees Khan",   status: "Absent" },
    { studentId: "ST018", name: "Javeria Noor",  status: "Present" },
    { studentId: "ST019", name: "Kashif Raza",   status: "Late", arrivalTime: "09:05" },
    { studentId: "ST020", name: "Laiba Yousuf",  status: "Present" },
    { studentId: "ST021", name: "Muneeb Ahmed",  status: "Present" },
  ],
};