import MovieCard from './MovieCard'

function MovieList({ title, movies }) {
  return (
    <section className="py-8">
      <h2 className="mb-6 px-4 text-2xl font-bold text-white md:text-3xl">{title}</h2>

      <div className="flex gap-4 overflow-x-auto px-4 pb-2">
        {movies.map((movie) => (
          <div key={movie.id} className="w-40 shrink-0 sm:w-48 md:w-56">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default MovieList
