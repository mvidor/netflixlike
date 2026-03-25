const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

const normalizeMovie = (movie) => {
  if (!movie) {
    return movie
  }

  const genres = Array.isArray(movie.genre) ? movie.genre : movie.genre ? [movie.genre] : []

  return {
    ...movie,
    id: movie._id || movie.id,
    _id: movie._id || movie.id,
    genre: genres[0] || '',
    genres
  }
}

const normalizeRental = (rental) => {
  if (!rental) {
    return rental
  }

  const movie = rental.movie ? normalizeMovie(rental.movie) : null

  return {
    ...rental,
    id: rental._id || rental.id,
    _id: rental._id || rental.id,
    movie,
    movieId: movie?._id || rental.movieId || rental.movie,
    title: movie?.title || rental.title,
    poster: movie?.poster || rental.poster,
    backdrop: movie?.backdrop || rental.backdrop,
    status: rental.status || 'active'
  }
}

/**
 * Fonction utilitaire pour gerer les requetes fetch
 * @param {string} endpoint - L'endpoint de l'API
 * @param {object} options - Options de la requete fetch
 * @returns {Promise} - Promesse avec les donnees ou erreur
 */
const fetchAPI = async (endpoint, options = {}) => {
  // Recuperer le token depuis localStorage
  const token = localStorage.getItem(TOKEN_KEY)

  // Configuration par defaut
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  // Fusionner les options
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)

    // Gestion des erreurs HTTP
    if (!response.ok) {
      // Cas special : 401 Unauthorized (token expire/invalide)
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        window.location.href = '/login'
      }

      // Essayer de parser le JSON d'erreur
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: response.statusText }
      }

      throw new Error(errorData.message || `HTTP Error: ${response.status}`)
    }

    // Parser et retourner les donnees JSON
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// ==================== AUTH ENDPOINTS ====================

export const authAPI = {
  /**
   * Inscription d'un nouvel utilisateur
   * @param {object} userData - { name, email, password }
   */
  register: async (userData) => {
    return await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },

  /**
   * Connexion d'un utilisateur
   * @param {object} credentials - { email, password }
   */
  login: async (credentials) => {
    return await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  },

  /**
   * Obtenir le profil de l'utilisateur connecte
   */
  getMe: async () => {
    return await fetchAPI('/auth/me')
  },

  /**
   * Mettre a jour le profil
   * @param {object} updates - { name, email }
   */
  updateProfile: async (updates) => {
    return await fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  },

  /**
   * Changer le mot de passe
   * @param {object} passwords - { currentPassword, newPassword }
   */
  changePassword: async (passwords) => {
    return await fetchAPI('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords)
    })
  },

  /**
   * Deconnexion
   */
  logout: async () => {
    return await fetchAPI('/auth/logout', {
      method: 'POST'
    })
  }
}

// ==================== MOVIES ENDPOINTS ====================

