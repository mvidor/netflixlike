import { Link } from 'react-router-dom'

function Breadcrumb({ items = [] }) {
  return (
    <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-400">
      <Link to="/" className="transition hover:text-white">
        Accueil
      </Link>

      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center space-x-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {item.path ? (
            <Link to={item.path} className="transition hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumb
