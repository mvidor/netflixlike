import express from 'express';
import {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieStats,
  getSimilarMovies,
} from '../controllers/movie.controller.js';
// import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllMovies);
router.get('/stats', getMovieStats); // TODO: proteger avec admin
router.get('/:id', getMovieById);
router.get('/:id/similar', getSimilarMovies);

// Routes protegees admin (sera active seance 9)
// router.post('/', protect, admin, createMovie);
// router.put('/:id', protect, admin, updateMovie);
// router.delete('/:id', protect, admin, deleteMovie);

// Routes temporaires sans authentification (pour tester)
router.post('/', createMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

export default router;
