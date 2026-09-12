export type StaffRole =
  | "Admin"
  | "Office"
  | "Principal"
  | "Teacher"
  | "Assistant";

export type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  department: string;
  joinedAt: string; // ISO date
  assignedClassIds: string[];
  status: "Active" | "Inactive";
};

export const staff: Staff[] = [
  { id: "SF001", name: "Fatima Iqbal",  email: "fatima@school.edu",  phone: "+92 301 1000001", role: "Teacher",   department: "Primary",     joinedAt: "2022-04-10", assignedClassIds: ["CL001", "CL004", "CL007"], status: "Active" },
  { id: "SF002", name: "Ahmed Hassan",  email: "ahmed@school.edu",   phone: "+92 301 1000002", role: "Teacher",   department: "Primary",     joinedAt: "2021-08-15", assignedClassIds: ["CL002", "CL005"],          status: "Active" },
  { id: "SF003", name: "Sana Yousuf",   email: "sana@school.edu",    phone: "+92 301 1000003", role: "Teacher",   department: "Primary",     joinedAt: "2023-01-20", assignedClassIds: ["CL003", "CL006", "CL008"], status: "Active" },
  { id: "SF004", name: "Kamran Sheikh", email: "kamran@school.edu",  phone: "+92 301 1000004", role: "Assistant", department: "Primary",     joinedAt: "2023-06-01", assignedClassIds: ["CL001", "CL003"],          status: "Active" },
  { id: "SF005", name: "Rehana Malik",  email: "rehana@school.edu",  phone: "+92 301 1000005", role: "Assistant", department: "Primary",     joinedAt: "2023-09-12", assignedClassIds: ["CL002", "CL005", "CL008"], status: "Active" },
  { id: "SF006", name: "Junaid Akhtar", email: "junaid@school.edu",  phone: "+92 301 1000006", role: "Office",    department: "Front Office",joinedAt: "2021-02-05", assignedClassIds: [],                          status: "Active" },
  { id: "SF007", name: "Nazia Rafiq",   email: "nazia@school.edu",   phone: "+92 301 1000007", role: "Principal", department: "Leadership",  joinedAt: "2019-08-01", assignedClassIds: [],                          status: "Active" },
  { id: "SF008", name: "Usman Bashir",  email: "usman@school.edu",   phone: "+92 301 1000008", role: "Admin",     department: "Operations",  joinedAt: "2020-11-18", assignedClassIds: [],                          status: "Active" },
  { id: "SF009", name: "Hina Latif",    email: "hina@school.edu",    phone: "+92 301 1000009", role: "Office",    department: "Front Office",joinedAt: "2022-10-03", assignedClassIds: [],                          status: "Inactive" },
];