import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Button from '../components/common/Button'
import { allMovies } from '../data/movies'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthProvider'
import { useNotification } from '../context/NotificationContext'

function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { cart, removeFromCart, clearCart, rentAllInCart, getCartTotal } = useCart()
  const { success, info, warning } = useNotification()

  const cartMovies = useMemo(
    () =>
      cart.map((item) => {
        const movieId = item.movieId || item.id
        const fullMovie = allMovies.find((movie) => movie.id === movieId)
        return { ...fullMovie, ...item, movieId }
      }),
    [cart]
  )

  const handleRentAll = () => {
    if (!isAuthenticated()) {
      info('Connectez-vous pour louer le panier.')
      navigate('/login', { state: { from: { pathname: '/cart' } } })
      return
    }

    const result = rentAllInCart()
    if (result.success) {
      success(`${result.count} film(s) loue(s) avec succes.`)
      navigate('/my-rentals')
      return
    }

    warning('Aucun film du panier n a pu etre loue.')
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-netflix-black text-white">
        <Header movies={allMovies} onSearch={() => {}} />
        <main className="container mx-auto px-4 py-24">
          <h1 className="mb-8 text-4xl font-bold">Mon Panier</h1>

          <div className="rounded-lg bg-black py-20 text-center">
            <svg className="mx-auto h-16 w-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13"
              />
            </svg>
            <p className="mt-6 text-2xl text-gray-400">Votre panier est vide</p>
            <Link to="/" className="mt-6 inline-block">
              <Button>Decouvrir les films</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Header movies={allMovies} onSearch={() => {}} />

      <main className="container mx-auto px-4 py-24">
        <h1 className="mb-8 text-4xl font-bold">Mon Panier</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cartMovies.map((movie) => (
              <div
                key={movie.movieId}
                className="flex items-center rounded-lg border border-gray-800 bg-slate-900/70 p-4"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="h-28 w-20 rounded object-cover"
                />

                <div className="ml-4 flex-1">
                  <h2 className="text-xl font-bold">{movie.title}</h2>
                  <p className="mb-2 text-sm text-gray-400">
                    {movie.year} | {movie.genre} | {movie.duration}min
                  </p>
                  <p className="text-lg font-bold text-primary">{Number(movie.price).toFixed(2)}EUR</p>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(movie.movieId)}
                  className="ml-4 text-red-400 transition hover:text-red-300"
                  aria-label={`Retirer ${movie.title} du panier`}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className="sticky top-24 rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h2 className="mb-6 text-2xl font-bold">Resume</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Nombre de films:</span>
                  <span>{cart.length}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Duree de location:</span>
                  <span>7 jours</span>
                </div>
                <hr className="border-gray-800" />
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{getCartTotal().toFixed(2)}EUR</span>
                </div>
              </div>

              <Button onClick={handleRentAll} className="mb-3 mt-6 w-full">
                Louer tout ({cart.length} film{cart.length > 1 ? 's' : ''})
              </Button>

              <button
                type="button"
                onClick={clearCart}
                className="w-full rounded border border-gray-700 px-4 py-2 transition hover:bg-gray-800"
              >
                Vider le panier
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Cart
