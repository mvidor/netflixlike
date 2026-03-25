import express from 'express';
import {
  getAllMovies,
  getRandomMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieStats,
  getSimilarMovies,
} from '../controllers/movie.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/random', getRandomMovies);
router.get('/', getAllMovies);
router.get('/stats', protect, admin, getMovieStats);
router.get('/:id/similar', getSimilarMovies);
router.get('/:id', getMovieById);

// Routes protegees admin
router.post('/', protect, admin, createMovie);
router.put('/:id', protect, admin, updateMovie);
router.delete('/:id', protect, admin, deleteMovie);

export default router;
