import express from 'express';
import {
  createRental,
  getMyRentals,
  getAllRentals,
  cancelRental,
  getRentalStats,
  getRecommendations,
} from '../controllers/rental.controller.js';
// import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllRentals);
router.get('/my-rentals', getMyRentals);
router.get('/recommendations', getRecommendations);
router.get('/stats', getRentalStats);
router.post('/', createRental);
router.delete('/:id', cancelRental);

export default router;
