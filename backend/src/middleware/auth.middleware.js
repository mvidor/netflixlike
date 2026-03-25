import User from '../models/user.js';
import { extractToken, verifyToken } from '../utils/jwt.js';

/**
 * Middleware pour proteger les routes (utilisateur connecte)
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Verifier si le token est dans les headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = extractToken(req.headers.authorization);
    }

    // Verifier si le token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorise. Token manquant.',
      });
    }

    // Verifier le token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expire',
      });
    }

    // Verifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "L'utilisateur n'existe plus",
      });
    }

    // Verifier que le compte est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte desactive',
      });
    }

    // Ajouter l'utilisateur a la requete
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Non autorise',
    });
  }
};

/**
 * Middleware pour les routes admin uniquement
 */
export const admin = async (req, res, next) => {
  try {
  if (!req.user) {
    return res.status(401).json({
      success: false,
        message: 'Non autorise. Authentification requise.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
        message: 'Acces refuse. Droits administrateur requis.',
    });
  }

  next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Acces refuse',
    });
  }
};

/**
 * Middleware optionnel pour les routes qui peuvent etre publiques ou privees
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = extractToken(req.headers.authorization);
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};
