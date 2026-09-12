export type CsvRow = {
  rowNumber: number;
  studentId: string;
  studentName: string;
  grade: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
};

export type CsvValidation = {
  row: CsvRow;
  errors: string[];
  warnings: string[];
};

export const sampleFileName = "roster_2026_term1.csv";

export const sampleRows: CsvRow[] = [
  {
    rowNumber: 2,
    studentId: "ST101",
    studentName: "Hassan Raza",
    grade: "Grade 4",
    className: "Class A",
    guardianName: "Imran Raza",
    guardianPhone: "+92 300 1000001",
    guardianEmail: "imran.raza@example.com",
  },
  {
    rowNumber: 3,
    studentId: "ST102",
    studentName: "Areeba Khan",
    grade: "Grade 4",
    className: "Class A",
    guardianName: "Sadia Khan",
    guardianPhone: "+92 300 1000002",
    guardianEmail: "sadia.khan@example.com",
  },
  {
    rowNumber: 4,
    studentId: "ST103",
    studentName: "Umar Farooq",
    grade: "Grade 5",
    className: "Class B",
    guardianName: "Naveed Farooq",
    guardianPhone: "",
    guardianEmail: "naveed.farooq@example.com",
  },
  {
    rowNumber: 5,
    studentId: "ST104",
    studentName: "Hina Shah",
    grade: "Grade 6",
    className: "Class A",
    guardianName: "Tariq Shah",
    guardianPhone: "+92 300 1000004",
    guardianEmail: "",
  },
  {
    rowNumber: 6,
    studentId: "ST001",              // duplicate — already exists
    studentName: "Ayesha Khan",
    grade: "Grade 5",
    className: "Class A",
    guardianName: "Imran Khan",
    guardianPhone: "+92 300 1111111",
    guardianEmail: "imran.khan@example.com",
  },
  {
    rowNumber: 7,
    studentId: "",                    // missing ID
    studentName: "Bilal Anwar",
    grade: "Grade 4",
    className: "Class C",
    guardianName: "Anwar Saeed",
    guardianPhone: "+92 300 1000007",
    guardianEmail: "anwar.saeed@example.com",
  },
  {
    rowNumber: 8,
    studentId: "ST108",
    studentName: "",                  // missing name
    grade: "Grade 3",
    className: "Class A",
    guardianName: "Kamran Yousuf",
    guardianPhone: "+92 300 1000008",
    guardianEmail: "kamran.y@example.com",
  },
  {
    rowNumber: 9,
    studentId: "ST109",
    studentName: "Zoya Iqbal",
    grade: "Grade X",                 // invalid grade
    className: "Class A",
    guardianName: "Iqbal Hussain",
    guardianPhone: "+92 300 1000009",
    guardianEmail: "iqbal.h@example.com",
  },
  {
    rowNumber: 10,
    studentId: "ST110",
    studentName: "Saad Mirza",
    grade: "Grade 5",
    className: "Class Z",             // unknown class
    guardianName: "Mirza Ali",
    guardianPhone: "+92 300 1000010",
    guardianEmail: "mirza.ali@example.com",
  },
  {
    rowNumber: 11,
    studentId: "ST111",
    studentName: "Rida Bukhari",
    grade: "Grade 4",
    className: "Class B",
    guardianName: "Bukhari Saeed",
    guardianPhone: "not-a-phone",     // invalid phone
    guardianEmail: "bukhari@example.com",
  },
];

const VALID_GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
const VALID_CLASSES = ["Class A", "Class B", "Class C"];

export function validateRows(rows: CsvRow[]): CsvValidation[] {
  const seenIds = new Set<string>();
  return rows.map((row) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!row.studentId.trim()) errors.push("Missing student ID");
    else if (seenIds.has(row.studentId)) errors.push(`Duplicate ID: ${row.studentId}`);
    else if (["ST001", "ST002", "ST003"].includes(row.studentId))
      errors.push(`ID ${row.studentId} already exists in roster`);
    else seenIds.add(row.studentId);

    if (!row.studentName.trim()) errors.push("Missing student name");

    if (!VALID_GRADES.includes(row.grade))
      errors.push(`Unknown grade: "${row.grade}"`);

    if (!VALID_CLASSES.includes(row.className))
      errors.push(`Unknown class: "${row.className}"`);

    if (!row.guardianName.trim()) errors.push("Missing guardian name");

    if (!row.guardianPhone.trim()) warnings.push("No guardian phone");
    else if (!/^[0-9+\-\s()]{7,}$/.test(row.guardianPhone))
      errors.push("Invalid phone format");

    if (!row.guardianEmail.trim()) warnings.push("No guardian email");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.guardianEmail))
      errors.push("Invalid email format");

    return { row, errors, warnings };
  });
}