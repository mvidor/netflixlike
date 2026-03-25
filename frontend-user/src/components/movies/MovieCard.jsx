import Button from '../common/Button'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/useCart'

const genreColors = {
  Action: 'bg-red-500',
  Comedie: 'bg-yellow-500 text-black',
  Drame: 'bg-blue-500',
  'Science-Fiction': 'bg-purple-500',
  Horreur: 'bg-orange-500',
  Thriller: 'bg-gray-500'
}

function MovieCard({ movie, onRent, onAddToCart }) {
  const navigate = useNavigate()
  const { isRented, isInCart } = useCart()
  const movieId = movie._id || movie.id
  const genreLabel = Array.isArray(movie.genre) ? movie.genre[0] : movie.genre
  const rented = isRented(movieId)
  const inCart = isInCart(movieId)

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105"
      onClick={() => navigate(`/movie/${movieId}`)}
    >
      <div className="relative aspect-[2/3]">
        <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" />

        <div className="absolute right-2 top-2 rounded bg-black/80 px-2 py-1 backdrop-blur-sm">
          <span className="text-sm font-bold text-yellow-400">* {movie.rating}</span>
        </div>

        <span
          className={`absolute bottom-2 left-2 rounded px-2 py-1 text-xs font-semibold ${
            genreColors[genreLabel] || 'bg-gray-700'
          }`}
        >
          {genreLabel}
        </span>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/70 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="mb-2 text-xl font-bold">{movie.title}</h3>

        <div className="mb-3 flex items-center space-x-3 text-sm">
          <span className="font-semibold text-green-400">{movie.rating}/10</span>
          <span className="text-gray-400">{movie.year}</span>
          <span className="text-gray-400">{movie.duration}min</span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-gray-300">{movie.description}</p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            size="sm"
            className="flex-1"
            disabled={rented}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (onRent && !rented) {
                onRent(movie)
              }
            }}
          >
            {rented ? 'Deja loue' : `Louer ${movie.price} EUR`}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={rented || inCart}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (onAddToCart && !rented && !inCart) {
                onAddToCart(movie)
                return
              }
              navigate(`/movie/${movieId}`)
            }}
          >
            {rented ? 'Loue' : inCart ? 'Dans le panier' : '+ Panier'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
