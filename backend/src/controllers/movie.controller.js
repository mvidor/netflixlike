import mongoose from 'mongoose';
import Movie from '../models/movie.js';
import Rental from '../models/rental.js';

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

const buildSortOption = (sortBy = 'createdAt', order = 'desc') => {
  const allowedSortFields = ['createdAt', 'title', 'year', 'price', 'rating', 'rentalCount'];
  const field = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  return { [field]: order === 'asc' ? 1 : -1 };
};

// @desc    Obtenir tous les films
// @route   GET /api/movies
// @access  Public
export const getAllMovies = async (req, res, next) => {
  try {
    const {
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      order = 'desc',
      genre,
      search,
      isAvailable,
      minYear,
      maxYear,
    } = req.query;

    const currentPage = parsePositiveInt(page, 1);
    const pageSize = parsePositiveInt(limit, 10);
    const skip = (currentPage - 1) * pageSize;

    const query = {};

    if (genre) {
      query.genre = genre;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (typeof isAvailable !== 'undefined') {
      query.isAvailable = isAvailable === 'true';
    }

    if (minYear || maxYear) {
      query.year = {};
      if (minYear) {
        query.year.$gte = Number(minYear);
      }
      if (maxYear) {
        query.year.$lte = Number(maxYear);
      }
    }

    const sortOption = buildSortOption(sortBy, order);

    const movies = await Movie.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    const total = await Movie.countDocuments(query);

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir un film par ID
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      });
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Film introuvable',
      });
    }

    return res.status(200).json({
      success: true,
      data: movie,
    });
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

    return res.status(201).json({
      success: true,
      message: 'Film cree avec succes',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Modifier un film
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      });
    }

    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedMovie) {
      return res.status(404).json({
        success: false,
        message: 'Film introuvable',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Film mis a jour avec succes',
      data: updatedMovie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un film
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      });
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Film introuvable',
      });
    }

    const rentalCount = await Rental.countDocuments({ movie: id });

    if (rentalCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Suppression impossible: ce film possede des locations',
      });
    }

    await movie.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Film supprime avec succes',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques des films
// @route   GET /api/movies/stats
// @access  Private/Admin
export const getMovieStats = async (req, res, next) => {
  try {
    const totalRevenue = await Movie.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$price', '$rentalCount'] } },
        },
      },
    ]);

    const byGenre = await Movie.aggregate([
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
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalMovies: await Movie.countDocuments(),
        totalRevenue: totalRevenue[0]?.total || 0,
        byGenre,
      },
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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      });
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Film introuvable',
      });
    }

    const similarMovies = await Movie.find({
      genre: { $in: movie.genre },
      _id: { $ne: movie._id },
      isAvailable: true,
    })
      .sort({ rating: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      count: similarMovies.length,
      data: similarMovies,
    });
  } catch (error) {
    next(error);
  }
};
