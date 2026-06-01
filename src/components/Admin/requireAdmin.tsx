import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  getAdminSession,
  isAdminUser,
  clearAdminSession,
} from "../../data/adminAccess";
import { auth } from "../../data/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

type Props = { children?: React.ReactNode };

export default function RequireAdmin({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const session = getAdminSession();

    if (session) {
      setLoading(false);
      setIsAdmin(true);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        setIsAdmin(await isAdminUser(user));
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  if (loading) return <div>Loading…</div>;
  if (!isAdmin) {
    clearAdminSession();
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <>{children ?? <Outlet />}</>;
}