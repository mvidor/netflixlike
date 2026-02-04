import { useState } from 'react'

function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="transition-colors hover:text-gray-300"
        aria-label="Ouvrir la recherche"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-10 top-1/2 w-72 -translate-y-1/2">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher un film..."
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white outline-none focus:border-primary"
            autoFocus
          />
        </div>
      )}
    </div>
  )
}

export default SearchBar
