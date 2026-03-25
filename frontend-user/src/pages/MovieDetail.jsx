import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Button from '../components/common/Button'
import Breadcrumb from '../components/common/Breadcrumb'
import MovieList from '../components/movies/MovieList'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'
import { useNotification } from '../context/useNotification'
import { moviesAPI } from '../services/api'
import { getBackdropSources, getPosterSources, handleImageFallback } from '../utils/movieImages'

const MovieDetail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { addToCart, rentMovie, isRented, isInCart, getRentalByMovieId } = useCart()
  const { success, error, info } = useNotification()
  const [movie, setMovie] = useState(null)
  const [similarMovies, setSimilarMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const [movieResponse, similarResponse] = await Promise.all([
          moviesAPI.getById(id),
          moviesAPI.getSimilar(id)
        ])

        setMovie(movieResponse.data)
        setSimilarMovies(similarResponse.data || [])
      } catch {
        setMovie(null)
        setSimilarMovies([])
      } finally {
        setLoading(false)
      }
    }

    loadMovie()
  }, [id])

  const handleRent = async () => {
    if (!isAuthenticated()) {
      info('Connectez-vous pour louer ce film.')
      navigate('/login', { state: { from: location } })
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

  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      info('Connectez-vous pour utiliser le panier.')
      navigate('/login', { state: { from: location } })
      return
    }

    const added = addToCart(movie)
    if (!added) {
      error('Film deja present dans le panier ou deja loue.')
      return
    }

    success('Film ajoute au panier.')
  }

  if (loading) {
    return <div className="min-h-screen bg-netflix-black px-4 py-24 text-white">Chargement...</div>
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-netflix-black px-4 text-white">
        <h1 className="text-3xl font-bold">Film introuvable</h1>
        <p className="mt-2 text-gray-400">Le film que vous recherchez n'existe pas.</p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Retour a l'accueil
        </Button>
      </div>
    )
  }

  const rented = isRented(movie._id)
  const inCart = isInCart(movie._id)
  const rental = getRentalByMovieId(movie._id)
  const backdropSources = getBackdropSources(movie)
  const posterSources = getPosterSources(movie)

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Header onSearch={() => {}} />
      <main className="pt-16">
        <section className="relative" style={{ minHeight: '65vh' }}>
          <img
            src={backdropSources[0]}
            alt={movie.title}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => handleImageFallback(event, backdropSources)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/40" />
          <div className="relative container mx-auto px-4 py-16">
            <Breadcrumb
              items={[
                { label: 'Films', path: '/' },
                { label: movie.genre, path: `/?genre=${encodeURIComponent(movie.genre)}` },
                { label: movie.title }
              ]}
            />
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Retour
            </Button>
            <h1 className="mt-8 text-4xl font-bold md:text-6xl">{movie.title}</h1>
            <p className="mt-4 max-w-2xl text-gray-300">{movie.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-200">
              <span className="rounded bg-primary px-3 py-1 font-semibold">{movie.rating}/10</span>
              <span>{movie.year}</span>
              <span>{movie.duration} min</span>
              <span>{movie.genre}</span>
            </div>
          </div>
        </section>

        <section className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-[260px_1fr]">
          <img
            src={posterSources[0]}
            alt={`Poster ${movie.title}`}
            className="w-full rounded-lg object-cover"
            style={{ maxWidth: '260px' }}
            onError={(event) => handleImageFallback(event, posterSources)}
          />
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Synopsis</h2>
              <p className="mt-3 text-gray-300">{movie.description}</p>
            </div>

            {rented ? (
              <div className="inline-flex rounded bg-green-700 px-4 py-2 text-sm font-semibold text-white">
                Film loue jusqu'au {new Date(rental?.expiryDate || '').toLocaleDateString('fr-FR')}
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="sm:flex-1" onClick={handleRent}>
                  Louer maintenant - {movie.price} EUR
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="sm:flex-1"
                  disabled={inCart}
                  onClick={handleAddToCart}
                >
                  {inCart ? 'Dans le panier' : '+ Ajouter au panier'}
                </Button>
              </div>
            )}

            <div className="rounded-lg border border-gray-800 bg-slate-900/70 p-5">
              <h3 className="mb-4 text-xl font-bold">Informations</h3>
              <div className="grid gap-3 text-sm text-gray-300">
                <div>Genre: {movie.genre}</div>
                <div>Annee: {movie.year}</div>
                <div>Duree: {movie.duration} min</div>
                <div>Note: {movie.rating}/10</div>
                <div>Prix: {movie.price} EUR</div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-10">
          <MovieList title="Films similaires" movies={similarMovies} onRent={async (item) => rentMovie(item)} onAddToCart={addToCart} />
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default MovieDetail
