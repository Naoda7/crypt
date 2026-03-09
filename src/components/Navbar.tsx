import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to ensure scroll is restored when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleMenu = () => setIsOpen(!isOpen)
  
  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  // Close menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  return (
    <nav className="navbar">
      <div className="navbar-content">

        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="logo w-8 h-8 bg-primary rounded-lg animate-pulse" />
          <h1 className="text-xl font-semibold tracking-tighter text-center" style={{ fontWeight: 900, fontStyle: 'italic' }}>CRYPTZ</h1>
        </div>

        {/* Hamburger Button (Mobile) */}
        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          {/* Single Menu - ENCRYPT & DECRYPT */}
          <NavLink
            to="/"
            onClick={() => {
              setIsOpen(false)
              setOpenDropdown(null)
            }}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            ENCRYPT & DECRYPT
          </NavLink>

          {/* Dropdown CRYPTOGRAPHY */}
          <div className="dropdown-container">
            <button 
              className={`dropdown-btn ${openDropdown === 'crypto' ? 'active' : ''}`}
              onClick={() => toggleDropdown('crypto')}
            >
              CRYPTOGRAPHY <span className="dropdown-arrow">▼</span>
            </button>
            <div className={`dropdown-content ${openDropdown === 'crypto' ? 'show' : ''}`}>
              <NavLink 
                to="/hash" 
                onClick={() => {
                  setIsOpen(false)
                  setOpenDropdown(null)
                }}
                className={({ isActive }) => 
                  `dropdown-link ${isActive ? 'active' : ''}`
                }
              >
                HASH
              </NavLink>
              <NavLink 
                to="/hmac" 
                onClick={() => {
                  setIsOpen(false)
                  setOpenDropdown(null)
                }}
                className={({ isActive }) => 
                  `dropdown-link ${isActive ? 'active' : ''}`
                }
              >
                HMAC
              </NavLink>
              <NavLink 
                to="/bcrypt" 
                onClick={() => {
                  setIsOpen(false)
                  setOpenDropdown(null)
                }}
                className={({ isActive }) => 
                  `dropdown-link ${isActive ? 'active' : ''}`
                }
              >
                BCRYPT
              </NavLink>
            </div>
          </div>

          {/* Dropdown UTILITIES */}
          <div className="dropdown-container">
            <button 
              className={`dropdown-btn ${openDropdown === 'utils' ? 'active' : ''}`}
              onClick={() => toggleDropdown('utils')}
            >
              UTILITIES <span className="dropdown-arrow">▼</span>
            </button>
            <div className={`dropdown-content ${openDropdown === 'utils' ? 'show' : ''}`}>
              <NavLink 
                to="/cyrillic" 
                onClick={() => {
                  setIsOpen(false)
                  setOpenDropdown(null)
                }}
                className={({ isActive }) => 
                  `dropdown-link ${isActive ? 'active' : ''}`
                }
              >
                CYRILLIC
              </NavLink>
              <NavLink 
                to="/qrcode" 
                onClick={() => {
                  setIsOpen(false)
                  setOpenDropdown(null)
                }}
                className={({ isActive }) => 
                  `dropdown-link ${isActive ? 'active' : ''}`
                }
              >
                QR CODE
              </NavLink>
              <NavLink 
                to="/tools" 
                onClick={() => {
                  setIsOpen(false)
                  setOpenDropdown(null)
                }}
                className={({ isActive }) => 
                  `dropdown-link ${isActive ? 'active' : ''}`
                }
              >
                TOOLS
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when mobile menu is open */}
      {isOpen && <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)} />}

      <style>{`
        .dropdown-container {
          position: relative;
          display: inline-block;
        }

        .dropdown-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          transition: all 0.2s ease;
          opacity: 0.8;
        }

        .dropdown-btn:hover {
          opacity: 1;
          color: white;
          transform: translateY(-1px);
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        }

        .dropdown-btn.active {
          color: var(--primary);
          opacity: 1;
        }

        .dropdown-arrow {
          font-size: 0.7rem;
          transition: transform 0.3s;
          opacity: 0.7;
        }

        .dropdown-btn:hover .dropdown-arrow {
          opacity: 1;
        }

        .dropdown-content {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          min-width: 160px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.5rem 0;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s;
          z-index: 1000;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }

        .dropdown-content.show {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(5px);
        }

        .dropdown-link {
          display: block;
          padding: 0.7rem 1.5rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.2s;
          white-space: nowrap;
          border-left: 3px solid transparent;
        }

        .dropdown-link:hover {
          background: var(--background);
          color: white;
          border-left: 3px solid var(--primary);
          padding-left: 1.8rem;
        }

        .dropdown-link.active {
          background: var(--background);
          color: var(--primary);
          border-left: 3px solid var(--primary);
          font-weight: 500;
        }

        /* Mobile menu overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(3px);
          z-index: 1040;
          display: none;
        }

        /* Desktop hover effect untuk dropdown container */
        @media (min-width: 769px) {
          .dropdown-container:hover .dropdown-content {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(5px);
          }
          
          .dropdown-container:hover .dropdown-arrow {
            transform: rotate(180deg);
            opacity: 1;
          }
          
          .dropdown-container:hover .dropdown-btn {
            color: var(--primary);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .mobile-menu-overlay {
            display: block;
          }

          .dropdown-container {
            width: 100%;
          }

          .dropdown-btn {
            width: 100%;
            justify-content: center;
            padding: 1rem;
            opacity: 1;
            background: var(--surface);
            border-radius: 6px;
          }

          .dropdown-btn:hover {
            background: var(--border);
            transform: none;
            text-shadow: none;
          }

          .dropdown-content {
            position: static;
            transform: none;
            opacity: 1;
            visibility: visible;
            display: none;
            width: 100%;
            margin-top: 0.5rem;
            border: 1px solid var(--border);
            background: var(--background);
            box-shadow: none;
          }

          .dropdown-content.show {
            display: block;
            transform: none;
          }

          .dropdown-link {
            text-align: center;
            padding: 1rem;
            border-bottom: 1px solid var(--border);
            border-left: none;
          }

          .dropdown-link:hover {
            background: var(--surface);
            border-left: none;
            padding-left: 1rem;
          }

          .dropdown-link:last-child {
            border-bottom: none;
          }

          .dropdown-link.active {
            border-left: none;
            background: var(--surface);
            border-bottom: 2px solid var(--primary);
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar