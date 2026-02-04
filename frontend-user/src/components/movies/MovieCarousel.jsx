import { useEffect, useRef, useState } from 'react'
import MovieCard from './MovieCard'

function MovieCarousel({ title, movies }) {
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }

  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8
    const newScrollPosition =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    updateScrollState()
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', updateScrollState)
    window.addEventListener('resize', updateScrollState)

    return () => {
      container.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [movies])

  return (
    <section className="relative py-8">
      <h2 className="mb-6 px-4 text-2xl font-bold md:text-3xl">{title}</h2>

      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-r bg-black/80 p-2 opacity-80 transition-opacity hover:opacity-100"
          aria-label="Defiler a gauche"
        >
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto px-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {movies.map((movie) => (
          <div key={movie.id} className="w-48 shrink-0">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-l bg-black/80 p-2 opacity-80 transition-opacity hover:opacity-100"
          aria-label="Defiler a droite"
        >
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </section>
  )
}

export default MovieCarousel
