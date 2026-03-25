import mongoose from 'mongoose';
import Rental from '../models/rental.js';
import Movie from '../models/movie.js';
import User from '../models/user.js';

const objectIdError = (message) => Object.assign(new Error(message), { statusCode: 400 });

const ensureObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw objectIdError(message);
};

const getRequestUserId = (req) => req.user?._id || req.query.userId || req.body.userId || req.headers['x-user-id'];

const requireUserId = (req) => {
  const userId = getRequestUserId(req);
  if (!userId) throw Object.assign(new Error('Authentification requise: fournissez userId ou x-user-id'), { statusCode: 401 });
  return userId;
};

const getUserOr404 = async (userId) => {
  ensureObjectId(userId, 'ID utilisateur invalide');
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('Utilisateur introuvable'), { statusCode: 404 });
  return user;
};

const getRentalOr404 = async (id) => {
  ensureObjectId(id, 'ID location invalide');
  const rental = await Rental.findById(id);
  if (!rental) throw Object.assign(new Error('Location introuvable'), { statusCode: 404 });
  return rental;
};

const getPagination = ({ page = '1', limit = '10' }) => {
  const currentPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const pageSize = Math.max(Number.parseInt(limit, 10) || 10, 1);
  return { currentPage, pageSize, skip: (currentPage - 1) * pageSize };
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

const populatedRentalQuery = (query = {}) =>
  Rental.find(query).populate('movie').populate('user', 'name email role');

// @desc    Louer un film
// @route   POST /api/rentals
// @access  Private
export const createRental = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const targetMovieId = req.body.movieId || req.body.movie;

    await getUserOr404(userId);
    if (!targetMovieId) return res.status(400).json({ success: false, message: 'movieId est requis' });

    ensureObjectId(targetMovieId, 'ID film invalide');
    const movie = await Movie.findById(targetMovieId);
    if (!movie) return res.status(404).json({ success: false, message: 'Film introuvable' });
    if (!movie.isAvailable) {
      return res.status(400).json({ success: false, message: 'Ce film nest pas disponible a la location' });
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

    const rental = await Rental.create({ user: userId, movie: targetMovieId, price: movie.price });
    await movie.incrementRentalCount();

    res.status(201).json({
      success: true,
      message: 'Location creee avec succes',
      data: await populatedRentalQuery({ _id: rental._id }).findOne(),
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
    await getUserOr404(userId);

    const query = { user: userId };
    if (req.query.status) query.status = req.query.status;

    const rentals = await populatedRentalQuery(query).sort({ rentalDate: -1 });
    res.status(200).json({ success: true, count: rentals.length, data: rentals });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir toutes les locations (admin)
// @route   GET /api/rentals
// @access  Private/Admin
export const getAllRentals = async (req, res, next) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const { currentPage, pageSize, skip } = getPagination(req.query);
    const [rentals, total] = await Promise.all([
      populatedRentalQuery(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Rental.countDocuments(query),
    ]);

    sendPaginated(res, { items: rentals, total, currentPage, pageSize });
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
    await getUserOr404(userId);

    const rental = await getRentalOr404(req.params.id);
    if (String(rental.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas annuler cette location',
      });
    }

    rental.status = 'cancelled';
    await rental.save();

    res.status(200).json({ success: true, message: 'Location annulee avec succes' });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques des locations
// @route   GET /api/rentals/stats
// @access  Private/Admin
export const getRentalStats = async (req, res, next) => {
  try {
    const [totals, byStatus, topMovies] = await Promise.all([
      Rental.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$price' }, totalRentals: { $sum: 1 } } },
      ]),
      Rental.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Rental.aggregate([
        { $group: { _id: '$movie', count: { $sum: 1 }, revenue: { $sum: '$price' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
        { $unwind: '$movie' },
        { $project: { _id: 1, count: 1, revenue: 1, title: '$movie.title' } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totals: totals[0] || { totalRevenue: 0, totalRentals: 0 },
        byStatus,
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
    await getUserOr404(userId);

    const rentalHistory = await Rental.find({ user: userId }).populate('movie').sort({ rentalDate: -1 });
    if (!rentalHistory.length) {
      const popularMovies = await Movie.find({ isAvailable: true }).sort({ rentalCount: -1, rating: -1 }).limit(6);
      return res.status(200).json({
        success: true,
        message: 'Aucun historique: recommandations basees sur les films populaires',
        count: popularMovies.length,
        data: popularMovies,
      });
    }

    const genreCount = {};
    for (const rental of rentalHistory) {
      for (const genre of rental.movie?.genre || []) genreCount[genre] = (genreCount[genre] || 0) + 1;
    }

    const preferredGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).map(([genre]) => genre);
    const rentedMovieIds = rentalHistory.map((rental) => rental.movie?._id).filter(Boolean);
    const recommendations = await Movie.find({
      genre: { $in: preferredGenres },
      _id: { $nin: rentedMovieIds },
      isAvailable: true,
    })
      .sort({ rating: -1, rentalCount: -1 })
      .limit(6);

    res.status(200).json({ success: true, preferredGenres, count: recommendations.length, data: recommendations });
  } catch (error) {
    next(error);
  }
};
