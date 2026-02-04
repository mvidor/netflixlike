import { useState } from 'react'
import SearchBar from './SearchBar'

function Navbar() {
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
            <h1 className="text-primary text-3xl font-bold tracking-tight">NETFLIX</h1>

            <ul className="hidden space-x-6 md:flex">
              <li>
                <a href="#" className="transition-colors hover:text-gray-300">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-gray-300">
                  Films
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-gray-300">
                  Mes locations
                </a>
              </li>
            </ul>
          </div>

          <div className="flex items-center space-x-4">
            <SearchBar />
            <div className="bg-primary hover:bg-primary-dark flex h-8 w-8 cursor-pointer items-center justify-center rounded transition-colors">
              <span className="text-sm font-bold">U</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
