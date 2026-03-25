import { createContext, useCallback, useEffect, useState } from 'react'
import { rentalsAPI } from '../services/api'
import { useAuth } from './useAuth'

const CartContext = createContext(null)

const CARTS_BY_USER_KEY = 'cartsByUser'

const readJson = (key, fallback) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '')
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const saveByUser = (key, scope, items) => {
  if (!scope) {
    return
  }

  const scopedData = readJson(key, {})
  scopedData[scope] = Array.isArray(items) ? items : []
  localStorage.setItem(key, JSON.stringify(scopedData))
}

const readByUser = (key, scope) => {
  if (!scope) {
    return []
  }

  const scopedData = readJson(key, {})
  const items = scopedData[scope]
  return Array.isArray(items) ? items : []
}

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const scope = user?.email?.toLowerCase() || user?._id || null
  const [cart, setCart] = useState([])
  const [rentals, setRentals] = useState([])

  useEffect(() => {
    setCart(readByUser(CARTS_BY_USER_KEY, scope))
  }, [scope])

  useEffect(() => {
    saveByUser(CARTS_BY_USER_KEY, scope, cart)
  }, [cart, scope])

  useEffect(() => {
    if (!isAuthenticated()) {
      setRentals([])
      return
    }

    const loadRentals = async () => {
      try {
        const response = await rentalsAPI.getMyRentals()
        setRentals(response.data || [])
      } catch {
        setRentals([])
      }
    }

    loadRentals()
  }, [isAuthenticated, user?._id])

  const refreshRentals = useCallback(async (params = {}) => {
    if (!isAuthenticated()) {
      setRentals([])
      return []
    }

    const response = await rentalsAPI.getMyRentals(params)
    setRentals(response.data || [])
    return response.data || []
  }, [isAuthenticated])

  const isRented = (movieId) =>
    rentals.some((item) => item.movieId === movieId || item.movie?._id === movieId)

  const isInCart = (movieId) =>
    cart.some((item) => item.movieId === movieId || item._id === movieId || item.id === movieId)

  const addToCart = (movie) => {
    const movieId = movie?._id || movie?.id

    if (!movie || !movieId || isRented(movieId) || isInCart(movieId)) {
      return false
    }

    setCart((current) => [
      ...current,
      {
        id: movieId,
        _id: movieId,
        movieId,
        title: movie.title,
        poster: movie.poster,
        backdrop: movie.backdrop,
        price: movie.price,
        year: movie.year,
        duration: movie.duration,
        genre: movie.genre
      }
    ])

    return true
  }

  const removeFromCart = (movieId) => {
    setCart((current) =>
      current.filter((item) => item.movieId !== movieId && item._id !== movieId && item.id !== movieId)
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => cart.reduce((total, item) => total + (Number(item.price) || 0), 0)

  const getCartCount = () => cart.length

  const rentMovie = async (movie) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'Connexion requise' }
    }

    const movieId = movie?._id || movie?.id
    if (!movieId) {
      return { success: false, error: 'Film invalide' }
    }

    try {
      const response = await rentalsAPI.rent(movieId)
      setRentals((current) => [...current, response.data])
      removeFromCart(movieId)
      return { success: true, rental: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const rentAllInCart = async () => {
    if (!isAuthenticated() || cart.length === 0) {
      return { success: false, count: 0 }
    }

    let count = 0

    for (const item of cart) {
      const result = await rentMovie(item)
      if (result.success) {
        count += 1
      }
    }

    return { success: count > 0, count }
  }

  const cancelRental = async (rentalId) => {
    const response = await rentalsAPI.cancel(rentalId)
    await refreshRentals()
    return response
  }

  const getRentalByMovieId = (movieId) =>
    rentals.find((item) => item.movieId === movieId || item.movie?._id === movieId) ?? null

  const value = {
    cart,
    rentals,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    rentMovie,
    rentAllInCart,
    cancelRental,
    refreshRentals,
    isRented,
    getRentalByMovieId,
    isInCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export { CartContext }
