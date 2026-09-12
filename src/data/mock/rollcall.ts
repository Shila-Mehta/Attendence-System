export type RollCallStatus = "Present" | "Absent" | "Late";

export type RollCallClass = {
  id: string;
  name: string;
  grade: string;
  room: string;
  teacher: string;
};

export type RollCallStudent = {
  id: string;
  name: string;
  classId: string;
};

export const rollCallClasses: RollCallClass[] = [
  { id: "CL001", name: "Class A", grade: "Grade 5", room: "R-101", teacher: "Fatima Iqbal" },
  { id: "CL002", name: "Class B", grade: "Grade 5", room: "R-102", teacher: "Ahmed Hassan" },
  { id: "CL003", name: "Class A", grade: "Grade 4", room: "R-201", teacher: "Sana Yousuf" },
];

export const rollCallStudents: RollCallStudent[] = [
  // CL001 — Grade 5 Class A (12)
  { id: "ST001", name: "Ayesha Khan",   classId: "CL001" },
  { id: "ST002", name: "Ali Raza",      classId: "CL001" },
  { id: "ST012", name: "Daniyal Iqbal", classId: "CL001" },
  { id: "ST013", name: "Emaan Shah",    classId: "CL001" },
  { id: "ST014", name: "Faizan Ali",    classId: "CL001" },
  { id: "ST015", name: "Gul Nawaz",     classId: "CL001" },
  { id: "ST016", name: "Hira Aslam",    classId: "CL001" },
  { id: "ST017", name: "Idrees Khan",   classId: "CL001" },
  { id: "ST018", name: "Javeria Noor",  classId: "CL001" },
  { id: "ST019", name: "Kashif Raza",   classId: "CL001" },
  { id: "ST020", name: "Laiba Yousuf",  classId: "CL001" },
  { id: "ST021", name: "Muneeb Ahmed",  classId: "CL001" },

  // CL002 — Grade 5 Class B (10)
  { id: "ST005", name: "Zainab Malik",  classId: "CL002" },
  { id: "ST022", name: "Noman Sheikh",  classId: "CL002" },
  { id: "ST023", name: "Omar Farooq",   classId: "CL002" },
  { id: "ST024", name: "Pariwash Khan", classId: "CL002" },
  { id: "ST025", name: "Qasim Ali",     classId: "CL002" },
  { id: "ST026", name: "Rania Aslam",   classId: "CL002" },
  { id: "ST027", name: "Saad Mirza",    classId: "CL002" },
  { id: "ST028", name: "Tania Iqbal",   classId: "CL002" },
  { id: "ST029", name: "Umer Hayat",    classId: "CL002" },
  { id: "ST030", name: "Vania Saeed",   classId: "CL002" },

  // CL003 — Grade 4 Class A (8)
  { id: "ST003", name: "Sara Ahmed",    classId: "CL003" },
  { id: "ST007", name: "Maryam Noor",   classId: "CL003" },
  { id: "ST031", name: "Waleed Khan",   classId: "CL003" },
  { id: "ST032", name: "Xara Yousuf",   classId: "CL003" },
  { id: "ST033", name: "Yasir Mehmood", classId: "CL003" },
  { id: "ST034", name: "Zara Hussain",  classId: "CL003" },
  { id: "ST035", name: "Ahad Raza",     classId: "CL003" },
  { id: "ST036", name: "Bilal Anwar",   classId: "CL003" },
];