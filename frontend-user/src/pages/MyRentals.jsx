import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { allMovies } from '../data/movies'
import { useCart } from '../context/CartContext'

const MyRentals = () => {
  const { rentals } = useCart()

  const now = new Date()
  const activeRentals = rentals.filter((rental) => {
    const expiryDate = new Date(rental.expiryDate)
    return !Number.isNaN(expiryDate.getTime()) && expiryDate >= now
  })

  const expiredRentals = rentals.filter((rental) => {
    const expiryDate = new Date(rental.expiryDate)
    return Number.isNaN(expiryDate.getTime()) || expiryDate < now
  })

  const getDaysLeft = (expiryDate) => {
    const date = new Date(expiryDate)
    if (Number.isNaN(date.getTime())) {
      return 0
    }

    return Math.max(0, Math.ceil((date - now) / (1000 * 60 * 60 * 24)))
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Header movies={allMovies} onSearch={() => {}} />

      <main className="container mx-auto px-4 py-24">
        <h1 className="mb-8 text-4xl font-bold">Mes locations</h1>

        {activeRentals.length > 0 ? (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-bold text-green-400">Actives ({activeRentals.length})</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {activeRentals.map((rental) => (
                <article key={rental.id} className="group relative">
                  <Link to={`/movie/${rental.movieId}`}>
                    <img
                      src={rental.poster}
                      alt={rental.title}
                      className="w-full rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="mt-2">
                      <h3 className="truncate font-semibold">{rental.title}</h3>
                      <p className="text-sm text-green-400">Expire dans {getDaysLeft(rental.expiryDate)} jour(s)</p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {expiredRentals.length > 0 ? (
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-400">Expirees ({expiredRentals.length})</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {expiredRentals.map((rental) => (
                <article key={rental.id} className="opacity-50">
                  <img
                    src={rental.poster}
                    alt={rental.title}
                    className="w-full rounded-lg grayscale"
                  />
                  <div className="mt-2">
                    <h3 className="truncate font-semibold">{rental.title}</h3>
                    <p className="text-sm text-red-400">Expire</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {rentals.length === 0 ? (
          <div className="py-20 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h18M3 16h18M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"
              />
            </svg>
            <p className="mb-6 mt-6 text-2xl text-gray-400">Aucune location pour le moment</p>
            <Link to="/">
              <button className="bg-primary hover:bg-primary-dark rounded-lg px-6 py-3 font-semibold transition">
                Decouvrir des films
              </button>
            </Link>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}

export default MyRentals
