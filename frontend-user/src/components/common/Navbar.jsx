import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import CartButton from './CartButton'
import SearchBar from '../movies/SearchBar'
import { useAuth } from '../../context/useAuth'

function Navbar({ movies, onSearch }) {
  const [isScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
    navigate('/login')
  }

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-primary text-3xl font-bold tracking-tight">
              NETFLIX
            </Link>

            <ul className="hidden space-x-6 md:flex">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? 'text-primary font-bold' : 'transition-colors hover:text-gray-300'
                  }
                >
                  Accueil
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/my-rentals"
                  className={({ isActive }) =>
                    isActive ? 'text-primary font-bold' : 'transition-colors hover:text-gray-300'
                  }
                >
                  Mes locations
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="flex items-center space-x-4">
            <SearchBar movies={movies} onSearch={onSearch} />
            <CartButton />
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((current) => !current)}
                  className="flex items-center space-x-2"
                  type="button"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-primary transition"
                  />
                  <span className="hidden text-sm md:block">{user.name}</span>
                </button>

                {showUserMenu ? (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-800 bg-black/95 py-2 shadow-xl backdrop-blur-lg">
                    <div className="border-b border-gray-800 px-4 py-2 text-sm text-gray-300">
                      {user.email}
                    </div>
                    <NavLink
                      to="/profile"
                      className="block px-4 py-2 transition hover:bg-gray-800"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Mon profil
                    </NavLink>
                    <NavLink
                      to="/my-rentals"
                      className="block px-4 py-2 transition hover:bg-gray-800"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Mes locations
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-400 transition hover:bg-gray-800"
                      type="button"
                    >
                      Deconnexion
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary hover:bg-primary-dark rounded px-3 py-1 text-sm font-semibold transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
