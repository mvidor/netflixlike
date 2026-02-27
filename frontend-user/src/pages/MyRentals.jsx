import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { allMovies } from '../data/movies'
import { getRentalsForCurrentUser } from '../utils/rentalsStorage'

const MyRentals = () => {
  const [rentals] = useState(() => getRentalsForCurrentUser())

  const formatDate = (dateString) => {
    if (!dateString) {
      return '-'
    }
    const date = new Date(dateString)
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('fr-FR')
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Header movies={allMovies} onSearch={() => {}} cartItems={rentals} onRemoveFromCart={() => {}} />
      <main className="container mx-auto px-4 pb-12 pt-24">
        <h1 className="text-4xl font-bold">Mes locations</h1>

        {rentals.length === 0 ? (
          <div className="mt-8 flex min-h-[55vh] flex-col items-center justify-center rounded-lg bg-black text-center">
            <svg className="h-16 w-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.8" />
              <path d="M3 9h18M3 15h18M9 4v16M15 4v16" strokeWidth="1.8" />
            </svg>
            <p className="mt-6 text-lg text-gray-400">Aucune location pour le moment</p>
            <Link
              to="/"
              className="bg-primary hover:bg-primary-dark mt-6 rounded px-5 py-2 font-semibold text-white"
            >
              Decouvrir des films
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rentals.map((movie) => (
              <article
                key={`${movie.movieId || movie.id}-${movie.rentalDate || movie.title}`}
                className="rounded-lg border border-netflix-gray bg-black/50 p-3"
              >
                <img src={movie.poster} alt={movie.title} className="aspect-[2/3] w-full rounded object-cover" />
                <h2 className="mt-3 font-semibold">{movie.title}</h2>
                <p className="text-xs text-gray-400">Debut: {formatDate(movie.rentalDate)}</p>
                <p className="text-xs text-gray-400">Fin: {formatDate(movie.expiryDate)}</p>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default MyRentals
