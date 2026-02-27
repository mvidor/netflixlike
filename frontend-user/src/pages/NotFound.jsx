import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-netflix-black px-4 text-white">
      <p className="text-primary text-8xl font-extrabold leading-none">404</p>
      <h1 className="mt-4 text-3xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-center text-gray-400">
        Oups ! La page que vous recherchez n'existe pas.
      </p>
      <Link
        to="/"
        className="bg-primary hover:bg-primary-dark mt-6 rounded px-5 py-2 font-semibold transition"
      >
        Retour a l'accueil
      </Link>
    </div>
  )
}

export default NotFound
