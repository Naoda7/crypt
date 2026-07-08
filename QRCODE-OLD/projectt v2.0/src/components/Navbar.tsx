import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo dan Judul */}
        <div className="flex items-center gap-3">
          <div className="logo w-8 h-8 bg-primary rounded-lg animate-pulse" />
          <h1 className="text-xl font-semibold">CRYPTZ</h1>
        </div>

        {/* Hamburger Button (Hanya muncul di Mobile) */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          {[
            { to: "/", label: "ENCRYPT" },
            { to: "/decrypt", label: "DECRYPT" },
            { to: "/hash", label: "HASH" },
            { to: "/hmac", label: "HMAC" },
            { to: "/bcrypt", label: "BCRYPT" },
            { to: "/qrcode", label: "QR CODE" },
            { to: "/tools", label: "TOOLS" },
          ].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)} // Tutup menu saat link diklik
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar