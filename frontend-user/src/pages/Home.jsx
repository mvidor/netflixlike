import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import MovieHero from '../components/movies/MovieHero'
import MovieCarousel from '../components/movies/MovieCarousel'
import MovieList from '../components/movies/MovieList'
import MovieFilter from '../components/movies/MovieFilter'
import { useCart } from '../context/useCart'
import { useAuth } from '../context/useAuth'
import { moviesAPI } from '../services/api'

function Home() {
  const navigate = useNavigate()
  const { addToCart, rentMovie } = useCart()
  const { isAuthenticated } = useAuth()
  const [movies, setMovies] = useState([])
  const [filteredMovies, setFilteredMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const response = await moviesAPI.getAll({ limit: 50, sortBy: 'rating', order: 'desc' })
        setMovies(response.data || [])
        setFilteredMovies(response.data || [])
      } finally {
        setLoading(false)
      }
    }

    loadMovies()
  }, [])

  const featuredMovie = movies[0] || null
  const popularMovies = useMemo(() => movies.slice(0, 6), [movies])
  const actionMovies = useMemo(
    () => movies.filter((movie) => movie.genres?.includes('Action')).slice(0, 6),
    [movies]
  )
  const recentMovies = useMemo(() => movies.filter((movie) => movie.year >= 2020).slice(0, 6), [movies])

  const handleSearch = (movie) => {
    navigate(`/movie/${movie._id}`)
  }

  const redirectToLogin = (movieId) => {
    navigate('/login', { state: { from: { pathname: `/movie/${movieId}` } } })
  }

  const handleRent = async (movie) => {
    const movieId = movie._id || movie.id

    if (!isAuthenticated()) {
      redirectToLogin(movieId)
      return
    }

    await rentMovie(movie)
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
        {featuredMovie ? (
          <MovieHero
            movie={featuredMovie}
            onRent={() => handleRent(featuredMovie)}
            onMoreInfo={() => navigate(`/movie/${featuredMovie._id}`)}
          />
        ) : null}

        <MovieFilter movies={movies} onFilter={setFilteredMovies} />

        {loading ? (
          <div className="px-4 py-12 text-center text-gray-400">Chargement des films...</div>
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

        {!loading && filteredMovies.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400">Aucun film disponible</div>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}

export default Home
