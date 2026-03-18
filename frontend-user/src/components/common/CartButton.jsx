import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

function CartButton() {
  const { getCartCount } = useCart()

  return (
    <div className="relative flex items-center">
      <Link
        to="/cart"
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
        {getCartCount() > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {getCartCount()}
          </span>
        ) : null}
      </Link>
    </div>
  )
}

export default CartButton
