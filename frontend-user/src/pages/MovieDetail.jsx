import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Button from '../components/common/Button'
import Breadcrumb from '../components/common/Breadcrumb'
import { allMovies } from '../data/movies'
import { getRentalsForCurrentUser, saveRentalsForCurrentUser } from '../utils/rentalsStorage'

const MovieDetail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const [notification, setNotification] = useState(null)

  const movie = useMemo(() => allMovies.find((item) => item.id === Number(id)), [id])

  const handleRent = () => {
    const user = localStorage.getItem('user')
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }

    const rental = {
      id: movie.id,
      movieId: movie.id,
      title: movie.title,
      poster: movie.poster,
      price: movie.price,
      rentalDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    const currentRentals = getRentalsForCurrentUser()

    const alreadyRented = currentRentals.some(
      (item) => item.movieId === movie.id || item.id === movie.id
    )

    if (alreadyRented) {
      setNotification({ type: 'error', message: 'Vous avez deja loue ce film.' })
      return
    }

    const nextRentals = [...currentRentals, rental]
    saveRentalsForCurrentUser(nextRentals)
    setNotification({ type: 'success', message: 'Film loue avec succes.' })

    setTimeout(() => {
      navigate('/my-rentals')
    }, 2000)
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

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      {notification ? (
        <div
          className={`fixed right-4 top-20 z-[70] rounded-lg px-6 py-3 shadow-xl ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {notification.message}
        </div>
      ) : null}
      <Header movies={allMovies} onSearch={() => {}} cartItems={[]} onRemoveFromCart={() => {}} />
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
            <Button size="lg" className="mt-6" onClick={handleRent}>
              Louer pour {movie.price} EUR
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default MovieDetail
