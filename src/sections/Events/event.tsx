import './event.css'
import Carousel from '../../components/Carousel/carousel'

export default function Events() {
    return (
        <section className="events">
            <div className="sectionMusicPartyEvents">
                <img className='sectionMusicPartyEvents_image' src="/Container-4.png" alt="Música en Directo" />
                
                <div className='sectionMusicPartyEvents_column1'>
                <div className='sectionMusicPartyEvents_subtitle'>
                    <p style={{ color: 'var(--color-yellow-text)' }}>Agenda Musical</p>
                </div>
                    <div className='sectionMusicPartyEvents_title'>
                        < h1 style={{ color: 'var(--color-bg)' }}>Conciertos</h1>
                    </div>
                    <div className='sectionMusicPartyEvents_content'>
                        <p className='italic-p' style={{ color: 'var(--color-bg)' }}>Los mejores grupos y artistas del panorama nacional e internacional, junto al Mediterráneo. Verano 2026 en El CiD.</p>
                    </div>
                </div>
            </div>


            <div className="sectionDestacadosEnvent">

                <div className="sectionDestacadosEnvent_column1">
                    <div className="sectionDestacadosEnvent_subtitle">
                        <p>
                            Destacados
                        </p>
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
                        <h4>
                            Próximos Eventos
                        </h4>
                    </div>
                </div>
            </div>

        </section>
    )
}