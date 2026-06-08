import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../../data/firebase'
import './reserva.css'

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

            await addDoc(collection(db, 'Reservas'), {
                name,
                email,
                date,
                time,
                guests: Number(guests),
                notes,
                status: 'pendiente',
                createdAt: new Date().toISOString(),
            })

            setMessage('Reserva enviada correctamente. Nos pondremos en contacto contigo pronto.')
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
                        Elige fecha, hora y número de personas. Si necesitas indicar algo especial, añádelo en el mensaje.
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