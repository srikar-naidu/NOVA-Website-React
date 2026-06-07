import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar: React.FC = (): React.JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Helper function to check if link is active
  const isActiveLink = (path: string): boolean => {
    return location.pathname === path
  }

  return (
    <nav className="navbar" style={{ background: '#0a0a0f' }}>
      <div className="logo">
        <img src="/images/hero/NOVA LOGo.jpg" alt="NOVA Logo" className="logo-image" />
        <div className="logo-text">
          <h1>NOVA</h1>
          <span className="tagline">Network of Visionary Aspirants</span>
        </div>
      </div>

      <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <ul>
          <li>
            <Link
              to="/"
              className={isActiveLink('/') ? 'active' : ''}
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/ideasprint"
              className={isActiveLink('/ideasprint') ? 'active' : ''}
              onClick={closeMenu}
            >
              Ideasprint
            </Link>
          </li>
          <li>
            <Link
              to="/sprints"
              className={isActiveLink('/sprints') ? 'active' : ''}
              onClick={closeMenu}
            >
              Sprints
            </Link>
          </li>
          <li>
            <Link
              to="/teamfinder"
              className={isActiveLink('/teamfinder') ? 'active' : ''}
              onClick={closeMenu}
            >
              Find Squad
            </Link>
          </li>
          <li>
            <Link
              to="/register"
              className={`register-btn ${isActiveLink('/register') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Join us
            </Link>
          </li>
        </ul>
      </div>

      <div className="hamburger" onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </nav>
  )
}

export default Navbar
