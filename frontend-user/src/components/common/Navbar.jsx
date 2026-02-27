import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import CartButton from './CartButton'
import SearchBar from '../movies/SearchBar'

function Navbar({ movies, onSearch, cartItems, onRemoveFromCart }) {
  const [isScrolled] = useState(false)

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
            <CartButton items={cartItems} onRemove={onRemoveFromCart} />
            <Link
              to="/login"
              className="bg-primary hover:bg-primary-dark rounded px-3 py-1 text-sm font-semibold transition-colors"
            >
              Connexion
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
