import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protegees
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;
