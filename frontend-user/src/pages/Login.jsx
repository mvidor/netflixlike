import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { useAuth } from '../context/useAuth'
import { useNotification } from '../context/useNotification'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/'
  const { login } = useAuth()
  const { success, error } = useNotification()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.email) {
      nextErrors.email = 'Email requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Email invalide'
    }

    if (!formData.password) {
      nextErrors.password = 'Mot de passe requis'
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    const result = await login(formData.email, formData.password)
    if (result.success) {
      setIsLoading(false)
      success('Connexion reussie.')
      navigate(redirectTo, { replace: true })
      return
    }

    error(result.error || 'Erreur de connexion')
    setErrors({ auth: result.error || 'Erreur de connexion' })
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center bg-netflix-black px-4 text-white">
      <form
        className="w-full max-w-md space-y-4 rounded-lg border border-netflix-gray bg-black/60 p-6"
        onSubmit={handleSubmit}
      >
        <h1 className="text-primary text-center text-4xl font-bold tracking-tight">NETZLIX</h1>
        <h2 className="pt-2 text-2xl font-bold">Se connecter</h2>
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
          autoComplete="current-password"
        />
        {errors.auth ? <p className="text-sm text-primary">{errors.auth}</p> : null}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </Button>
        <p className="text-center text-sm text-gray-400">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-primary hover:underline">
            S'inscrire
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login
