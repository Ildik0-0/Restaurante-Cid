import { Outlet, Link } from "react-router-dom";
import { clearAdminSession } from "../../data/adminAccess";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#fbf5e8] text-slate-800">
      <header className="sticky top-0 z-20 border-b border-[#e8ddc8] bg-[#fbf5e8]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-sm font-semibold tracking-[0.18em] text-[#7d6a2c] uppercase">
              CID Panel
            </Link>
            <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 md:flex">
              <Link to="/homepage" className="hover:text-slate-900">Inicio</Link>
              <Link to="/event" className="hover:text-slate-900">Conciertos</Link>
              <Link to="/admin" className="rounded border border-[#d7ca9e] bg-[#f3ead0] px-3 py-2 text-[#7d6a2c]">Reservas</Link>
            </nav>
          </div>

          <button
            onClick={() => {
              clearAdminSession();
              window.location.href = "/admin/login";
            }}
            className="rounded-full border border-[#d7ca9e] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:bg-[#f3ead0]"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}