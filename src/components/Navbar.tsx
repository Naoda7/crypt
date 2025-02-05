import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo dan Judul */}
        <div className="flex items-center gap-3">
        <div className="logo w-8 h-8 bg-primary rounded-lg animate-pulse" />
          <h1 className="text-xl font-semibold">CRYPTZ</h1>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            ENCRYPT
          </NavLink>
          
          <NavLink 
            to="/decrypt" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            DECRYPT
          </NavLink>
          
          <NavLink 
            to="/hash"
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            HASH
          </NavLink>
          
          <NavLink 
            to="/hmac"
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            HMAC
          </NavLink>
          
          <NavLink 
            to="/bcrypt"
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            BCRYPT
          </NavLink>
          
          <NavLink 
            to="/qrcode"
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            QR CODE
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar