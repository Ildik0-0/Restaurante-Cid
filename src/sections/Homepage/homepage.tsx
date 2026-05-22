
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

            <div className='sectionCosinaInformation'>
                <div className='sectionCosinaInformation_columna1'>
                    <div className='sectionCosinaInformation_image'>
                        <img className='sectionCosinaInformation_image--primary' src="/cocina.png" alt="Plato de Comida" />
                        <img className='sectionCosinaInformation_image--secondary' src="/cocina2.png" alt="Plato de Comida" />
                    </div>
                </div>
                
                <div className='sectionCosinaInformation_columna2'>
                    <div className='sectionCosinaInformation_subTitle'>
                        <p>Nuestra Cocina</p>
                    </div>
                    <h1 className='sectionCosinaInformation_title'>
                        <p>Paellas que saben,</p>
                        <p className='italic-p'>a mar y sol</p>
                    </h1>
                    <div className='sectionCosinaInformation_content --font-basic'>
                        <p >En El CiD elaboramos nuestras paellas con productos frescos de la huerta almeriense y el mejor marisco de la costa. Cada arroz es una celebración de los sabores del Mediterráneo.</p>

                        <p>Las paellas se preparan al momento, con el cariño y la tradición que se merece un plato así. También ofrecemos una completa carta de tapas, pescados a la plancha y postres caseros.</p>
                    </div>
                    <div className='sectionCosinaInformation_button'>
                        <a href="#" className='sectionCosinaInformation_button--primary'>Reservar Mesa</a>
                    </div>
                </div>

            </div>

            <div className='sectionBeerInformation'>
              
                <div className='sectionBeerInformation_columna1'>
                    <div className='sectionBeerInformation_subTitle'>
                        <p style={{color: 'var(--color-primary)'}}>El Cañero</p>
                    </div>
                    <h1 className='sectionBeerInformation_title'>
                        <p style={{ color: 'var(--color-surface)' }}>La cerveza más fría,</p>
                        <p className='italic-p' style={{ color: 'var(--color-yellow-text)' }}>de Almería</p>
                    </h1>
                    <div className='sectionBeerInformation_content'>
                        <p>Nuestro sistema de cañero garantiza que cada cerveza llegue a tu mano a la temperatura perfecta recién salida del frío, con ese punto de escarcha que hace que el primer sorbo sea perfección pura.</p>

                        <p>Además de cerveza de grifo, disponemos de una amplia selección de vinos de la tierra, cócteles de temporada, refrescos y la mejor sangría de Mojácar.</p>
                    </div>
                    
                    <div className='sectionBeerInformation_subContent'>
                        <ul className='sectionBeerInformation_subContent_list'>
                            <li className='sectionBeerInformation_subContent_item'>
                                <p style={{ color: 'var(--color-yellow-text)' }}>4°</p>
                                <span style={{ color: 'var(--color-light-yellow-text)' }}>Temperatura Ideal</span>
                            </li>
                            <li className='sectionBeerInformation_subContent_item'>
                                <p style={{ color: 'var(--color-yellow-text)' }}>500ml</p>
                                <span style={{ color: 'var(--color-light-yellow-text)' }}>El cañero perfecto</span>
                            </li>
                            <li className='sectionBeerInformation_subContent_item'>
                                <p style={{ color: 'var(--color-yellow-text)' }}>∞</p>
                                <span style={{ color: 'var(--color-light-yellow-text)' }}>Cañeros disponibles</span>
                            </li>
                        </ul>

                    </div>

                </div>
                  <div className='sectionBeerInformation_columna2'>
                    <div className='sectionBeerInformation_image'>
                        <img src="/beer.png" alt="Cerveza Fría" />
                    </div>
                </div>

            </div>

            <div className='sectionMusicParty'>
                <div className='sectionMusicParty_columna1'>
                    <div className='sectionMusicParty_subTitle'>
                        <p style={{color: 'var(--color-primary)'}}>Música en Directo</p>
                    </div>
                    <h1 className='sectionMusicParty_title'>
                        <p style={{ color: 'var(--color-surface)' }}>Conciertos que hacen vibrar,</p>
                        <p className='italic-p' style={{ color: 'var(--color-yellow-text)' }}>tus noches en Mojácar</p>
                    </h1>
                    
                </div>
            </div>

        </section>
        
    )
}
