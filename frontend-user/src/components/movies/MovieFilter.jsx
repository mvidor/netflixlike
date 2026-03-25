import { useState } from 'react'

function MovieFilter({ movies, onFilter }) {
  const [selectedGenre, setSelectedGenre] = useState('all')

  const genres = [
    'all',
    ...new Set(
      movies.flatMap((movie) => (Array.isArray(movie.genres) ? movie.genres : [movie.genre].filter(Boolean)))
    )
  ]

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre)

    if (genre === 'all') {
      onFilter(movies)
      return
    }

    const filtered = movies.filter((movie) => {
      const movieGenres = Array.isArray(movie.genres) ? movie.genres : [movie.genre].filter(Boolean)
      return movieGenres.includes(genre)
    })
    onFilter(filtered)
  }

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2 pt-4">
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => handleGenreChange(genre)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            selectedGenre === genre
              ? 'bg-primary text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {genre === 'all' ? 'Tous' : genre}
        </button>
      ))}
    </div>
  )
}

export default MovieFilter
