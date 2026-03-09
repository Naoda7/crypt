import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
        setOpenDropdown(null)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  const toggleMenu = () => setIsOpen(!isOpen)
  
  const toggleDropdown = (dropdown: string) => {
    if (window.innerWidth <= 768) {
      setOpenDropdown(openDropdown === dropdown ? null : dropdown)
    }
  }

  const handleMouseEnter = (dropdown: string) => {
    if (window.innerWidth > 768) setOpenDropdown(dropdown)
  }

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) setOpenDropdown(null)
  }

  const isCryptoActive = () => ['/hash', '/hmac', '/bcrypt'].includes(location.pathname)
  const isUtilsActive = () => ['/cyrillic', '/qrcode', '/tools'].includes(location.pathname)

  const closeAll = () => {
    setIsOpen(false)
    setOpenDropdown(null)
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="flex items-center gap-3">
          <div className="logo w-8 h-8 bg-primary rounded-lg animate-pulse" />
          <h1 className="text-xl font-semibold tracking-tighter" style={{ fontWeight: 900, fontStyle: 'italic' }}>CRYPTZ</h1>
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          <NavLink
            to="/"
            onClick={closeAll}
            className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}
          >
            ENCRYPT & DECRYPT
          </NavLink>

          <div 
            className="dropdown-container"
            onMouseEnter={() => handleMouseEnter('crypto')}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              className={`dropdown-btn ${isCryptoActive() ? 'parent-active' : ''} ${openDropdown === 'crypto' ? 'open' : ''}`}
              onClick={() => toggleDropdown('crypto')}
            >
              <span>CRYPTOGRAPHY</span>
              <ChevronDown className={`dropdown-icon ${openDropdown === 'crypto' ? 'rotated' : ''}`} size={16} />
            </button>
            <div className={`dropdown-menu ${openDropdown === 'crypto' ? 'show' : ''}`}>
              {['HASH', 'HMAC', 'BCRYPT'].map((item) => (
                <NavLink 
                  key={item}
                  to={`/${item.toLowerCase()}`} 
                  onClick={closeAll}
                  className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                >
                  {item}
                </NavLink>
              ))}
            </div>
          </div>

          <div 
            className="dropdown-container"
            onMouseEnter={() => handleMouseEnter('utils')}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              className={`dropdown-btn ${isUtilsActive() ? 'parent-active' : ''} ${openDropdown === 'utils' ? 'open' : ''}`}
              onClick={() => toggleDropdown('utils')}
            >
              <span>UTILITIES</span>
              <ChevronDown className={`dropdown-icon ${openDropdown === 'utils' ? 'rotated' : ''}`} size={16} />
            </button>
            <div className={`dropdown-menu ${openDropdown === 'utils' ? 'show' : ''}`}>
              <NavLink to="/cyrillic" onClick={closeAll} className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}>CYRILLIC</NavLink>
              <NavLink to="/qrcode" onClick={closeAll} className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}>QR CODE</NavLink>
              <NavLink to="/tools" onClick={closeAll} className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}>TOOLS</NavLink>
            </div>
          </div>
        </div>
      </div>

      {isOpen && <div className="mobile-menu-overlay" onClick={closeAll} />}

      <style>{`
        .nav-link-modern {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 0;
          transition: all 0.2s ease;
        }

        .nav-link-modern:hover, .nav-link-modern.active {
          color: var(--primary);
        }

        .nav-link-modern.active {
          font-weight: 600;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
        }

        .dropdown-container {
          position: relative;
        }

        .dropdown-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          transition: all 0.2s ease;
        }

        .dropdown-btn:hover, .dropdown-btn.parent-active {
          color: var(--primary);
        }

        .dropdown-icon {
          transition: transform 0.2s ease;
          opacity: 0.7;
        }

        .dropdown-icon.rotated {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          min-width: 180px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0.6rem;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          z-index: 1200;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .dropdown-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(5px);
        }

        .dropdown-item {
          display: block;
          padding: 0.75rem 1.2rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          border-radius: 8px;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--primary);
        }

        .dropdown-item.active {
          background: rgba(255, 255, 255, 0.08);
          color: var(--primary);
          font-weight: 500;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          z-index: 1040;
        }

        @media (min-width: 769px) {
          .nav-links {
            display: flex;
            gap: 2rem;
            align-items: center;
          }
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: var(--surface);
            padding: 1rem;
            gap: 1rem;
          }

          .nav-links.open { display: flex; }

          .dropdown-menu {
            position: static;
            transform: none;
            opacity: 1;
            visibility: visible;
            display: none;
            width: 100%;
            box-shadow: none;
            margin-top: 0.5rem;
            gap: 8px;
          }

          .dropdown-menu.show { display: flex; }
          
          .dropdown-btn, .nav-link-modern, .dropdown-item {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar