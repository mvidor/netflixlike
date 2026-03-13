import mongoose from 'mongoose';
import Movie from '../models/movie.js';
import Rental from '../models/rental.js';

const objectIdError = (message) => Object.assign(new Error(message), { statusCode: 400 });

const ensureObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw objectIdError(message);
};

const getMovieOr404 = async (id) => {
  ensureObjectId(id, 'ID invalide');
  const movie = await Movie.findById(id);
  if (!movie) throw Object.assign(new Error('Film introuvable'), { statusCode: 404 });
  return movie;
};

const getPagination = ({ page = '1', limit = '10' }) => {
  const currentPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const pageSize = Math.max(Number.parseInt(limit, 10) || 10, 1);
  return { currentPage, pageSize, skip: (currentPage - 1) * pageSize };
};

const buildMovieQuery = ({ genre, search, isAvailable, minYear, maxYear }) => {
  const query = {};

  if (genre) query.genre = genre;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (typeof isAvailable !== 'undefined') query.isAvailable = isAvailable === 'true';
  if (minYear || maxYear) {
    query.year = {};
    if (minYear) query.year.$gte = Number(minYear);
    if (maxYear) query.year.$lte = Number(maxYear);
  }

  return query;
};

const getSortOption = ({ sortBy = 'createdAt', order = 'desc' }) => {
  const allowed = ['createdAt', 'title', 'year', 'price', 'rating', 'rentalCount'];
  return { [allowed.includes(sortBy) ? sortBy : 'createdAt']: order === 'asc' ? 1 : -1 };
};

const sendPaginated = (res, { items, total, currentPage, pageSize }) =>
  res.status(200).json({
    success: true,
    count: items.length,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage,
    data: items,
  });

// @desc    Obtenir tous les films
// @route   GET /api/movies
// @access  Public
export const getAllMovies = async (req, res, next) => {
  try {
    const query = buildMovieQuery(req.query);
    const sort = getSortOption(req.query);
    const { currentPage, pageSize, skip } = getPagination(req.query);
    const [movies, total] = await Promise.all([
      Movie.find(query).sort(sort).skip(skip).limit(pageSize),
      Movie.countDocuments(query),
    ]);

    sendPaginated(res, { items: movies, total, currentPage, pageSize });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir un film par ID
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: await getMovieOr404(req.params.id) });
  } catch (error) {
    next(error);
  }
};

// @desc    Creer un nouveau film
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      poster,
      backdrop,
      genre,
      year,
      duration,
      price,
      rating,
    } = req.body;

    const movie = await Movie.create({
      title,
      description,
      poster,
      backdrop,
      genre,
      year,
      duration,
      price,
      rating,
    });

    res.status(201).json({ success: true, message: 'Film cree avec succes', data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Modifier un film
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res, next) => {
  try {
    ensureObjectId(req.params.id, 'ID invalide');
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) return res.status(404).json({ success: false, message: 'Film introuvable' });

    res.status(200).json({ success: true, message: 'Film mis a jour avec succes', data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un film
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await getMovieOr404(req.params.id);
    const rentalCount = await Rental.countDocuments({ movie: req.params.id });

    if (rentalCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Suppression impossible: ce film possede des locations',
      });
    }

    await movie.deleteOne();
    res.status(200).json({ success: true, message: 'Film supprime avec succes' });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques des films
// @route   GET /api/movies/stats
// @access  Private/Admin
export const getMovieStats = async (req, res, next) => {
  try {
    const [revenue, byGenre, totalMovies] = await Promise.all([
      Movie.aggregate([
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$rentalCount'] } } } },
      ]),
      Movie.aggregate([
        { $unwind: '$genre' },
        {
          $group: {
            _id: '$genre',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            avgRating: { $avg: '$rating' },
            totalRentals: { $sum: '$rentalCount' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Movie.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: { totalMovies, totalRevenue: revenue[0]?.total || 0, byGenre },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir des films similaires
// @route   GET /api/movies/:id/similar
// @access  Public
export const getSimilarMovies = async (req, res, next) => {
  try {
    const movie = await getMovieOr404(req.params.id);
    const similarMovies = await Movie.find({
      genre: { $in: movie.genre },
      _id: { $ne: movie._id },
      isAvailable: true,
    })
      .sort({ rating: -1 })
      .limit(6);

    res.status(200).json({ success: true, count: similarMovies.length, data: similarMovies });
  } catch (error) {
    next(error);
  }
};
