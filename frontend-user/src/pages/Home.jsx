import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import MovieHero from '../components/movies/MovieHero'
import MovieCarousel from '../components/movies/MovieCarousel'
import MovieList from '../components/movies/MovieList'
import MovieFilter from '../components/movies/MovieFilter'
import { allMovies } from '../data/movies'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthProvider'

function pickRandomMovies(items, count) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count)
}

function Home() {
  const navigate = useNavigate()
  const { addToCart, rentMovie } = useCart()
  const { isAuthenticated } = useAuth()
  const [allMoviesState] = useState(allMovies)
  const [filteredMovies, setFilteredMovies] = useState(allMovies)

  const featuredMovie = allMovies[0]
  const popularMovies = pickRandomMovies(allMovies, 5)
  const actionMovies = allMovies.filter((movie) => movie.genre === 'Action').slice(0, 5)
  const recentMovies = allMovies.filter((movie) => movie.year > 2010).slice(0, 5)

  const handleSearch = (movie) => {
    navigate(`/movie/${movie.id}`, { state: { from: 'home-search' } })
  }

  const redirectToLogin = (movieId) => {
    navigate('/login', { state: { from: { pathname: `/movie/${movieId}` } } })
  }

  const handleRent = (movie) => {
    if (!isAuthenticated()) {
      redirectToLogin(movie.id)
      return
    }

    rentMovie(movie)
  }

  const handleAddToCart = (movie) => {
    if (!isAuthenticated()) {
      redirectToLogin(movie.id)
      return
    }

    addToCart(movie)
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Header movies={allMoviesState} onSearch={handleSearch} />
      <main className="pb-8 pt-16">
        <MovieHero
          movie={featuredMovie}
          onMoreInfo={() => navigate(`/movie/${featuredMovie.id}`, { state: { from: 'home-hero' } })}
        />
        <MovieFilter movies={allMoviesState} onFilter={setFilteredMovies} />
        <MovieList
          title="Films disponibles"
          movies={filteredMovies}
          onRent={handleRent}
          onAddToCart={handleAddToCart}
        />
        <MovieCarousel title="Films populaires" movies={popularMovies} />
        <MovieCarousel title="Selection Action" movies={actionMovies} />
        <MovieCarousel title="Films recents" movies={recentMovies} />
      </main>
      <Footer />
    </div>
  )
}

export default Home