export const moviesAPI = {
  /**
   * Obtenir tous les films avec filtres optionnels
   * @param {object} params - { genre, year, search, sort, page, limit }
   */
  getAll: async (params = {}) => {
    // Construire la query string
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value)
      }
    })

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/movies?${queryString}` : '/movies'
    const response = await fetchAPI(endpoint)

    return {
      ...response,
      data: Array.isArray(response.data) ? response.data.map(normalizeMovie) : []
    }
  },

  /**
   * Obtenir un film par son ID
   * @param {string} id - ID du film
   */
  getById: async (id) => {
    const response = await fetchAPI(`/movies/${id}`)

    return {
      ...response,
      data: normalizeMovie(response.data)
    }
  },

  /**
   * Obtenir les films similaires
   * @param {string} id - ID du film
   */
  getSimilar: async (id) => {
    const response = await fetchAPI(`/movies/${id}/similar`)

    return {
      ...response,
      data: Array.isArray(response.data) ? response.data.map(normalizeMovie) : []
    }
  },

  /**
   * Obtenir des films aleatoires
   * @param {number} limit - Nombre maximum de films
   */
  getRandom: async (limit = 5) => {
    const response = await fetchAPI(`/movies/random?limit=${limit}`)

    return {
      ...response,
      data: Array.isArray(response.data) ? response.data.map(normalizeMovie) : []
    }
  },

  /**
   * Creer un nouveau film (admin)
   * @param {object} movieData - Donnees du film
   */
  create: async (movieData) => {
    const response = await fetchAPI('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData)
    })

    return {
      ...response,
      data: normalizeMovie(response.data)
    }
  },

  /**
   * Mettre a jour un film (admin)
   * @param {string} id - ID du film
   * @param {object} updates - Donnees a mettre a jour
   */
  update: async (id, updates) => {
    const response = await fetchAPI(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })

    return {
      ...response,
      data: normalizeMovie(response.data)
    }
  },

  /**
   * Supprimer un film (admin)
   * @param {string} id - ID du film
   */
  delete: async (id) => {
    return await fetchAPI(`/movies/${id}`, {
      method: 'DELETE'
    })
  },

  /**
   * Obtenir les statistiques des films (admin)
   */
  getStats: async () => {
    return await fetchAPI('/movies/stats')
  },

  /**
   * Recherche avancee
   * @param {object} filters - Filtres de recherche
   */
  search: async (filters = {}) => {
    return await moviesAPI.getAll(filters)
  }
}

// ==================== RENTALS ENDPOINTS ====================

export const rentalsAPI = {
  /**
   * Louer un film
   * @param {string} movieId - ID du film a louer
   */
  rent: async (movieId) => {
    const response = await fetchAPI('/rentals', {
      method: 'POST',
      body: JSON.stringify({ movieId })
    })

    return {
      ...response,
      data: normalizeRental(response.data)
    }
  },

  /**
   * Obtenir mes locations
   * @param {object} params - { status: 'active' | 'expired' | 'all' }
   */
  getMyRentals: async (params = {}) => {
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value)
      }
    })

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/rentals/my-rentals?${queryString}` : '/rentals/my-rentals'
    const response = await fetchAPI(endpoint)

    return {
      ...response,
      data: Array.isArray(response.data) ? response.data.map(normalizeRental) : []
    }
  },

  /**
   * Obtenir toutes les locations (admin)
   * @param {object} params - { page, limit, status }
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value)
      }
    })

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/rentals?${queryString}` : '/rentals'
    const response = await fetchAPI(endpoint)

    return {
      ...response,
      data: Array.isArray(response.data) ? response.data.map(normalizeRental) : []
    }
  },

  /**
   * Annuler une location
   * @param {string} id - ID de la location
   */
  cancel: async (id) => {
    return await fetchAPI(`/rentals/${id}`, {
      method: 'DELETE'
    })
  },

  /**
   * Obtenir les statistiques des locations (admin)
   */
  getStats: async () => {
    return await fetchAPI('/rentals/stats')
  },

  /**
   * Obtenir des recommandations personnalisees
   * @param {number} limit - Nombre maximum de films
   */
  getRecommendations: async (limit = 10) => {
    const response = await fetchAPI(`/rentals/recommendations?limit=${limit}`)

    return {
      ...response,
      data: Array.isArray(response.data) ? response.data.map(normalizeMovie) : []
    }
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Verifier si l'utilisateur est connecte
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY)
}

/**
 * Obtenir le token actuel
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Sauvegarder les donnees d'authentification
 */
export const saveAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Supprimer les donnees d'authentification
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Obtenir l'utilisateur depuis localStorage
 */
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export { normalizeMovie, normalizeRental }

// Export par defaut
export default {
  authAPI,
  moviesAPI,
  rentalsAPI,
  isAuthenticated,
  getToken,
  saveAuth,
  clearAuth,
  getUser
}
