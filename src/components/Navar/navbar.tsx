import { useState } from 'react'
import './navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="navbar__container">
        <img className="navbar__logo" src="/Link.png" alt="Navbar Logo" />

        <button
          className="navbar__toggle"
          type="button"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`navbar__menu ${menuOpen ? 'navbar__menu--open' : ''}`}>
          <a className="navbar__link "  style={{ color: 'black' }} href="#">INICIO</a>
          <a className="navbar__link" href="#">CONCIERTOS</a>
          <a className="navbar__link navbar__link--highlight" href="#">RESERVAS</a>
        </nav>
      </div>
    </header>
  )
}