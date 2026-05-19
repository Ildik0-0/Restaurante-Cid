
import './homepage.css'

export default function Homepage() {
    return (
        <section className="homepage">
            <div className='videoHero'>
                <video className='videoHero__video' autoPlay loop muted>
                    <source src="/GettyImages.mp4" type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                </video>
                <div className='videoHero__overlay'>
                    <p className='videoHero__text'>El CiD</p>
                </div>
                <div className='videoHero__overlay2'>
                    <p className='videoHero__text2'>la buena vida</p>
                </div>
                <div className='videoHero__overlay3'>
                    <a href="#" className='videoHero__button videoHero__button--primary'>Próximos Conciertos</a>
                    <a href="#" className='videoHero__button'>RESERVA</a>
                </div>
            </div>

            <div className='infoSection'>
                <p>
                    En la orilla del Mediterráneo, donde la arena cede paso al mar, nació El CiD. Un lugar donde el tiempo se detiene, la comida sabe a Almería y la música llena el alma. Bienvenido a la buena vida.
                </p>
            </div>
            <div className='infoSection2'>
                <ul className='infoSection2__list'>
                    <li className='infoSection2__item'>
                        <img className='infoSection2__icon' src="/Icon.png" alt="Terraza en la Playa" />
                        <span>Terraza en la Playa</span>
                    </li>
                    <li className='infoSection2__item'>
                        <img className='infoSection2__icon' src="/Icon-2.png" alt="Cocina Mediterránea" />
                        <span>Cocina Mediterránea</span>
                    </li>
                    <li className='infoSection2__item'>
                        <img className='infoSection2__icon' src="/Icon-3.png" alt="Cañero Siempre Frío" />
                        <span>Cañero Siempre Frío</span>
                    </li>
                    <li className='infoSection2__item'>
                        <img className='infoSection2__icon' src="/Icon-4.png" alt="Música en Directo" />
                        <span>Música en Directo</span>
                    </li>
                </ul>
            </div>

            <div className='sectionInformation'>
                <div className='sectionInformation_column1'>
                    <div className='sectionInformation_subTitle'>
                        <p>La Playa</p>
                    </div>
                    <h2 className='sectionInformation_title'>
                        <p>El Mediterráneo,</p>
                        <p className='italic-p'>a tus pies</p>
                    </h2>
                    <div className='sectionInformation_content'>
                        <p>Mojácar Playa es uno de los rincones más bellos de Andalucía. Agua cristalina, cielos despejados casi todo el año y una luz que convierte cada atardecer en una obra de arte. En El CiD tenemos la mejor terraza con vistas directas al mar.</p>

                        <p>Ven a disfrutar de la calma del Mediterráneo, con los pies en la arena y una bebida fría en la mano. Así es la buena vida.</p>
                    </div>
                </div>
                <div className='sectionInformation_column2'>
                    <div className='sectionInformation_image'>
                        <img src="/Container-2.png" alt="Vista de la Playa" />
                    </div>
                </div>
            </div>

        </section>
        
    )
}
