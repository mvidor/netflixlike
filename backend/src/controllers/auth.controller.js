import User from '../models/user.js';
import { generateToken } from '../utils/jwt.js';

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation des champs obligatoire name,mail,password
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'name, email et password sont requis',
      });
    }

    // Validation du mot de passe >6 caract
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caracteres',
      });
    }

    // Verifier si l'email existe deja
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est deja utilise',
      });
    }

    // Creer l'utilisateur
    // inutile de hasher le mot de passe, il le sera automatiquement par le middleware pre-save
    const user = await User.create({ name, email, password });

    // Generer le token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Inscription reussie',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((entry) => entry.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages,
      });
    }

    next(error);
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email et password sont requis',
      });
    }

    // Trouver l'utilisateur (inclure le password pour la comparaison)
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    // Verifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    // Verifier si le compte est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte desactive',
      });
    }

    // Generer le token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Connexion reussie',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir le profil de l'utilisateur connecte
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toJSON(),
  });
};

// @desc    Mettre a jour le profil
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;
    const user = req.user;

    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est deja utilise',
        });
      }
      user.email = email;
    }

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (typeof avatar === 'string' && avatar.trim()) {
      user.avatar = avatar.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil mis a jour',
      user: user.toJSON(),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((entry) => entry.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages,
      });
    }

    next(error);
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword et newPassword sont requis',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caracteres',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Mot de passe mis a jour',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deconnexion (cote client principalement)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Deconnexion reussie',
    });
  } catch (error) {
    next(error);
  }
};
