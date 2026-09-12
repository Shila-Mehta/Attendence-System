export type Relationship = "Father" | "Mother" | "Guardian" | "Emergency";

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: Relationship;
  studentId: string;
  studentName: string;
  status: "Active" | "Inactive";
};

export const contacts: Contact[] = [
  { id: "CT001", name: "Imran Khan",     phone: "+92 300 1111111", email: "imran.khan@example.com",    relationship: "Father",    studentId: "ST001", studentName: "Ayesha Khan",  status: "Active" },
  { id: "CT003", name: "Sajid Raza",     phone: "+92 300 2222222", email: "sajid.raza@example.com",    relationship: "Father",    studentId: "ST002", studentName: "Ali Raza",     status: "Active" },
  { id: "CT004", name: "Nadia Ahmed",    phone: "+92 300 3333333", email: "nadia.ahmed@example.com",   relationship: "Mother",    studentId: "ST003", studentName: "Sara Ahmed",   status: "Active" },
  { id: "CT005", name: "Bilal Ali",      phone: "+92 300 4444444", email: "bilal.ali@example.com",     relationship: "Father",    studentId: "ST004", studentName: "Hamza Ali",    status: "Active" },
  { id: "CT006", name: "Faisal Malik",   phone: "+92 300 5555555", email: "faisal.malik@example.com",  relationship: "Father",    studentId: "ST005", studentName: "Zainab Malik", status: "Inactive" },
  { id: "CT007", name: "Tariq Mehmood",  phone: "+92 300 6666666", email: "tariq.m@example.com",       relationship: "Father",    studentId: "ST006", studentName: "Usman Tariq",  status: "Active" },
  { id: "CT009", name: "Noor Hassan",    phone: "+92 300 7777777", email: "noor.hassan@example.com",   relationship: "Guardian",  studentId: "ST007", studentName: "Maryam Noor",  status: "Active" },
  { id: "CT010", name: "Sheikh Rashid",  phone: "+92 300 8888888", email: "sheikh.rashid@example.com", relationship: "Father",    studentId: "ST008", studentName: "Bilal Sheikh", status: "Active" },
];