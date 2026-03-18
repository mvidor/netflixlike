import Navbar from '../common/Navbar'

function Header({ movies, onSearch }) {
  return <Navbar movies={movies} onSearch={onSearch} />
}

export default Header
