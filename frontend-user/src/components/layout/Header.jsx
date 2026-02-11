import Navbar from '../common/Navbar'

function Header({ movies, onSearch, cartItems, onRemoveFromCart }) {
  return (
    <Navbar
      movies={movies}
      onSearch={onSearch}
      cartItems={cartItems}
      onRemoveFromCart={onRemoveFromCart}
    />
  )
}

export default Header
