import type { Student } from "@/data/mock/student";
import type { ClassRoom } from "@/data/mock/classes";
import type { Staff } from "@/data/mock/staff";
import type { Contact } from "@/data/mock/contacts";

/* =========================================================
   Base fetch wrapper
   ---------------------------------------------------------
   One place for headers, error handling, auth (later).
   ========================================================= */

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    // When you add auth, handle 401 here:
    // if (res.status === 401) window.location.href = "/staff-login";
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  // 204 No Content (DELETE responses)
  if (res.status === 204) return undefined as T;

  return res.json();
}

/* =========================================================
   Students
   ========================================================= */

export const studentsApi = {
  list: () => request<Student[]>("/api/students"),

  get: (id: string) => request<Student>(`/api/students/${id}`),

  create: (data: Student) =>
    request<Student>("/api/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Student) =>
    request<Student>(`/api/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/api/students/${id}`, { method: "DELETE" }),
};

/* =========================================================
   Classes
   ========================================================= */

export const classesApi = {
  list: () => request<ClassRoom[]>("/api/classes"),

  get: (id: string) => request<ClassRoom>(`/api/classes/${id}`),

  create: (data: ClassRoom) =>
    request<ClassRoom>("/api/classes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: ClassRoom) =>
    request<ClassRoom>(`/api/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/api/classes/${id}`, { method: "DELETE" }),
};

/* =========================================================
   Staff
   ========================================================= */

export const staffApi = {
  list: () => request<Staff[]>("/api/staff"),

  get: (id: string) => request<Staff>(`/api/staff/${id}`),

  create: (data: Staff) =>
    request<Staff>("/api/staff", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Staff) =>
    request<Staff>(`/api/staff/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/api/staff/${id}`, { method: "DELETE" }),
};

/* =========================================================
   Contacts
   ========================================================= */

export const contactsApi = {
  list: () => request<Contact[]>("/api/contacts"),

  get: (id: string) => request<Contact>(`/api/contacts/${id}`),

  create: (data: Contact) =>
    request<Contact>("/api/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Contact) =>
    request<Contact>(`/api/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/api/contacts/${id}`, { method: "DELETE" }),
};