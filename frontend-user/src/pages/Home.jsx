import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import MovieHeroCarousel from '../components/movies/MovieHeroCarousel'
import MovieCarousel from '../components/movies/MovieCarousel'
import MovieList from '../components/movies/MovieList'
import MovieFilter from '../components/movies/MovieFilter'
import { useCart } from '../context/useCart'
import { useAuth } from '../context/useAuth'
import { useNotification } from '../context/useNotification'
import { moviesAPI } from '../services/api'

const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api'

function Home() {
  const navigate = useNavigate()
  const { addToCart, rentMovie } = useCart()
  const { isAuthenticated } = useAuth()
  const { success, error, info } = useNotification()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const response = await moviesAPI.getAll({ limit: 50, sortBy: 'rating', order: 'desc' })
        setMovies(response.data || [])
        setErrorMessage('')
      } catch {
        setMovies([])
        setErrorMessage(
          `Impossible de charger les films. Verifie que le backend tourne sur ${apiUrl}.`
        )
      } finally {
        setLoading(false)
      }
    }

    loadMovies()
  }, [])

  const popularMovies = useMemo(() => movies.slice(0, 6), [movies])
  const actionMovies = useMemo(
    () => movies.filter((movie) => movie.genres?.includes('Action')).slice(0, 6),
    [movies]
  )
  const recentMovies = useMemo(() => movies.filter((movie) => movie.year >= 2020).slice(0, 6), [movies])
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const movieGenres = Array.isArray(movie.genres) ? movie.genres : [movie.genre].filter(Boolean)
      const matchesGenre = selectedGenre === 'all' || movieGenres.includes(selectedGenre)

      if (!matchesGenre) {
        return false
      }

      const term = searchTerm.trim().toLowerCase()
      if (!term) {
        return true
      }

      const title = movie.title?.toLowerCase() || ''
      const description = movie.description?.toLowerCase() || ''
      return title.includes(term) || description.includes(term)
    })
  }, [movies, searchTerm, selectedGenre])

  const handleSearch = (value) => {
    if (typeof value === 'string') {
      setSearchTerm(value)
      return
    }

    navigate(`/movie/${value._id}`)
  }

  const redirectToLogin = (movieId) => {
    navigate('/login', { state: { from: { pathname: `/movie/${movieId}` } } })
  }

  const handleRent = async (movie) => {
    const movieId = movie._id || movie.id

    if (!isAuthenticated()) {
      info('Connectez-vous pour louer ce film.')
      redirectToLogin(movieId)
      return
    }

    const result = await rentMovie(movie)

    if (!result.success) {
      error(result.error || 'Location impossible.')
      return
    }

    success('Film loue avec succes.')
    navigate('/my-rentals')
  }

  const handleAddToCart = (movie) => {
    const movieId = movie._id || movie.id

    if (!isAuthenticated()) {
      redirectToLogin(movieId)
      return
    }

    addToCart(movie)
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Header movies={movies} onSearch={handleSearch} />
      <main className="pb-8 pt-16">
        <MovieHeroCarousel onRent={handleRent} />

        <MovieFilter
          movies={movies}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
        />

        {loading ? (
          <div className="px-4 py-12 text-center text-gray-400">Chargement des films...</div>
        ) : errorMessage ? (
          <div className="mx-4 rounded-lg border border-red-700 bg-red-950/40 px-6 py-5 text-red-200">
            {errorMessage}
          </div>
        ) : (
          <>
            <MovieList
              title="Films disponibles"
              movies={filteredMovies}
              onRent={handleRent}
              onAddToCart={handleAddToCart}
            />
            <MovieCarousel title="Films populaires" movies={popularMovies} />
            <MovieCarousel title="Selection Action" movies={actionMovies} />
            <MovieCarousel title="Films recents" movies={recentMovies} />
          </>
        )}

        {!loading && !errorMessage && filteredMovies.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400">Aucun film disponible</div>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}

export default Home
