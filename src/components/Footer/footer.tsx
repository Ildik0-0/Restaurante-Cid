import './footer.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faFacebookF } from '@fortawesome/free-brands-svg-icons'

export default function Footer() {
    return (
        <footer className="sectionFooterInformation">
            <div className='sectionFooterInformation_columna1'>
                <img className='footerImg-column1' src="/Link.png" alt="Footer Image" />
                <p>
                    Tu chiringuito de referencia en Mojácar Playa.
                    Comidas, paellas, buena música y la mejor cerveza fría.
                </p>
            </div>

            <div className='sectionFooterInformation_columna2'>
                <div className='sectionFooterInformation_subTitle1'>
                    <p>Horarios</p>
                </div>
                <div className='sectionFooterInformation_content1'>
                    <p>Lunes — Jueves: 10:00 – 24:00</p>
                </div>
                <div className='sectionFooterInformation_subTitle2'>
                    <p>Viernes — Sábado: 10:00 – 02:00</p>
                </div>
                <div className='sectionFooterInformation_content2'>
                    <p>Domingo: 10:00 – 24:00</p>
                </div>
                <div className='sectionFooterInformation_content3'>
                    <p style={{ color: 'var(--color-yellow-text)' }}>Abierto todo el año</p>
                </div>
            </div>

            <div className='sectionFooterInformation_columna3'>
                <div className='sectionFooterInformation_subTitle3'>
                    <p>Contacto</p>
                </div>
                <div className='sectionFooterInformation_content3'>
                    <div className='sectionFooterInformation_content3_location'>
                        <img className='icon' src="/location.png" alt="Icon" />
                        <p>Paseo del Mediterráneo s/n, Mojácar Playa, Almería</p>
                    </div>

                    <div className='sectionFooterInformation_content3_phone'>
                        <img className='icon' src="/phone.png" alt="Icon" />
                        <p> +34 950 000 000</p>
                    </div>
                    <div className='sectionFooterInformation_content3_emojis' aria-label="Redes sociales">
                        <a href="#" aria-label="Instagram" className='social-link'>
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>
                        <a href="#" aria-label="Facebook" className='social-link'>
                            <FontAwesomeIcon icon={faFacebookF} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
