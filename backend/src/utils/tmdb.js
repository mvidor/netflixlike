const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

const buildImageUrl = (path, size) => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

const getTmdbApiKey = () => {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error('TMDB_API_KEY est manquant dans le fichier .env');
  }

  return apiKey;
};

export const searchMovieImages = async ({ title, year }) => {
  const apiKey = getTmdbApiKey();
  const params = new URLSearchParams({
    api_key: apiKey,
    query: title,
    include_adult: 'false',
    language: 'fr-FR',
  });

  if (year) {
    params.set('year', String(year));
  }

  const response = await fetch(`${TMDB_API_BASE_URL}/search/movie?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`TMDB a renvoyé ${response.status} pour "${title}"`);
  }

  const payload = await response.json();
  const match = Array.isArray(payload.results) ? payload.results[0] : null;

  if (!match) {
    return null;
  }

  return {
    tmdbId: match.id,
    poster: buildImageUrl(match.poster_path, 'w500'),
    backdrop: buildImageUrl(match.backdrop_path, 'original'),
    raw: match,
  };
};
