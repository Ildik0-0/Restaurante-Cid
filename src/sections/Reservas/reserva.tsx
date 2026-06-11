import { useState } from 'react'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../../data/firebase'
import { addHours, overlaps, parseReservationDateTime, reservationTables } from '../../data/reservationTables'
import './reserva.css'

async function assignTableForReservation(date: string, time: string, guests: number) {
    const reservationSnapshot = await getDocs(collection(db, 'Reservas'))

    const reservationStart = parseReservationDateTime(date, time)

    if (!reservationStart) {
        throw new Error('La fecha o la hora no son válidas.')
    }

    const reservationEnd = addHours(reservationStart, 2)
    const candidates = reservationTables
        .filter((table) => table.capacity >= guests)
        .sort((left, right) => left.capacity - right.capacity || Number(left.name.split(' ')[1]) - Number(right.name.split(' ')[1]))

    if (candidates.length === 0) {
        throw new Error('No hay una mesa adecuada para ese número de personas.')
    }

    const existingReservations = reservationSnapshot.docs.map((document) => document.data() as { mesa?: string; date?: string; time?: string; status?: string; endsAt?: string })

    const availableTable = candidates.find((table) => {
        return existingReservations.every((reservation) => {
            if (reservation.status === 'cancelada') return true
            if (reservation.mesa !== table.name || !reservation.date || !reservation.time) return true

            const existingStart = parseReservationDateTime(reservation.date, reservation.time)
            if (!existingStart) return true

            const existingEnd = reservation.endsAt ? new Date(reservation.endsAt) : addHours(existingStart, 2)
            if (Number.isNaN(existingEnd.getTime())) return true

            return !overlaps(reservationStart, reservationEnd, existingStart, existingEnd)
        })
    })

    if (!availableTable) {
        throw new Error('No hay mesas disponibles para esa fecha y hora. Prueba con otro horario.')
    }

    return { tableName: availableTable.name, reservationStart, reservationEnd }
}

export default function Reservas() {
    const [sending, setSending] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = event.currentTarget

        const formData = new FormData(form)
        const name = String(formData.get('name') ?? '').trim()
        const email = String(formData.get('email') ?? '').trim()
        const date = String(formData.get('date') ?? '').trim()
        const time = String(formData.get('time') ?? '').trim()
        const guests = String(formData.get('guests') ?? '').trim()
        const notes = String(formData.get('notes') ?? '').trim()

        if (!name || !email || !date || !time || !guests) {
            setError('Completa los campos obligatorios para continuar.')
            setMessage('')
            return
        }

        try {
            setSending(true)
            setError('')
            setMessage('')

            const guestsCount = Number(guests)
            if (Number.isNaN(guestsCount) || guestsCount <= 0) {
                throw new Error('El número de personas no es válido.')
            }

            const assignedTable = await assignTableForReservation(date, time, guestsCount)

            await addDoc(collection(db, 'Reservas'), {
                name,
                email,
                mesa: assignedTable.tableName,
                date,
                time,
                guests: guestsCount,
                notes,
                status: 'pendiente',
                createdAt: new Date().toISOString(),
                startsAt: assignedTable.reservationStart.toISOString(),
                endsAt: assignedTable.reservationEnd.toISOString(),
                durationMinutes: 120,
            })

            setMessage(`Reserva enviada correctamente. Se asignó ${assignedTable.tableName} para 2 horas.`)
            form.reset()
        } catch (err: any) {
            setError(err?.message || 'No se pudo enviar la reserva.')
        } finally {
            setSending(false)
        }
    }

    return (
        <section className="reservas-page">
            <div className="reservas-hero">
                <p className="reservas-kicker">Reservas</p>
                <h1 className="reservas-title">Reserva tu mesa con comodidad</h1>
                <p className="reservas-description">
                    Cuéntanos cuándo vienes y prepara tu visita en un espacio cálido, cuidado y fácil de usar.
                </p>
            </div>

            <div className="reservas-container-form">
                <aside className="reservas-card reservas-card--info">
                    <p className="reservas-card-label">Detalles de la reserva</p>
                    <h2 className="reservas-card-title">Todo listo en unos segundos</h2>
                    <p className="reservas-card-text">
                        La mesa se asigna automáticamente según el número de personas y queda reservada por un máximo de 2 horas.
                    </p>

                    <ul className="reservas-list">
                        <li>Confirmación rápida por correo</li>
                        <li>Ambiente tranquilo y atención personalizada</li>
                        <li>Formulario pensado para móvil y escritorio</li>
                    </ul>
                </aside>

                <form className="reservas-card reservas-form" onSubmit={handleSubmit}>
                    <div className="reservas-field">
                        <label htmlFor="name">Nombre</label>
                        <input type="text" id="name" name="name" placeholder="Tu nombre completo" required />
                    </div>

                    <div className="reservas-field">
                        <label htmlFor="email">Correo electrónico</label>
                        <input type="email" id="email" name="email" placeholder="tu@email.com" required />
                    </div>

                    <div className="reservas-grid">
                        <div className="reservas-field">
                            <label htmlFor="date">Fecha</label>
                            <input type="date" id="date" name="date" required />
                        </div>

                        <div className="reservas-field">
                            <label htmlFor="time">Hora</label>
                            <input type="time" id="time" name="time" required />
                        </div>
                    </div>

                    <div className="reservas-field">
                        <label htmlFor="guests">Número de personas</label>
                        <input type="number" id="guests" name="guests" min="1" placeholder="2" required />
                    </div>

                    <div className="reservas-field reservas-field--full">
                        <label htmlFor="notes">Mensaje opcional</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={4}
                            placeholder="Alergias, celebración especial o cualquier detalle importante"
                        />
                    </div>

                    <button type="submit" className="reservas-button">
                        {sending ? 'Enviando...' : 'Hacer reserva'}
                    </button>

                    {message && <p className="reservas-feedback reservas-feedback--success">{message}</p>}
                    {error && <p className="reservas-feedback reservas-feedback--error">{error}</p>}
                </form>
            </div>
        </section>
    )
}