import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { moviesAPI } from '../../services/api'
import { getPosterSources, handleImageFallback } from '../../utils/movieImages'

function SearchBar({ movies = [], onSearch }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    const loadSuggestions = async () => {
      const term = searchTerm.trim()

      if (term.length === 0) {
        setSuggestions([])
        setIsOpen(false)
        onSearch?.('')
        return
      }

      if (term.length < 2) {
        setSuggestions([])
        return
      }

      const normalizedTerm = term.toLowerCase()
      const localMatches = movies
        .filter((movie) => {
          const title = movie.title?.toLowerCase() || ''
          const description = movie.description?.toLowerCase() || ''
          return title.includes(normalizedTerm) || description.includes(normalizedTerm)
        })
        .slice(0, 5)

      if (localMatches.length > 0) {
        setSuggestions(localMatches)
        setIsOpen(true)
        return
      }

      try {
        const response = await moviesAPI.search({ search: term, limit: 5 })
        setSuggestions(response.data || [])
        setIsOpen((response.data || []).length > 0)
      } catch {
        setSuggestions([])
        setIsOpen(false)
      }
    }

    const timeoutId = setTimeout(loadSuggestions, 250)
    return () => clearTimeout(timeoutId)
  }, [movies, onSearch, searchTerm])

  const handleSelect = (movie) => {
    setSearchTerm(movie.title)
    setIsOpen(false)

    if (onSearch) {
      onSearch(movie)
      return
    }

    navigate(`/movie/${movie._id}`)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const term = searchTerm.trim()
    if (!term) {
      onSearch?.('')
      return
    }

    if (suggestions.length > 0) {
      handleSelect(suggestions[0])
      return
    }

    onSearch?.(term)
  }

  return (
    <div className="relative w-full max-w-md">
      <form className="relative" onSubmit={handleSubmit}>
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
          className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400"
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
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
          {suggestions.map((movie) => (
            <button
              key={movie._id}
              type="button"
              onClick={() => handleSelect(movie)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-800"
            >
              <img
                src={getPosterSources(movie)[0]}
                alt={movie.title}
                className="h-12 w-8 rounded object-cover"
                onError={(event) => handleImageFallback(event, getPosterSources(movie))}
              />
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
