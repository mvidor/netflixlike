import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../common/Button'
import MovieHero from './MovieHero'
import { moviesAPI, rentalsAPI } from '../../services/api'
import { useAuth } from '../../context/useAuth'

function MovieHeroCarousel({ onRent }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [movies, setMovies] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadHeroMovies = async () => {
      setLoading(true)

      try {
        let response

        if (isAuthenticated()) {
          try {
            response = await rentalsAPI.getRecommendations(10)
          } catch {
            response = await moviesAPI.getRandom(5)
          }
        } else {
          response = await moviesAPI.getRandom(5)
        }

        const nextMovies = response.data || []
        setMovies(nextMovies)
        setActiveIndex(0)
        setErrorMessage('')
      } catch {
        setMovies([])
        setErrorMessage('Impossible de charger les films mis en avant pour le moment.')
      } finally {
        setLoading(false)
      }
    }

    loadHeroMovies()
  }, [isAuthenticated])

  useEffect(() => {
    if (movies.length <= 1) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % movies.length)
    }, 6000)

    return () => window.clearInterval(intervalId)
  }, [movies])

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center text-gray-400">Chargement des recommandations...</div>
  }

  if (errorMessage) {
    return (
      <div className="mx-4 rounded-lg border border-red-700 bg-red-950/40 px-6 py-5 text-red-200">
        {errorMessage}
      </div>
    )
  }

  if (movies.length === 0) {
    return null
  }

  const activeMovie = movies[activeIndex]

  return (
    <section className="relative">
      <MovieHero
        movie={activeMovie}
        onRent={() => onRent(activeMovie)}
        onMoreInfo={() => navigate(`/movie/${activeMovie._id}`)}
      />

      {movies.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setActiveIndex((current) => (current - 1 + movies.length) % movies.length)}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-2xl text-white transition hover:bg-black/80"
            aria-label="Film precedent"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((current) => (current + 1) % movies.length)}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-2xl text-white transition hover:bg-black/80"
            aria-label="Film suivant"
          >
            ›
          </button>

          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {movies.map((movie, index) => (
              <button
                key={movie._id || movie.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-3 w-3 rounded-full transition ${
                  index === activeIndex ? 'bg-primary' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Afficher ${movie.title}`}
              />
            ))}
          </div>

          <div className="absolute bottom-8 right-4 z-10 hidden md:block">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveIndex((current) => (current + 1) % movies.length)}
            >
              Suivant
            </Button>
          </div>
        </>
      ) : null}
    </section>
  )
}

export default MovieHeroCarousel
