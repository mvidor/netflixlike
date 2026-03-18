import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Button from '../components/common/Button'
import Breadcrumb from '../components/common/Breadcrumb'
import { allMovies } from '../data/movies'
import { useAuth } from '../context/AuthProvider'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'

const MovieDetail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { addToCart, rentMovie, isRented, isInCart, getRentalByMovieId } = useCart()
  const { success, error, info } = useNotification()

  const movie = useMemo(() => allMovies.find((item) => item.id === Number(id)), [id])

  const handleRent = () => {
    if (!isAuthenticated()) {
      info('Connectez-vous pour louer ce film.')
      navigate('/login', { state: { from: location } })
      return
    }

    const result = rentMovie(movie)
    if (!result.success) {
      error(result.error || 'Location impossible.')
      return
    }

    success('Film loue avec succes.')

    setTimeout(() => {
      navigate('/my-rentals')
    }, 2000)
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

  const rented = isRented(movie.id)
  const inCart = isInCart(movie.id)
  const rental = getRentalByMovieId(movie.id)

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Header movies={allMovies} onSearch={() => {}} />
      <main className="pt-16">
        <section className="relative min-h-[65vh]">
          <img src={movie.backdrop} alt={movie.title} className="absolute inset-0 h-full w-full object-cover" />
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

        <section className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-[220px_1fr]">
          <img src={movie.poster} alt={`Poster ${movie.title}`} className="w-full max-w-[220px] rounded-lg object-cover" />
          <div>
            <h2 className="text-2xl font-bold">Informations</h2>
            <p className="mt-3 text-gray-300">Prix de location: {movie.price} EUR</p>
            {rented ? (
              <div className="mt-6 inline-flex rounded bg-green-700 px-4 py-2 text-sm font-semibold text-white">
                Film loue jusqu'au {new Date(rental?.expiryDate || '').toLocaleDateString('fr-FR')}
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default MovieDetail
