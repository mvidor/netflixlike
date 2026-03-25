const buildPlaceholder = (title, format = 'poster') => {
  const width = format === 'backdrop' ? 1200 : 400
  const height = format === 'backdrop' ? 675 : 600
  const safeTitle = title || 'Movie'

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#111827" />
          <stop offset="100%" stop-color="#7f1d1d" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#ffffff" font-family="Arial, sans-serif" font-size="${format === 'backdrop' ? 44 : 28}" font-weight="700">
        ${safeTitle}
      </text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const sanitizeSources = (sources) => [...new Set(sources.filter(Boolean))]

export const getPosterSources = (movie) =>
  sanitizeSources([
    movie?.poster,
    movie?.backdrop,
    buildPlaceholder(movie?.title, 'poster')
  ])

export const getBackdropSources = (movie) =>
  sanitizeSources([
    movie?.backdrop,
    movie?.poster,
    buildPlaceholder(movie?.title, 'backdrop')
  ])

export const handleImageFallback = (event, sources) => {
  const index = Number(event.currentTarget.dataset.fallbackIndex || 0)
  const nextIndex = index + 1

  if (nextIndex >= sources.length) {
    return
  }

  event.currentTarget.dataset.fallbackIndex = String(nextIndex)
  event.currentTarget.src = sources[nextIndex]
}
