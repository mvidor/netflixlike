import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { moviesAPI } from '../../services/api'

function SearchBar({ onSearch }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    const loadSuggestions = async () => {
      const term = searchTerm.trim()

      if (term.length < 2) {
        setSuggestions([])
        return
      }

      try {
        const response = await moviesAPI.search({ search: term, limit: 5 })
        setSuggestions(response.data || [])
        setIsOpen(true)
      } catch {
        setSuggestions([])
      }
    }

    const timeoutId = setTimeout(loadSuggestions, 250)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleSelect = (movie) => {
    setSearchTerm(movie.title)
    setIsOpen(false)

    if (onSearch) {
      onSearch(movie)
      return
    }

    navigate(`/movie/${movie._id}`)
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          placeholder="Rechercher un film..."
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 pl-10 text-white outline-none focus:border-primary"
        />
        <svg
          className="absolute left-3 top-3 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
          {suggestions.map((movie) => (
            <button
              key={movie._id}
              type="button"
              onClick={() => handleSelect(movie)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-800"
            >
              <img src={movie.poster} alt={movie.title} className="h-12 w-8 rounded object-cover" />
              <div>
                <div className="text-sm font-semibold text-white">{movie.title}</div>
                <div className="text-xs text-gray-400">
                  {movie.year} • {movie.genre}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
