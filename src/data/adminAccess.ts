import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { User } from "firebase/auth";

export const ADMIN_SESSION_KEY = "cid_admin_session";

export async function isAdminUser(user: User) {
  const snapshot = await getDocs(collection(db, "Admin"));

  return snapshot.docs.some((document) => {
    const data = document.data();
    return (
      document.id === user.uid ||
      data.uid === user.uid ||
      data.email === user.email ||
      data.active === true ||
      data.rol === "active"
    );
  });
}

export async function findAdminByCredentials(email: string, password: string) {
  const snapshot = await getDocs(collection(db, "Admin"));

  return snapshot.docs.find((document) => {
    const data = document.data();
    return (
      data.email === email &&
      data.password === password &&
      (data.rol === "active" || data.active === true)
    );
  });
}

export function saveAdminSession(adminId: string, email: string) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ adminId, email }));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function getAdminSession() {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as { adminId: string; email: string };
  } catch {
    return null;
  }
}