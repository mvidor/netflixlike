import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import MovieHero from '../components/movies/MovieHero'
import MovieCarousel from '../components/movies/MovieCarousel'

const allMovies = [
  {
    id: 1,
    title: 'Inception',
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    rating: 8.8,
    year: 2010,
    duration: 148,
    price: 3.99,
    genre: 'Science-Fiction',
    description:
      "Un voleur qui s'infiltre dans les reves des gens pour voler leurs secrets doit accomplir l'inverse : implanter une idee."
  },
  {
    id: 2,
    title: 'Interstellar',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIxJk.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg',
    rating: 8.6,
    year: 2014,
    duration: 169,
    price: 4.99,
    genre: 'Science-Fiction',
    description: 'Voyage spatial pour sauver l humanite.'
  },
  {
    id: 3,
    title: 'The Dark Knight',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/hkBaDkMWLaB8B1lsWsKX7Ew3Xq.jpg',
    rating: 9.0,
    year: 2008,
    duration: 152,
    price: 3.99,
    genre: 'Action',
    description: 'Batman affronte le Joker dans Gotham.'
  },
  {
    id: 4,
    title: 'Pulp Fiction',
    poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/suaEOtkN1sgg2MTM7oZd2cfVp3.jpg',
    rating: 8.9,
    year: 1994,
    duration: 154,
    price: 3.99,
    genre: 'Thriller',
    description: 'Histoires croisees de criminels a Los Angeles.'
  },
  {
    id: 5,
    title: 'John Wick',
    poster: 'https://picsum.photos/seed/johnwick/400/600',
    backdrop: 'https://picsum.photos/seed/johnwickb/1400/800',
    rating: 7.4,
    year: 2014,
    duration: 101,
    price: 3.99,
    genre: 'Action',
    description: 'Un ancien tueur reprend du service.'
  },
  {
    id: 6,
    title: 'Mad Max Fury Road',
    poster: 'https://picsum.photos/seed/madmax/400/600',
    backdrop: 'https://picsum.photos/seed/madmaxb/1400/800',
    rating: 8.1,
    year: 2015,
    duration: 120,
    price: 4.99,
    genre: 'Action',
    description: 'Course poursuite explosive dans le desert.'
  },
  {
    id: 7,
    title: 'Top Gun Maverick',
    poster: 'https://picsum.photos/seed/topgun/400/600',
    backdrop: 'https://picsum.photos/seed/topgunb/1400/800',
    rating: 8.2,
    year: 2022,
    duration: 130,
    price: 5.99,
    genre: 'Action',
    description: 'Retour de Maverick dans une mission impossible.'
  },
  {
    id: 8,
    title: 'Mission Impossible Fallout',
    poster: 'https://picsum.photos/seed/fallout/400/600',
    backdrop: 'https://picsum.photos/seed/falloutb/1400/800',
    rating: 7.7,
    year: 2018,
    duration: 147,
    price: 4.99,
    genre: 'Action',
    description: 'Ethan Hunt doit eviter une catastrophe mondiale.'
  },
  {
    id: 9,
    title: 'The Batman',
    poster: 'https://picsum.photos/seed/thebatman/400/600',
    backdrop: 'https://picsum.photos/seed/thebatmanb/1400/800',
    rating: 7.8,
    year: 2022,
    duration: 176,
    price: 4.99,
    genre: 'Action',
    description: 'Batman affronte le Riddler dans une Gotham sombre.'
  },
  {
    id: 10,
    title: 'Dune',
    poster: 'https://picsum.photos/seed/dune/400/600',
    backdrop: 'https://picsum.photos/seed/duneb/1400/800',
    rating: 8.0,
    year: 2021,
    duration: 155,
    price: 5.99,
    genre: 'Science-Fiction',
    description: 'Un heritier doit proteger la planete Arrakis.'
  }
]

function pickRandomMovies(items, count) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count)
}

function Home() {
  const featuredMovie = allMovies[0]
  const popularMovies = pickRandomMovies(allMovies, 5)
  const actionMovies = allMovies.filter((movie) => movie.genre === 'Action').slice(0, 5)
  const recentMovies = allMovies.filter((movie) => movie.year > 2010).slice(0, 5)

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Header />
      <main className="pb-8 pt-16">
        <MovieHero movie={featuredMovie} />
        <MovieCarousel title="Films populaires" movies={popularMovies} />
        <MovieCarousel title="Selection Action" movies={actionMovies} />
        <MovieCarousel title="Films recents" movies={recentMovies} />
      </main>
      <Footer />
    </div>
  )
}

export default Home
