export type ClassRoom = {
  id: string;
  name: string;          // "Class A"
  grade: string;         // "Grade 5"
  section: string;       // "A"
  room: string;          // "R-101"
  teacherId: string;     // FK -> staff.id
  assistantId?: string;  // FK -> staff.id
  studentCount: number;
  capacity: number;
  status: "Active" | "Archived";
};

export const classes: ClassRoom[] = [
  { id: "CL001", name: "Class A", grade: "Grade 5", section: "A", room: "R-101", teacherId: "SF001", assistantId: "SF004", studentCount: 28, capacity: 32, status: "Active" },
  { id: "CL002", name: "Class B", grade: "Grade 5", section: "B", room: "R-102", teacherId: "SF002", assistantId: "SF005", studentCount: 26, capacity: 32, status: "Active" },
  { id: "CL003", name: "Class A", grade: "Grade 4", section: "A", room: "R-201", teacherId: "SF003", assistantId: "SF004", studentCount: 30, capacity: 32, status: "Active" },
  { id: "CL004", name: "Class B", grade: "Grade 4", section: "B", room: "R-202", teacherId: "SF001",                    studentCount: 24, capacity: 30, status: "Active" },
  { id: "CL005", name: "Class A", grade: "Grade 6", section: "A", room: "R-301", teacherId: "SF002", assistantId: "SF005", studentCount: 31, capacity: 32, status: "Active" },
  { id: "CL006", name: "Class B", grade: "Grade 6", section: "B", room: "R-302", teacherId: "SF003",                    studentCount: 22, capacity: 30, status: "Active" },
  { id: "CL007", name: "Class A", grade: "Grade 3", section: "A", room: "R-105", teacherId: "SF001",                    studentCount: 27, capacity: 30, status: "Active" },
  { id: "CL008", name: "Class C", grade: "Grade 3", section: "C", room: "R-106", teacherId: "SF003", assistantId: "SF005", studentCount: 12, capacity: 30, status: "Archived" },
];