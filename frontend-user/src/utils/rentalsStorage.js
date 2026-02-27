const RENTALS_BY_USER_KEY = 'rentalsByUser'

const readJson = (key, fallback) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '')
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const getCurrentUserEmail = () => {
  const user = readJson('user', null)
  if (!user || typeof user.email !== 'string') {
    return null
  }
  return user.email.toLowerCase()
}

export const getRentalsForCurrentUser = () => {
  const email = getCurrentUserEmail()
  if (!email) {
    return []
  }

  const rentalsByUser = readJson(RENTALS_BY_USER_KEY, {})
  const rentals = rentalsByUser[email]
  return Array.isArray(rentals) ? rentals : []
}

export const saveRentalsForCurrentUser = (rentals) => {
  const email = getCurrentUserEmail()
  if (!email) {
    return false
  }

  const rentalsByUser = readJson(RENTALS_BY_USER_KEY, {})
  rentalsByUser[email] = Array.isArray(rentals) ? rentals : []
  localStorage.setItem(RENTALS_BY_USER_KEY, JSON.stringify(rentalsByUser))
  return true
}
