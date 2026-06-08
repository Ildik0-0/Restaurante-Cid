import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../data/firebase'
import Carousel from '../../components/Carousel/carousel'
import './event.css'

type EventItem = {
    id_event?: number
    title: string
    genre: string
    location?: string
    date: string
    time: string
    price: string
    image: string
    description: string
}

function parseDate(value: string) {
    if (value.includes('-')) {
        const [year, month, day] = value.split('-').map(Number)
        if (!day || !month || !year) return null
        return new Date(year, month - 1, day)
    }

    const [day, month, year] = value.split('/').map(Number)
    if (!day || !month || !year) return null
    return new Date(year, month - 1, day)
}

function formatDate(value: string) {
    const parsed = parseDate(value)
    if (!parsed) return value

    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(parsed)
}

export default function Events() {
    const [events, setEvents] = useState<EventItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadEvents() {
            try {
                setLoading(true)
                setError('')
                const snapshot = await getDocs(collection(db, 'Event'))
                const loadedEvents = snapshot.docs
                    .map((document) => ({
                        ...(document.data() as EventItem),
                        id_event: Number(document.data().id_event ?? 0),
                    }))
                    .filter((event) => {
                        const eventDate = parseDate(event.date)
                        return eventDate ? eventDate >= new Date() : false
                    })
                    .sort((left, right) => Number(left.id_event ?? 0) - Number(right.id_event ?? 0))

                setEvents(loadedEvents)
            } catch (err: any) {
                setError(err?.message || 'No se pudieron cargar los próximos eventos.')
            } finally {
                setLoading(false)
            }
        }

        loadEvents()
    }, [])

    const nextEvents = useMemo(() => events, [events])

    return (
        <section className="events">
            <div className="sectionMusicPartyEvents">
                <img className='sectionMusicPartyEvents_image' src="/Container-4.png" alt="Música en Directo" />

                <div className='sectionMusicPartyEvents_column1'>
                    <div className='sectionMusicPartyEvents_subtitle'>
                        <p style={{ color: 'var(--color-yellow-text)' }}>Agenda Musical</p>
                    </div>
                    <div className='sectionMusicPartyEvents_title'>
                        <h1 style={{ color: 'var(--color-bg)' }}>Conciertos</h1>
                    </div>
                    <div className='sectionMusicPartyEvents_content'>
                        <p className='italic-p' style={{ color: 'var(--color-bg)' }}>Los mejores grupos y artistas del panorama nacional e internacional, junto al Mediterráneo. Verano 2026 en El CiD.</p>
                    </div>
                </div>
            </div>

            <div className="sectionDestacadosEnvent">
                <div className="sectionDestacadosEnvent_column1">
                    <div className="sectionDestacadosEnvent_subtitle">
                        <p>Destacados</p>
                    </div>
                    <div className="sectionDestacadosEnvent_title">
                        <h1 style={{ color: 'var(--color-bg)' }}>Los Mejores Conciertos del Verano</h1>
                    </div>

                    <div className="sectionDestacadosEnvent_Carusel">
                        <Carousel slides={['/imageSwiper.jpg', '/imageSwiper.jpg', '/imageSwiper.jpg']} />
                    </div>
                </div>
            </div>

            <div className="sectionNextEvents">
                <div className="sectionNextEvents_column1">
                    <div className="sectionNextEvents_subtitle">
                        <h4>Próximos Eventos</h4>
                    </div>

                    {loading && (
                        <div className="sectionNextEvents_empty">Cargando próximos eventos...</div>
                    )}

                    {error && !loading && (
                        <div className="sectionNextEvents_empty">{error}</div>
                    )}

                    {!loading && !error && nextEvents.length === 0 && (
                        <div className="sectionNextEvents_empty">Todavía no hay conciertos próximos publicados.</div>
                    )}

                    <div className="sectionNextEvents_grid">
                        {nextEvents.map((event) => (
                            <article key={`${event.id_event ?? event.title}-${event.date}`} className="sectionNextEvents_card">
                                <img className="sectionNextEvents_cardImage" src={event.image} alt={event.title} />
                                <div className="sectionNextEvents_cardContent">
                                    <p className="sectionNextEvents_cardGenre">{event.genre}</p>
                                    <p className="sectionNextEvents_cardDate"> 🗓️ {formatDate(event.date)}</p>
                                    <h3 className="sectionNextEvents_cardTitle">{event.title}</h3>
                                    <p className="sectionNextEvents_cardDescription">{event.description}</p>
                                    <div className="sectionNextEvents_cardMeta">
                                        <span>📍 {event.location || 'El CiD'}</span>
                                        <span>🕒 {event.time}</span>
                                    </div>
                                    <p className="sectionNextEvents_cardPrice">{event.price}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>

             <div className='sectionSubscribeInformation'>
                <div className='sectionSubscribeInformation_columna1'>
                    <div className='sectionSubscribeInformation_subTitle'>
                        <p style={{color: 'var(--color-primary)'}}>Newsletter</p>
                    </div>
                    <h1 className='sectionSubscribeInformation_title'>
                        No te pierdas ningún concierto
                    </h1>
                    <div className='sectionSubscribeInformation_content'>
                        <p>Síguenos en redes sociales o escríbenos para recibir la agenda en tu correo.</p>
                    </div>
                    <div className='sectionSubscribeInformation_button'>
                        <input type="email" placeholder="Tu correo electrónico" className='sectionSubscribeInformation_input' />
                        <a href="#" className='sectionSubscribeInformation_button--primary'>Suscribirse</a>
                    </div>
                </div>
            </div>


        </section>
    )
}