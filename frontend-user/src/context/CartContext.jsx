import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'

const CartContext = createContext(null)

const CARTS_BY_USER_KEY = 'cartsByUser'
const RENTALS_BY_USER_KEY = 'rentalsByUser'

const readJson = (key, fallback) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '')
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const saveByUser = (key, email, items) => {
  if (!email) {
    return
  }

  const scopedData = readJson(key, {})
  scopedData[email.toLowerCase()] = Array.isArray(items) ? items : []
  localStorage.setItem(key, JSON.stringify(scopedData))
}

const readByUser = (key, email) => {
  if (!email) {
    return []
  }

  const scopedData = readJson(key, {})
  const items = scopedData[email.toLowerCase()]
  return Array.isArray(items) ? items : []
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const email = user?.email ?? null
  const [cart, setCart] = useState([])
  const [rentals, setRentals] = useState([])

  useEffect(() => {
    setCart(readByUser(CARTS_BY_USER_KEY, email))
    setRentals(readByUser(RENTALS_BY_USER_KEY, email))
  }, [email])

  useEffect(() => {
    saveByUser(CARTS_BY_USER_KEY, email, cart)
  }, [cart, email])

  useEffect(() => {
    saveByUser(RENTALS_BY_USER_KEY, email, rentals)
  }, [rentals, email])

  const isRented = (movieId) =>
    rentals.some((item) => item.movieId === movieId || item.id === movieId)

  const isInCart = (movieId) =>
    cart.some((item) => item.movieId === movieId || item.id === movieId)

  const addToCart = (movie) => {
    if (!movie || isRented(movie.id) || isInCart(movie.id)) {
      return false
    }

    setCart((current) => [
      ...current,
      {
        id: movie.id,
        movieId: movie.id,
        title: movie.title,
        poster: movie.poster,
        price: movie.price
      }
    ])

    return true
  }

  const removeFromCart = (movieId) => {
    setCart((current) => current.filter((item) => item.movieId !== movieId && item.id !== movieId))
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () =>
    cart.reduce((total, item) => total + (Number(item.price) || 0), 0)

  const getCartCount = () => cart.length

  const rentMovie = (movie) => {
    if (!email) {
      return { success: false, error: 'Connexion requise' }
    }

    if (!movie || isRented(movie.id)) {
      return { success: false, error: 'Vous avez deja loue ce film.' }
    }

    const rentalDate = new Date()
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)

    const rental = {
      id: Date.now(),
      movieId: movie.id,
      title: movie.title,
      poster: movie.poster,
      price: movie.price,
      rentalDate: rentalDate.toISOString(),
      expiryDate: expiryDate.toISOString()
    }

    setRentals((current) => [...current, rental])
    removeFromCart(movie.id)

    return { success: true, rental }
  }

  const rentAllInCart = () => {
    if (!email || cart.length === 0) {
      return { success: false, count: 0 }
    }

    const rentalDate = new Date()
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)

    const rentedIds = new Set(rentals.map((item) => item.movieId || item.id))
    const nextRentals = cart
      .filter((item) => !rentedIds.has(item.movieId || item.id))
      .map((item, index) => ({
        id: Date.now() + index,
        movieId: item.movieId || item.id,
        title: item.title,
        poster: item.poster,
        price: item.price,
        rentalDate: rentalDate.toISOString(),
        expiryDate: expiryDate.toISOString()
      }))

    if (nextRentals.length === 0) {
      clearCart()
      return { success: false, count: 0 }
    }

    setRentals((current) => [...current, ...nextRentals])
    clearCart()

    return { success: true, count: nextRentals.length }
  }

  const getRentalByMovieId = (movieId) =>
    rentals.find((item) => item.movieId === movieId || item.id === movieId) ?? null

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
    isRented,
    getRentalByMovieId,
    isInCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }

  return context
}
