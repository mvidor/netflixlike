import { useState } from 'react'

function CartButton({ items, onRemove }) {
  const [showCart, setShowCart] = useState(false)

  const toggleShow = () => setShowCart((current) => !current)

  return (
    <div className="relative flex items-center">
      <button
        onClick={toggleShow}
        className="relative h-8 w-8 rounded bg-gray-900 text-gray-100 transition hover:bg-gray-800"
        aria-label="Ouvrir le panier"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13"
          />
        </svg>
        {items.length > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {items.length}
          </span>
        )}
      </button>

      {showCart && items.length > 0 && (
        <div className="absolute right-0 top-10 w-72 rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-xl">
          <div className="text-sm font-semibold text-white">Votre panier</div>
          <div className="mt-3 space-y-2">
            {items.map((movie) => (
              <button
                key={movie.id}
                type="button"
                onDoubleClick={() => onRemove(movie.id)}
                className="flex w-full items-center justify-between rounded bg-gray-800 px-3 py-2 text-left text-sm text-white transition hover:bg-gray-700"
              >
                <span className="truncate">{movie.title}</span>
                <span className="text-xs text-gray-400">{movie.price}€</span>
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-400">Double-cliquez pour supprimer</div>
        </div>
      )}
    </div>
  )
}

export default CartButton
