import mongoose from 'mongoose';
import Rental from '../models/rental.js';
import Movie from '../models/movie.js';
import User from '../models/user.js';

const getRequestUserId = (req) => req.user?._id || req.query.userId || req.body.userId || req.headers['x-user-id'];

const ensureValidObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
};

const ensureUserExists = async (userId) => {
  ensureValidObjectId(userId, 'ID utilisateur invalide');
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const requireUserId = (req) => {
  const userId = getRequestUserId(req);

  if (!userId) {
    const error = new Error('Authentification requise: fournissez userId ou x-user-id');
    error.statusCode = 401;
    throw error;
  }

  return userId;
};

// @desc    Louer un film
// @route   POST /api/rentals
// @access  Private
export const createRental = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const { movie: movieId, movieId: bodyMovieId } = req.body;
    const targetMovieId = bodyMovieId || movieId;

    await ensureUserExists(userId);

    if (!targetMovieId) {
      return res.status(400).json({
        success: false,
        message: 'movieId est requis',
      });
    }

    ensureValidObjectId(targetMovieId, 'ID film invalide');

    const movie = await Movie.findById(targetMovieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Film introuvable',
      });
    }

    if (!movie.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Ce film nest pas disponible a la location',
      });
    }

    const activeRental = await Rental.findOne({
      user: userId,
      movie: targetMovieId,
      status: 'active',
      expiryDate: { $gt: new Date() },
    });

    if (activeRental) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez deja une location active pour ce film',
      });
    }

    const rental = await Rental.create({
      user: userId,
      movie: targetMovieId,
      price: movie.price,
    });

    await movie.incrementRentalCount();

    const populatedRental = await Rental.findById(rental._id)
      .populate('movie')
      .populate('user', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Location creee avec succes',
      data: populatedRental,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les locations d'un utilisateur
// @route   GET /api/rentals/my-rentals
// @access  Private
export const getMyRentals = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const { status } = req.query;

    await ensureUserExists(userId);

    const query = { user: userId };

    if (status) {
      query.status = status;
    }

    const rentals = await Rental.find(query)
      .populate('movie')
      .populate('user', 'name email role')
      .sort({ rentalDate: -1 });

    return res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir toutes les locations (admin)
// @route   GET /api/rentals
// @access  Private/Admin
export const getAllRentals = async (req, res, next) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const currentPage = Number.parseInt(page, 10) || 1;
    const pageSize = Number.parseInt(limit, 10) || 10;
    const skip = (currentPage - 1) * pageSize;

    const query = {};
    if (status) {
      query.status = status;
    }

    const rentals = await Rental.find(query)
      .populate('movie')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Rental.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: rentals.length,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage,
      data: rentals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Annuler une location
// @route   DELETE /api/rentals/:id
// @access  Private
export const cancelRental = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const { id } = req.params;

    await ensureUserExists(userId);
    ensureValidObjectId(id, 'ID location invalide');

    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Location introuvable',
      });
    }

    if (String(rental.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas annuler cette location',
      });
    }

    await rental.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Location supprimee avec succes',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques des locations
// @route   GET /api/rentals/stats
// @access  Private/Admin
export const getRentalStats = async (req, res, next) => {
  try {
    const totalRevenue = await Rental.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' },
          totalRentals: { $sum: 1 },
        },
      },
    ]);

    const rentalsByStatus = await Rental.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const topMovies = await Rental.aggregate([
      {
        $group: {
          _id: '$movie',
          count: { $sum: 1 },
          revenue: { $sum: '$price' },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie',
        },
      },
      {
        $unwind: '$movie',
      },
      {
        $project: {
          _id: 1,
          count: 1,
          revenue: 1,
          title: '$movie.title',
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totals: totalRevenue[0] || {
          totalRevenue: 0,
          totalRentals: 0,
        },
        byStatus: rentalsByStatus,
        topMovies,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir des recommandations personnalisees
// @route   GET /api/rentals/recommendations
// @access  Private
export const getRecommendations = async (req, res, next) => {
  try {
    const userId = requireUserId(req);

    await ensureUserExists(userId);

    const rentalHistory = await Rental.find({ user: userId })
      .populate('movie')
      .sort({ rentalDate: -1 });

    if (rentalHistory.length === 0) {
      const popularMovies = await Movie.find({ isAvailable: true })
        .sort({ rentalCount: -1, rating: -1 })
        .limit(6);

      return res.status(200).json({
        success: true,
        message: 'Aucun historique: recommandations basees sur les films populaires',
        count: popularMovies.length,
        data: popularMovies,
      });
    }

    const genreCount = {};

    rentalHistory.forEach((rental) => {
      if (!rental.movie?.genre) {
        return;
      }

      rental.movie.genre.forEach((genre) => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    });

    const preferredGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);

    const rentedMovieIds = rentalHistory
      .map((rental) => rental.movie?._id)
      .filter(Boolean);

    const recommendations = await Movie.find({
      genre: { $in: preferredGenres },
      _id: { $nin: rentedMovieIds },
      isAvailable: true,
    })
      .sort({ rating: -1, rentalCount: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      preferredGenres,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};
