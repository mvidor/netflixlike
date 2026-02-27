import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

const USERS_STORAGE_KEY = 'users'

const readUsers = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const Register = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.name) {
      nextErrors.name = 'Nom requis'
    }

    if (!formData.email) {
      nextErrors.email = 'Email requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Email invalide'
    }

    if (!formData.password) {
      nextErrors.password = 'Mot de passe requis'
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Au moins 6 caracteres'
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Confirmation requise'
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    const existingUsers = readUsers()
    const alreadyExists = existingUsers.some(
      (user) => user.email.toLowerCase() === formData.email.toLowerCase()
    )
    if (alreadyExists) {
      nextErrors.email = 'Cet email existe deja'
    }

    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    setTimeout(() => {
      const existingUsers = readUsers()
      const nextUsers = [
        ...existingUsers,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password
        }
      ]
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers))

      localStorage.setItem(
        'user',
        JSON.stringify({
          email: formData.email,
          name: formData.name
        })
      )
      setIsLoading(false)
      navigate('/', { replace: true })
    }, 1000)
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center bg-netflix-black px-4 text-white">
      <form
        className="w-full max-w-md space-y-4 rounded-lg border border-netflix-gray bg-black/60 p-6"
        onSubmit={handleSubmit}
      >
        <h1 className="text-primary text-center text-4xl font-bold tracking-tight">NetZlix</h1>
        <h2 className="pt-2 text-3xl font-bold">S'inscrire</h2>
        <Input
          id="name"
          name="name"
          type="text"
          label="Nom"
          placeholder="Votre nom"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="email@exemple.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="********"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmez le mot de passe"
          placeholder="********"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Inscription...' : "S'inscrire"}
        </Button>
        <p className="text-center text-sm text-gray-400">
          Deja un compte ?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register
