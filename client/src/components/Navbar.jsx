import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">🔍</span>
        <span className="brand-name">TruthLens</span>
        <span className="brand-tagline">AI Fact Checker</span>
      </Link>
      <div className="navbar-links">
        <Link to="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
          Verify
        </Link>
        <Link to="/history" className={`nav-link ${pathname === '/history' ? 'active' : ''}`}>
          History
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
