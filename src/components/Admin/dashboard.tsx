import { useEffect, useMemo, useState, type FormEvent } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../data/firebase";
import { addHours, overlaps, parseReservationDateTime, reservationTables, totalTables } from "../../data/reservationTables";

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
  instagram?: string;
  facebook?: string;
  youtube?: string;
};

type ReservationItem = {
  docId?: string;
  name: string;
  email: string;
  mesa: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  status?: string;
  createdAt?: string;
  startsAt?: string;
  endsAt?: string;
  durationMinutes?: number;
};

type ReservationFormState = {
  name: string;
  email: string;
  date: string;
  time: string;
  guests: string;
  notes: string;
  status: "pendiente" | "confirmada" | "cancelada";
};

const emptyReservationForm: ReservationFormState = {
  name: "",
  email: "",
  date: "",
  time: "",
  guests: "",
  notes: "",
  status: "pendiente",
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
  return Number(right.id_event ?? 0) - Number(left.id_event ?? 0);
}

function parseReservationDate(value: string) {
  if (!value) return null;

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatReservationDate(value: string) {
  const parsed = parseReservationDate(value);
  if (!parsed) return value;

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function formatReservationTime(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function formatReservationWindow(reservation: ReservationItem) {
  if (reservation.startsAt && reservation.endsAt) {
    return `${formatReservationTime(reservation.startsAt)} - ${formatReservationTime(reservation.endsAt)}`;
  }

  const start = parseReservationDateTime(reservation.date, reservation.time);
  if (!start) return reservation.time;

  const end = new Date(start.getTime() + 120 * 60 * 1000);
  return `${formatReservationTime(start.toISOString())} - ${formatReservationTime(end.toISOString())}`;
}

function getTableOptionsForGuests(guests: number) {
  return reservationTables.filter((table) => table.capacity >= guests).sort((left, right) => left.capacity - right.capacity);
}

function assignReservationTable(existingReservations: ReservationItem[], date: string, time: string, guests: number, reservationId?: string) {
  const reservationStart = parseReservationDateTime(date, time);

  if (!reservationStart) {
    throw new Error("La fecha o la hora no son válidas.");
  }

  const reservationEnd = addHours(reservationStart, 2);
  const candidates = getTableOptionsForGuests(guests);

  if (candidates.length === 0) {
    throw new Error("No hay una mesa adecuada para ese número de personas.");
  }

  const availableTable = candidates.find((table) => {
    return existingReservations.every((reservation) => {
      if (reservation.docId === reservationId) return true;
      if (reservation.status === "cancelada") return true;
      if (reservation.mesa !== table.name || !reservation.date || !reservation.time) return true;

      const existingStart = parseReservationDateTime(reservation.date, reservation.time);
      if (!existingStart) return true;

      const existingEnd = reservation.endsAt ? new Date(reservation.endsAt) : addHours(existingStart, 2);
      if (Number.isNaN(existingEnd.getTime())) return true;

      return !overlaps(reservationStart, reservationEnd, existingStart, existingEnd);
    });
  });

  if (!availableTable) {
    throw new Error("No hay mesas disponibles para esa fecha y hora.");
  }

  return { mesa: availableTable.name, reservationStart, reservationEnd };
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [activeView, setActiveView] = useState<"reservas" | "conciertos">("reservas");
  const [loading, setLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reservationSaving, setReservationSaving] = useState(false);
  const [error, setError] = useState("");
  const [reservationsError, setReservationsError] = useState("");
  const [formError, setFormError] = useState("");
  const [reservationFormError, setReservationFormError] = useState("");
  const [cleanupError, setCleanupError] = useState("");
  const [cleaningEvents, setCleaningEvents] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [editingReservationDocId, setEditingReservationDocId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Todos" | "Próximos" | "Pasados">("Todos");
  const [reservationForm, setReservationForm] = useState<ReservationFormState>(emptyReservationForm);
  const [form, setForm] = useState({
    title: "",
    genre: "",
    location: "",
    date: "",
    time: "",
    price: "",
    image: "",
    description: "",
    instagram: "",
    facebook: "",
    youtube: "",
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

  async function loadReservations() {
    try {
      setReservationsLoading(true);
      setReservationsError("");

      const snapshot = await getDocs(collection(db, "Reservas"));
      const loadedReservations = snapshot.docs
        .map((document) => ({
          docId: document.id,
          ...(document.data() as ReservationItem),
        }))
        .sort((left, right) => {
          const leftStart = left.startsAt || left.createdAt || "";
          const rightStart = right.startsAt || right.createdAt || "";
          return rightStart.localeCompare(leftStart);
        });

      setReservations(loadedReservations);
    } catch (err: any) {
      setReservationsError(err?.message || "No se pudieron cargar las reservas.");
    } finally {
      setReservationsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
    loadReservations();
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
    () =>
      events.filter((event) => {
        const eventDate = parseDate(event.date);
        return eventDate ? eventDate >= today : false;
      }).length,
    [events, today],
  );

  const pastCount = useMemo(
    () =>
      events.filter((event) => {
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

  const reservationStats = [
    { label: "Total reservas", value: reservations.length },
    { label: "Mesas totales", value: totalTables },
    { label: "Mesas reservadas", value: new Set(reservations.map((reservation) => reservation.mesa)).size },
    {
      label: "Reservas próximas",
      value: reservations.filter((reservation) => {
        const reservationDate = parseReservationDate(reservation.date);
        return reservationDate ? reservationDate >= today : false;
      }).length,
    },
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
      instagram: "",
      facebook: "",
      youtube: "",
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
      instagram: event.instagram || "",
      facebook: event.facebook || "",
      youtube: event.youtube || "",
    });
    setEditingDocId(event.docId ?? null);
    setFormError("");
    setShowCreateForm(true);
  }

  async function handleDeleteEvent(event: EventItem) {
    if (!event.docId) return;

    const confirmed = window.confirm(`¿Seguro que quieres eliminar, esto no se puede deshacer "${event.title}"?`);

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "Event", event.docId));
      setEvents((current) => current.filter((item) => item.docId !== event.docId));
    } catch (err: any) {
      setError(err?.message || "No se pudo eliminar el evento.");
    }
  }

  async function handleCreateEvent(e: FormEvent<HTMLFormElement>) {
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
          instagram: form.instagram.trim(),
          facebook: form.facebook.trim(),
          youtube: form.youtube.trim(),
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
          instagram: form.instagram.trim(),
          facebook: form.facebook.trim(),
          youtube: form.youtube.trim(),
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

  function resetReservationForm() {
    setReservationForm(emptyReservationForm);
    setEditingReservationDocId(null);
  }

  function openCreateReservationForm() {
    resetReservationForm();
    setReservationFormError("");
    setShowReservationForm(true);
  }

  function handleEditReservation(reservation: ReservationItem) {
    setReservationForm({
      name: reservation.name,
      email: reservation.email,
      date: reservation.date,
      time: reservation.time,
      guests: String(reservation.guests ?? ""),
      notes: reservation.notes || "",
      status: (reservation.status as ReservationFormState["status"]) || "pendiente",
    });
    setEditingReservationDocId(reservation.docId ?? null);
    setReservationFormError("");
    setShowReservationForm(true);
  }

  async function refreshReservations() {
    const snapshot = await getDocs(collection(db, "Reservas"));
    const loadedReservations = snapshot.docs
      .map((document) => ({
        docId: document.id,
        ...(document.data() as ReservationItem),
      }))
      .sort((left, right) => {
        const leftStart = left.startsAt || left.createdAt || "";
        const rightStart = right.startsAt || right.createdAt || "";
        return rightStart.localeCompare(leftStart);
      });

    setReservations(loadedReservations);
    return loadedReservations;
  }

  async function handleSaveReservation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setReservationFormError("");

    const name = reservationForm.name.trim();
    const email = reservationForm.email.trim();
    const date = reservationForm.date.trim();
    const time = reservationForm.time.trim();
    const notes = reservationForm.notes.trim();
    const guests = Number(reservationForm.guests);

    if (!name || !email || !date || !time || !reservationForm.guests.trim()) {
      setReservationFormError("Completa los campos obligatorios para guardar la reserva.");
      return;
    }

    if (Number.isNaN(guests) || guests <= 0) {
      setReservationFormError("El número de personas no es válido.");
      return;
    }

    try {
      setReservationSaving(true);

      const existingReservations = editingReservationDocId
        ? reservations.filter((reservation) => reservation.docId !== editingReservationDocId)
        : reservations;
      const assignedTable = assignReservationTable(existingReservations, date, time, guests, editingReservationDocId ?? undefined);

      const payload = {
        name,
        email,
        mesa: assignedTable.mesa,
        date,
        time,
        guests,
        notes,
        status: reservationForm.status,
        startsAt: assignedTable.reservationStart.toISOString(),
        endsAt: assignedTable.reservationEnd.toISOString(),
        durationMinutes: 120,
      };

      if (editingReservationDocId) {
        await updateDoc(doc(db, "Reservas", editingReservationDocId), payload);
      } else {
        await addDoc(collection(db, "Reservas"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }

      await refreshReservations();
      setShowReservationForm(false);
      resetReservationForm();
    } catch (err: any) {
      setReservationFormError(err?.message || "No se pudo guardar la reserva.");
    } finally {
      setReservationSaving(false);
    }
  }

  async function handleDeleteReservation(reservation: ReservationItem) {
    if (!reservation.docId) return;

    const confirmed = window.confirm(`¿Seguro que quieres eliminar la reserva de ${reservation.name}?`);
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "Reservas", reservation.docId));
      setReservations((current) => current.filter((item) => item.docId !== reservation.docId));
    } catch (err: any) {
      setReservationsError(err?.message || "No se pudo eliminar la reserva.");
    }
  }

  async function updateReservationStatus(reservation: ReservationItem, status: ReservationFormState["status"]) {
    if (!reservation.docId) return;

    try {
      await updateDoc(doc(db, "Reservas", reservation.docId), { status });
      setReservations((current) => current.map((item) => (item.docId === reservation.docId ? { ...item, status } : item)));
    } catch (err: any) {
      setReservationsError(err?.message || "No se pudo actualizar el estado de la reserva.");
    }
  }

  const formLabelClass = "mb-1.5 block text-sm font-semibold text-slate-800";
  const formInputClass = "block w-full box-border rounded-2xl border border-[#e7dcc5] bg-white px-4 py-3 text-sm text-slate-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-[#9d9aa8] focus:border-[#cbb46f] focus:ring-2 focus:ring-[#e8d89f]/45";
  const formTextareaClass = "block min-h-[108px] w-full box-border rounded-2xl border border-[#e7dcc5] bg-white px-4 py-3 text-sm text-slate-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-[#9d9aa8] focus:border-[#cbb46f] focus:ring-2 focus:ring-[#e8d89f]/45";

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#eadfbe] bg-[#fbf7ef] px-5 py-6 shadow-[0_12px_35px_rgba(117,96,35,0.08)] sm:px-8 sm:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7b4f]">Admin Panel</p>
            <h1 className="mt-3 font-serif text-3xl text-slate-900 sm:text-4xl">Panel de Administración</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              {activeView === "reservas" ? "Gestiona las reservas de mesas" : "Gestiona los conciertos de El CiD"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveView("reservas")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeView === "reservas"
                  ? "border-[#7f8a2b] bg-[#7f8a2b] text-white"
                  : "border-[#e5d7ac] bg-white text-slate-600 hover:bg-[#faf4e2]"
              }`}
            >
              Reservas
            </button>

            <button
              type="button"
              onClick={() => setActiveView("conciertos")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeView === "conciertos"
                  ? "border-[#7f8a2b] bg-[#7f8a2b] text-white"
                  : "border-[#e5d7ac] bg-white text-slate-600 hover:bg-[#faf4e2]"
              }`}
            >
              Conciertos
            </button>
          </div>
        </div>

        {activeView === "reservas" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {reservationStats.map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-[#eadfbe] bg-white px-4 py-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-[#eadfbe] bg-white px-4 py-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {activeView === "reservas" ? (
        <section className="space-y-4">
          <div className="rounded-[28px] border border-[#eadfbe] bg-[#fbf7ef] px-5 py-6 shadow-[0_12px_35px_rgba(117,96,35,0.08)] sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7b4f]">Reservas</p>
                <h2 className="mt-3 font-serif text-3xl text-slate-900 sm:text-4xl">Mesas reservadas</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">Aquí gestionas las mesas reservadas y puedes editarlas, cambiarlas de estado o eliminarlas.</p>
              </div>

              <button
                type="button"
                onClick={openCreateReservationForm}
                className="inline-flex items-center gap-2 rounded-full bg-[#7f8a2b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#697324]"
              >
                <span className="text-base leading-none">+</span>
                Nueva reserva
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {reservationStats.map((stat) => (
                <article key={stat.label} className="rounded-2xl border border-[#eadfbe] bg-white px-4 py-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
                </article>
              ))}
            </div>
          </div>

          {reservationsLoading && (
            <div className="rounded-[22px] border border-[#eadfbe] bg-white p-6 text-sm text-slate-500">
              Cargando reservas...
            </div>
          )}

          {reservationsError && !reservationsLoading && (
            <div className="rounded-[22px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {reservationsError}
            </div>
          )}

          {!reservationsLoading && !reservationsError && reservations.length === 0 && (
            <div className="rounded-[22px] border border-[#eadfbe] bg-white p-6 text-sm text-slate-500">
              Todavía no hay reservas guardadas.
            </div>
          )}

          <div className="grid gap-4">
            {reservations.map((reservation) => (
              <article
                key={`${reservation.docId ?? reservation.email}-${reservation.createdAt ?? reservation.date}`}
                className="flex flex-col gap-4 rounded-[22px] border border-[#eadfbe] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-serif text-2xl text-slate-900">{reservation.name}</h3>
                      <p className="mt-1 text-sm text-[#7f8a2b]">{reservation.email}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 self-start">
                      <span className="rounded-full bg-[#f4f7e4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7f8a2b]">
                        {reservation.mesa}
                      </span>
                      <span className="rounded-full border border-[#d8c99b] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                        {reservation.status || "pendiente"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    <span>📅 {formatReservationDate(reservation.date)}</span>
                    <span>🕒 {formatReservationWindow(reservation)}</span>
                    <span>👥 {reservation.guests} personas</span>
                  </div>

                  {reservation.notes && (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{reservation.notes}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 self-start lg:justify-end">
                  <button
                    type="button"
                    onClick={() => handleEditReservation(reservation)}
                    className="rounded-full border border-[#c7d09b] px-4 py-2 text-sm font-medium text-[#7f8a2b] transition hover:bg-[#f4f7e4]"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => updateReservationStatus(reservation, reservation.status === "confirmada" ? "pendiente" : "confirmada")}
                    className="rounded-full border border-[#cfd9a3] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#faf4e2]"
                  >
                    {reservation.status === "confirmada" ? "Volver a pendiente" : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateReservationStatus(reservation, "cancelada")}
                    className="rounded-full border border-[#ffd0cd] px-4 py-2 text-sm font-medium text-[#d95d56] transition hover:bg-[#fff3f2]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteReservation(reservation)}
                    className="rounded-full border border-[#ffb1ad] px-4 py-2 text-sm font-medium text-[#ff6b63] transition hover:bg-[#fff3f2]"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>

          {showReservationForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-4 backdrop-blur-sm">
              <form
                onSubmit={handleSaveReservation}
                className="w-full max-w-[560px] max-h-[88vh] overflow-y-auto rounded-[18px] border border-[#eadfbe] bg-[#fbf7ef] px-4 py-3.5 shadow-[0_20px_48px_rgba(0,0,0,0.22)] sm:px-5 sm:py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-[1.8rem] text-slate-900 sm:text-[1.95rem]">
                      {editingReservationDocId ? "Editar reserva" : "Nueva reserva"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">La mesa se asigna automáticamente según disponibilidad y cantidad de personas.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowReservationForm(false);
                      setReservationFormError("");
                      resetReservationForm();
                    }}
                    className="text-[2rem] leading-none text-slate-500 transition hover:text-slate-900"
                    aria-label="Cerrar formulario"
                  >
                    ×
                  </button>
                </div>

                {reservationFormError && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{reservationFormError}</div>}

                <div className="mt-3.5 space-y-3">
                  <label className="block w-full">
                    <span className={formLabelClass}>Nombre *</span>
                    <input
                      value={reservationForm.name}
                      onChange={(e) => setReservationForm((current) => ({ ...current, name: e.target.value }))}
                      className={formInputClass}
                    />
                  </label>

                  <label className="block w-full">
                    <span className={formLabelClass}>Correo electrónico *</span>
                    <input
                      value={reservationForm.email}
                      onChange={(e) => setReservationForm((current) => ({ ...current, email: e.target.value }))}
                      type="email"
                      className={formInputClass}
                    />
                  </label>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className={formLabelClass}>Fecha *</span>
                      <input
                        value={reservationForm.date}
                        onChange={(e) => setReservationForm((current) => ({ ...current, date: e.target.value }))}
                        type="date"
                        className={formInputClass}
                      />
                    </label>

                    <label className="block">
                      <span className={formLabelClass}>Hora *</span>
                      <input
                        value={reservationForm.time}
                        onChange={(e) => setReservationForm((current) => ({ ...current, time: e.target.value }))}
                        type="time"
                        className={formInputClass}
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block w-full">
                      <span className={formLabelClass}>Número de personas *</span>
                      <input
                        value={reservationForm.guests}
                        onChange={(e) => setReservationForm((current) => ({ ...current, guests: e.target.value }))}
                        type="number"
                        min="1"
                        className={formInputClass}
                      />
                    </label>

                    <label className="block w-full">
                      <span className={formLabelClass}>Estado *</span>
                      <select
                        value={reservationForm.status}
                        onChange={(e) =>
                          setReservationForm((current) => ({
                            ...current,
                            status: e.target.value as ReservationFormState["status"],
                          }))
                        }
                        className={formInputClass}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </label>
                  </div>

                  <label className="block w-full">
                    <span className={formLabelClass}>Notas</span>
                    <textarea
                      value={reservationForm.notes}
                      onChange={(e) => setReservationForm((current) => ({ ...current, notes: e.target.value }))}
                      className={formTextareaClass}
                    />
                  </label>

                  <div className="rounded-2xl border border-[#eadfbe] bg-white px-4 py-3 text-sm text-slate-500">
                    Mesas disponibles en el sistema: {totalTables}. La asignación cambia automáticamente según la capacidad y la disponibilidad.
                  </div>

                  <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button
                      type="submit"
                      disabled={reservationSaving}
                      className="min-w-[180px] rounded-xl bg-[#7b8926] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#65711f] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {reservationSaving ? "Guardando..." : editingReservationDocId ? "Guardar cambios" : "Crear reserva"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReservationForm(false);
                        setReservationFormError("");
                        resetReservationForm();
                      }}
                      className="rounded-xl border border-[#e6dbc0] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#faf4e2]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="space-y-4">
            <div className="rounded-[28px] border border-[#eadfbe] bg-[#fbf7ef] px-5 py-6 shadow-[0_12px_35px_rgba(117,96,35,0.08)] sm:px-8 sm:py-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7b4f]">Conciertos</p>
                  <h2 className="mt-3 font-serif text-3xl text-slate-900 sm:text-4xl">Eventos publicados</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-500">Aquí gestionas los conciertos publicados en el sistema.</p>
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
                          ? "border-[#7f8a2b] bg-[#7f8a2b] text-white"
                          : "border-[#e5d7ac] bg-white text-slate-600 hover:bg-[#faf4e2]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {showCreateForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-4 backdrop-blur-sm">
                  <form onSubmit={handleCreateEvent} className="w-full max-w-[500px] max-h-[88vh] overflow-y-auto rounded-[18px] border border-[#eadfbe] bg-[#fbf7ef] px-4 py-3.5 shadow-[0_20px_48px_rgba(0,0,0,0.22)] sm:px-4 sm:py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-serif text-[1.8rem] text-slate-900 sm:text-[1.95rem]">
                          {editingDocId ? "Editar Concierto" : "Nuevo Concierto"}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setFormError("");
                          resetForm();
                        }}
                        className="text-[2rem] leading-none text-slate-500 transition hover:text-slate-900"
                        aria-label="Cerrar formulario"
                      >
                        ×
                      </button>
                    </div>

                    {formError && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

                    <div className="mt-3.5 space-y-3">
                      <label className="block w-full">
                        <span className={formLabelClass}>Nombre del Artista/Banda *</span>
                        <input
                          value={form.title}
                          onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                          className={formInputClass}
                        />
                      </label>

                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block">
                          <span className={formLabelClass}>Fecha *</span>
                          <input
                            value={form.date}
                            onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
                            type="date"
                            className={formInputClass}
                          />
                        </label>

                        <label className="block">
                          <span className={formLabelClass}>Hora *</span>
                          <input
                            value={form.time}
                            onChange={(e) => setForm((current) => ({ ...current, time: e.target.value }))}
                            type="time"
                            className={formInputClass}
                          />
                        </label>
                      </div>

                      <label className="block w-full">
                        <span className={formLabelClass}>
                          Descripción * <span className="font-normal text-[#b4ab95]">(máx. 140 caracteres)</span>
                        </span>
                        <textarea
                          value={form.description}
                          onChange={(e) => setForm((current) => ({ ...current, description: e.target.value.slice(0, 140) }))}
                          maxLength={140}
                          className={formTextareaClass}
                        />
                      </label>

                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block w-full">
                          <span className={formLabelClass}>Estilo Musical *</span>
                          <input
                            value={form.genre}
                            onChange={(e) => setForm((current) => ({ ...current, genre: e.target.value }))}
                            placeholder="Ej: Rock, Jazz, Flamenco..."
                            className={formInputClass}
                          />
                        </label>

                        <label className="block w-full">
                          <span className={formLabelClass}>Precio de Entrada *</span>
                          <input
                            value={form.price}
                            onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
                            placeholder="Ej: Entrada libre, 5 €..."
                            className={formInputClass}
                          />
                        </label>
                      </div>

                      <label className="block w-full">
                        <span className={formLabelClass}>Ubicación *</span>
                        <input
                          value={form.location}
                          onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
                          placeholder="Ej: Terraza principal, Sala interior..."
                          className={formInputClass}
                        />
                      </label>

                      <label className="block w-full border-b border-[#eadfbe] pb-4">
                        <span className={formLabelClass}>URL de la Imagen *</span>
                        <input
                          value={form.image}
                          onChange={(e) => setForm((current) => ({ ...current, image: e.target.value }))}
                          placeholder="https://..."
                          className={formInputClass}
                        />
                      </label>

                      <div className="w-full space-y-2 border-b border-[#eadfbe] pb-3.5">
                        <p className="font-serif text-base text-slate-900">
                          Redes Sociales <span className="font-sans text-sm font-normal text-[#b4ab95]">(opcional)</span>
                        </p>

                        <label className="block w-full">
                          <span className={formLabelClass}>Instagram</span>
                          <input
                            value={form.instagram}
                            onChange={(e) => setForm((current) => ({ ...current, instagram: e.target.value }))}
                            placeholder="https://instagram.com/..."
                            className={formInputClass}
                          />
                        </label>

                        <label className="block w-full">
                          <span className={formLabelClass}>Facebook</span>
                          <input
                            value={form.facebook}
                            onChange={(e) => setForm((current) => ({ ...current, facebook: e.target.value }))}
                            placeholder="https://facebook.com/..."
                            className={formInputClass}
                          />
                        </label>

                        <label className="block w-full">
                          <span className={formLabelClass}>YouTube</span>
                          <input
                            value={form.youtube}
                            onChange={(e) => setForm((current) => ({ ...current, youtube: e.target.value }))}
                            placeholder="https://youtube.com/..."
                            className={formInputClass}
                          />
                        </label>
                      </div>

                      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="min-w-[180px] rounded-xl bg-[#7b8926] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#65711f] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {saving ? "Guardando..." : editingDocId ? "Guardar cambios" : "Crear Concierto"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateForm(false);
                            setFormError("");
                            resetForm();
                          }}
                          className="rounded-xl border border-[#e6dbc0] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#faf4e2]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {loading && <div className="rounded-[22px] border border-[#eadfbe] bg-white p-6 text-sm text-slate-500">Cargando eventos...</div>}

              {error && !loading && <div className="rounded-[22px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>}

              {cleanupError && !loading && (
                <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">{cleanupError}</div>
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
                  <img src={event.image} alt={event.title} className="h-28 w-full rounded-xl object-cover lg:w-40" />

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
            </div>
          </section>
        </>
      )}
    </div>
  );
}
