import express from 'express';
import {
  createRental,
  getMyRentals,
  getAllRentals,
  cancelRental,
  getRentalStats,
  getRecommendations,
} from '../controllers/rental.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, admin, getAllRentals);
router.get('/my-rentals', protect, getMyRentals);
router.get('/recommendations', protect, getRecommendations);
router.get('/stats', protect, admin, getRentalStats);
router.post('/', protect, createRental);
router.delete('/:id', protect, cancelRental);

export default router;
