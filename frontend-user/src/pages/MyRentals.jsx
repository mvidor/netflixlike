import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Button from '../components/common/Button'
import { useCart } from '../context/useCart'
import { useNotification } from '../context/useNotification'
import { getPosterSources, handleImageFallback } from '../utils/movieImages'

const tabs = [
  { key: 'all', label: 'Toutes' },
  { key: 'active', label: 'Actives' },
  { key: 'expired', label: 'Expirees' },
  { key: 'cancelled', label: 'Annulees' }
]

const MyRentals = () => {
  const { rentals, refreshRentals, cancelRental } = useCart()
  const { success, error } = useNotification()
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRentals = async () => {
      try {
        await refreshRentals()
      } finally {
        setLoading(false)
      }
    }

    loadRentals()
  }, [refreshRentals])

  const displayedRentals = useMemo(() => {
    if (activeTab === 'all') {
      return rentals
    }

    return rentals.filter((rental) => rental.status === activeTab)
  }, [activeTab, rentals])

  const handleCancel = async (rentalId) => {
    try {
      const response = await cancelRental(rentalId)
      success(response.message || 'Location annulee')
    } catch (err) {
      error(err.message || 'Impossible d annuler la location')
    }
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Header onSearch={() => {}} />

      <main className="container mx-auto px-4 py-24">
        <h1 className="mb-8 text-4xl font-bold">Mes locations</h1>

        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded px-4 py-2 text-sm font-semibold ${
                activeTab === tab.key ? 'bg-primary text-white' : 'bg-slate-800 text-gray-300'
              }`}
            >
              {tab.label} ({tab.key === 'all' ? rentals.length : rentals.filter((item) => item.status === tab.key).length})
            </button>
          ))}
        </div>

        {loading ? <div className="text-gray-400">Chargement des locations...</div> : null}

        {!loading && displayedRentals.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedRentals.map((rental) => (
              <article key={rental._id} className="rounded-lg border border-gray-800 bg-slate-900/70 p-3">
                <img
                  src={getPosterSources(rental)[0]}
                  alt={rental.title}
                  className="h-72 w-full rounded-lg object-cover"
                  onError={(event) => handleImageFallback(event, getPosterSources(rental))}
                />
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="line-clamp-1 font-semibold">{rental.title}</h3>
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold ${
                        rental.status === 'active'
                          ? 'bg-green-600'
                          : rental.status === 'cancelled'
                            ? 'bg-red-600'
                            : 'bg-gray-600'
                      }`}
                    >
                      {rental.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Loue le {new Date(rental.rentalDate).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-gray-400">
                    Expire le {new Date(rental.expiryDate).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Link to={`/movie/${rental.movieId}`} className="flex-1">
                      <Button variant="secondary" className="w-full">
                        Voir le film
                      </Button>
                    </Link>
                    {rental.status === 'active' ? (
                      <Button className="flex-1" onClick={() => handleCancel(rental._id)}>
                        Annuler
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {!loading && rentals.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-6 mt-6 text-2xl text-gray-400">Aucune location pour le moment</p>
            <Link to="/">
              <button className="rounded-lg bg-primary px-6 py-3 font-semibold transition hover:bg-red-700">
                Decouvrir des films
              </button>
            </Link>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}

export default MyRentals
