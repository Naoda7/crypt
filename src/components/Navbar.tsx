import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const navItems = [
    { to: "/", label: "ENCRYPT & DECRYPT" },
    { to: "/hash", label: "HASH" },
    { to: "/hmac", label: "HMAC" },
    { to: "/bcrypt", label: "BCRYPT" },
    { to: "/qrcode", label: "QR CODE" },
    { to: "/tools", label: "TOOLS" },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-content">

        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="logo w-8 h-8 bg-primary rounded-lg animate-pulse" />
          <h1 className="text-xl font-semibold tracking-tighter">CRYPTZ</h1>
        </div>

        {/* Hamburger Button (Mobile) */}
        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          {navItems.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
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