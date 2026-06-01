import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../data/firebase";

type EventItem = {
  docId?: string;
  id_event?: number;
  title: string;
  genre: string;
  location?: string;
  date: string;
  time: string;
  price: string;
  image: string;
  description: string;
};

function parseDate(value: string) {
  if (value.includes("-")) {
    const [year, month, day] = value.split("-").map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  }

  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

function isValidEvent(event: EventItem) {
  return [event.title, event.genre, event.date, event.time, event.price, event.image, event.description].every(
    (field) => field.trim().length > 0,
  );
}

function sortEventsById(left: EventItem, right: EventItem) {
  return (Number(right.id_event ?? 0) - Number(left.id_event ?? 0));
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [cleanupError, setCleanupError] = useState("");
  const [cleaningEvents, setCleaningEvents] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Todos" | "Próximos" | "Pasados">("Todos");
  const [form, setForm] = useState({
    title: "",
    genre: "",
    location: "",
    date: "",
    time: "",
    price: "",
    image: "",
    description: "",
  });

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");
      const snapshot = await getDocs(collection(db, "Event"));
      const loadedEvents = snapshot.docs
        .map((document) => ({
          docId: document.id,
          ...(document.data() as EventItem),
          id_event: Number(document.data().id_event ?? 0),
        }))
        .filter(isValidEvent)
        .sort(sortEventsById);

      setEvents(loadedEvents);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar los eventos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const today = new Date();

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !normalizedSearch ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.genre.toLowerCase().includes(normalizedSearch) ||
        (event.location || "").toLowerCase().includes(normalizedSearch) ||
        event.description.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;

      const eventDate = parseDate(event.date);
      if (!eventDate || filter === "Todos") return true;

      if (filter === "Próximos") return eventDate >= today;
      return eventDate < today;
    });
  }, [events, search, filter]);

  const upcomingCount = useMemo(
    () => events.filter((event) => {
      const eventDate = parseDate(event.date);
      return eventDate ? eventDate >= today : false;
    }).length,
    [events, today],
  );

  const pastCount = useMemo(
    () => events.filter((event) => {
      const eventDate = parseDate(event.date);
      return eventDate ? eventDate < today : false;
    }).length,
    [events, today],
  );

  const stats = [
    { label: "Total conciertos", value: events.length },
    { label: "Próximos", value: upcomingCount },
    { label: "Pasados", value: pastCount },
  ];

  async function cleanInvalidEvents() {
    try {
      setCleaningEvents(true);
      setCleanupError("");

      const snapshot = await getDocs(collection(db, "Event"));
      const invalidDocs = snapshot.docs.filter((document) => {
        const event = document.data() as EventItem;
        return !isValidEvent({
          ...event,
          id_event: Number(event.id_event ?? 0),
        });
      });

      await Promise.all(invalidDocs.map((document) => deleteDoc(doc(db, "Event", document.id))));
      await loadEvents();
    } catch (err: any) {
      setCleanupError(err?.message || "No se pudieron limpiar los eventos vacíos.");
    } finally {
      setCleaningEvents(false);
    }
  }

  function resetForm() {
    setForm({
      title: "",
      genre: "",
      location: "",
      date: "",
      time: "",
      price: "",
      image: "",
      description: "",
    });
    setEditingDocId(null);
  }

  function handleEditEvent(event: EventItem) {
    setForm({
      title: event.title,
      genre: event.genre,
      location: event.location || "",
      date: event.date,
      time: event.time,
      price: event.price,
      image: event.image,
      description: event.description,
    });
    setEditingDocId(event.docId ?? null);
    setFormError("");
    setShowCreateForm(true);
  }

  async function handleDeleteEvent(event: EventItem) {
    if (!event.docId) return;

    try {
      await deleteDoc(doc(db, "Event", event.docId));
      setEvents((current) => current.filter((item) => item.docId !== event.docId));
    } catch (err: any) {
      setError(err?.message || "No se pudo eliminar el evento.");
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const requiredFields = [form.title, form.genre, form.location, form.date, form.time, form.price, form.image, form.description];

    if (requiredFields.some((field) => !field.trim())) {
      setFormError("Completa todos los campos para crear el evento.");
      return;
    }

    try {
      setSaving(true);
      if (editingDocId) {
        await updateDoc(doc(db, "Event", editingDocId), {
          title: form.title.trim(),
          genre: form.genre.trim(),
          location: form.location.trim(),
          date: form.date.trim(),
          time: form.time.trim(),
          price: form.price.trim(),
          image: form.image.trim(),
          description: form.description.trim(),
        });
      } else {
        const nextId = events.reduce((max, event) => Math.max(max, Number(event.id_event ?? 0)), 0) + 1;
        await addDoc(collection(db, "Event"), {
          id_event: nextId,
          title: form.title.trim(),
          genre: form.genre.trim(),
          location: form.location.trim(),
          date: form.date.trim(),
          time: form.time.trim(),
          price: form.price.trim(),
          image: form.image.trim(),
          description: form.description.trim(),
        });
      }

      resetForm();
      setShowCreateForm(false);
      await loadEvents();
    } catch (err: any) {
      setFormError(err?.message || "No se pudo crear el evento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#eadfbe] bg-[#fbf7ef] px-5 py-6 shadow-[0_12px_35px_rgba(117,96,35,0.08)] sm:px-8 sm:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7b4f]">Admin Panel</p>
            <h1 className="mt-3 font-serif text-3xl text-slate-900 sm:text-4xl">Panel de Administración</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Gestiona los conciertos de El CiD</p>
          </div>

          <div className="flex flex-wrap gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setShowCreateForm((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full bg-[#7f8a2b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#697324]"
            >
              <span className="text-base leading-none">+</span>
              {showCreateForm ? "Cerrar formulario" : "Nuevo Concierto"}
            </button>
            <button
              type="button"
              onClick={cleanInvalidEvents}
              disabled={cleaningEvents}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8c99b] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#faf4e2] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {cleaningEvents ? "Limpiando..." : "Limpiar vacíos"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-[#eadfbe] bg-white px-4 py-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
            </article>
          ))}
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm">
            <form onSubmit={handleCreateEvent} className="w-full max-w-3xl rounded-[28px] border border-[#eadfbe] bg-[#fbf7ef] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:p-6">
              <div className="flex flex-col gap-3 border-b border-[#f0e7cf] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b7b4f]">Crear evento</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Nuevo concierto de prueba</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormError("");
                      resetForm();
                    }}
                    className="rounded-full border border-[#eadfbe] px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#faf4e2]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-[#7f8a2b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#697324] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? "Guardando..." : editingDocId ? "Guardar cambios" : "Guardar evento"}
                  </button>
                </div>
              </div>

              {formError && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  value={form.title}
                  onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                  placeholder="Título"
                  className="rounded-xl border border-[#eadfbe] px-4 py-3 text-sm outline-none focus:border-[#7f8a2b]"
                />
                <input
                  value={form.genre}
                  onChange={(e) => setForm((current) => ({ ...current, genre: e.target.value }))}
                  placeholder="Género"
                  className="rounded-xl border border-[#eadfbe] px-4 py-3 text-sm outline-none focus:border-[#7f8a2b]"
                />
                <input
                  value={form.location}
                  onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
                  placeholder="Ubicación"
                  className="rounded-xl border border-[#eadfbe] px-4 py-3 text-sm outline-none focus:border-[#7f8a2b]"
                />
                <input
                  value={form.date}
                  onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
                  type="date"
                  className="rounded-xl border border-[#eadfbe] px-4 py-3 text-sm outline-none focus:border-[#7f8a2b]"
                />
                <input
                  value={form.time}
                  onChange={(e) => setForm((current) => ({ ...current, time: e.target.value }))}
                  type="time"
                  className="rounded-xl border border-[#eadfbe] px-4 py-3 text-sm outline-none focus:border-[#7f8a2b]"
                />
                <input
                  value={form.price}
                  onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
                  placeholder="Precio"
                  className="rounded-xl border border-[#eadfbe] px-4 py-3 text-sm outline-none focus:border-[#7f8a2b]"
                />
                <input
                  value={form.image}
                  onChange={(e) => setForm((current) => ({ ...current, image: e.target.value }))}
                  placeholder="URL de imagen"
                  className="md:col-span-2 rounded-xl border border-[#eadfbe] px-4 py-3 text-sm outline-none focus:border-[#7f8a2b]"
                />

                <textarea
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                  placeholder="Descripción"
                  className="min-h-28 rounded-xl border border-[#eadfbe] px-4 py-3 text-sm outline-none focus:border-[#7f8a2b] md:col-span-2"
                />
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#eadfbe] bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-3 rounded-full border border-[#eadfbe] bg-[#fffdf7] px-4 py-2 lg:max-w-xl">
            <span className="text-slate-400">⌕</span>
            <input
              type="text"
              placeholder="Buscar por artista o género..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["Todos", "Próximos", "Pasados"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  filter === item
                    ? 'border-[#7f8a2b] bg-[#7f8a2b] text-white'
                    : 'border-[#e5d7ac] bg-white text-slate-600 hover:bg-[#faf4e2]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {loading && (
          <div className="rounded-[22px] border border-[#eadfbe] bg-white p-6 text-sm text-slate-500">
            Cargando eventos...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[22px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {cleanupError && !loading && (
          <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
            {cleanupError}
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="rounded-[22px] border border-[#eadfbe] bg-white p-6 text-sm text-slate-500">
            No hay eventos para mostrar con ese filtro.
          </div>
        )}

        {filteredEvents.map((event) => (
          <article
            key={`${event.id_event ?? event.title}-${event.date}`}
            className="flex flex-col gap-4 rounded-[22px] border border-[#eadfbe] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] lg:flex-row lg:items-center"
          >
            <img
              src={event.image}
              alt={event.title}
              className="h-28 w-full rounded-xl object-cover lg:w-40"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-serif text-2xl text-slate-900">{event.title}</h2>
                  <p className="mt-1 text-sm text-[#7f8a2b]">{event.genre}</p>
                </div>

                <div className="flex gap-2 self-start">
                  <button
                    type="button"
                    onClick={() => handleEditEvent(event)}
                    className="rounded-full border border-[#c7d09b] px-4 py-2 text-sm font-medium text-[#7f8a2b] transition hover:bg-[#f4f7e4]"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event)}
                    className="rounded-full border border-[#ffb1ad] px-4 py-2 text-sm font-medium text-[#ff6b63] transition hover:bg-[#fff3f2]"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{event.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                <span>📅 {event.date}</span>
                <span>🕒 {event.time}</span>
                <span>📍 {event.location || "Sin ubicación"}</span>
                <span className="text-[#7f8a2b]">{event.price}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}