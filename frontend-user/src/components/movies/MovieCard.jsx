import Button from '../common/Button'

const genreColors = {
  Action: 'bg-red-500',
  Comedie: 'bg-yellow-500 text-black',
  Drame: 'bg-blue-500',
  'Science-Fiction': 'bg-purple-500',
  Horreur: 'bg-orange-500',
  Thriller: 'bg-gray-500'
}

function MovieCard({ movie }) {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105">
      <div className="relative aspect-[2/3]">
        <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" />

        <div className="absolute right-2 top-2 rounded bg-black/80 px-2 py-1 backdrop-blur-sm">
          <span className="text-sm font-bold text-yellow-400">* {movie.rating}</span>
        </div>

        <span
          className={`absolute bottom-2 left-2 rounded px-2 py-1 text-xs font-semibold ${
            genreColors[movie.genre] || 'bg-gray-700'
          }`}
        >
          {movie.genre}
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
          <Button size="sm" className="flex-1">
            {'>'} Louer {movie.price}EUR
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            + Info
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
