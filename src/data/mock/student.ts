export type StudentStatus = "Active" | "Inactive";

export type Student = {
  id: string;
  name: string;
  grade: string;
  class: string;
  guardianName: string;
  guardianPhone: string;
  status: StudentStatus;
  enrolledAt: string;
};

export const students: Student[] = [
  { id: "ST001", name: "Ayesha Khan",  grade: "Grade 5", class: "Class A", guardianName: "Imran Khan",    guardianPhone: "+92 300 1111111", status: "Active",   enrolledAt: "2024-08-15" },
  { id: "ST002", name: "Ali Raza",     grade: "Grade 5", class: "Class A", guardianName: "Sajid Raza",    guardianPhone: "+92 300 2222222", status: "Active",   enrolledAt: "2024-08-15" },
  { id: "ST003", name: "Sara Ahmed",   grade: "Grade 4", class: "Class B", guardianName: "Nadia Ahmed",   guardianPhone: "+92 300 3333333", status: "Active",   enrolledAt: "2024-08-16" },
  { id: "ST004", name: "Hamza Ali",    grade: "Grade 6", class: "Class A", guardianName: "Bilal Ali",     guardianPhone: "+92 300 4444444", status: "Active",   enrolledAt: "2024-08-16" },
  { id: "ST005", name: "Zainab Malik", grade: "Grade 5", class: "Class B", guardianName: "Faisal Malik",  guardianPhone: "+92 300 5555555", status: "Inactive", enrolledAt: "2023-08-10" },
  { id: "ST006", name: "Usman Tariq",  grade: "Grade 3", class: "Class A", guardianName: "Tariq Mehmood", guardianPhone: "+92 300 6666666", status: "Active",   enrolledAt: "2024-08-20" },
  { id: "ST007", name: "Maryam Noor",  grade: "Grade 4", class: "Class A", guardianName: "Noor Hassan",   guardianPhone: "+92 300 7777777", status: "Active",   enrolledAt: "2024-08-20" },
  { id: "ST008", name: "Bilal Sheikh", grade: "Grade 6", class: "Class B", guardianName: "Sheikh Rashid", guardianPhone: "+92 300 8888888", status: "Active",   enrolledAt: "2024-08-21" },
];