import Button from '../common/Button'

function MovieHero({ movie }) {
  return (
    <div className="relative h-[80vh] w-full">
      <div className="absolute inset-0">
        <img src={movie.backdrop} alt={movie.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto flex h-full items-center px-4">
        <div className="max-w-2xl">
          <h1 className="mb-4 text-5xl font-bold drop-shadow-2xl md:text-7xl">{movie.title}</h1>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded bg-primary px-3 py-1 text-sm font-bold">{movie.rating}/10</span>
            <span className="text-gray-300">{movie.year}</span>
            <span className="text-gray-300">{movie.duration} min</span>
            <span className="rounded border border-gray-500 px-2 py-0.5 text-sm">{movie.genre}</span>
          </div>

          <p className="mb-8 text-lg leading-relaxed text-gray-300 drop-shadow-lg md:text-xl">
            {movie.description}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="shadow-2xl">
              Louer pour {movie.price}EUR
            </Button>
            <Button variant="secondary" size="lg">
              Plus d'infos
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieHero
