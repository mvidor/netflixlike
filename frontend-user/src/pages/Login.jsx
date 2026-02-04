import Input from '../components/common/Input'
import Button from '../components/common/Button'

const Login = () => {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <form className="w-full max-w-md space-y-4 rounded-lg border border-netflix-gray bg-black/50 p-6">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <Input id="email" type="email" label="Email" placeholder="email@exemple.com" />
        <Input id="password" type="password" label="Mot de passe" placeholder="********" />
        <Button type="submit">Se connecter</Button>
      </form>
    </div>
  )
}

export default Login
