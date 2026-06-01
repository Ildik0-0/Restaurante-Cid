import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  clearAdminSession,
  findAdminByCredentials,
  saveAdminSession,
} from "../../data/adminAccess";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const adminDoc = await findAdminByCredentials(email.trim(), password);

      if (!adminDoc) {
        setError("No tienes permisos de administrador.");
        return;
      }

      saveAdminSession(adminDoc.id, email.trim());
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f3efe7_0%,#e8ddc8_45%,#d4c29d_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/90 backdrop-blur border border-white/60 shadow-[0_24px_80px_rgba(0,0,0,0.18)] p-8">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#876f42]">Acceso privado</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Admin Login</h2>
          <p className="mt-2 text-sm text-slate-600">Entra con tu cuenta de administrador para gestionar el panel.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@correo.com"
              type="email"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#876f42]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              type="password"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#876f42]"
            />
          </label>

          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <button
            className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar al admin"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <button
            type="button"
            onClick={() => {
              clearAdminSession();
            }}
            className="mr-4 text-[#876f42] underline-offset-4 hover:underline"
          >
            Limpiar sesión
          </button>
          <Link to="/" className="text-[#876f42] underline-offset-4 hover:underline">
            Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}