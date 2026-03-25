import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      maxlength: [2000, "La description ne peut pas dépasser 2000 caractères"],
    },
    poster: {
      type: String,
      required: [true, "L'affiche est requise"],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "L'URL de l'affiche doit être valide",
      },
    },
    backdrop: {
      type: String,
      required: [true, "L'image de fond est requise"],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "L'URL de l'image de fond doit être valide",
      },
    },
    genre: {
      type: [String],
      required: [true, "Le genre est requis"],
      validate: {
        validator: function (v) {
          return v && v.length > 0 && v.length <= 5;
        },
        message: "La liste des genres doit contenir entre 1 et 5 genres.",
      },
      enum: {
        values: [
          "Action",
          "Comédie",
          "Drame",
          "Science-Fiction",
          "Horreur",
          "Thriller",
          "Romance",
          "Animation",
          "Documentaire",
        ],
        message: "'{VALUE}' n'est pas un genre valide",
      },
    },
    year: {
      type: Number,
      required: [true, "L'année est requise"],
      min: [1900, "L'année doit être supérieure à 1900"],
      max: [
        new Date().getFullYear() + 2,
        "L'année ne peut pas être dans un futur lointain",
      ],
    },
    duration: {
      type: Number,
      required: [true, "La durée est requise"],
      min: [1, "La durée doit être positive"],
      validate: {
        validator: function (v) {
          // La durée doit être entre 1 et 500 minutes
          return v > 0 && v <= 500;
        },
        message: "La durée doit être entre 1 et 500 minutes",
      },
    },
    price: {
      type: Number,
      required: [true, "Le prix est requis"],
      min: [0, "Le prix doit être positif"],
      default: 3.99,
      validate: {
        validator: function (v) {
          // Le prix doit avoir maximum 2 décimales
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: "Le prix doit avoir au maximum 2 décimales",
      },
    },
    rating: {
      type: Number,
      min: [0, "La note doit être entre 0 et 10"],
      max: [10, "La note doit être entre 0 et 10"],
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rentalCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// INDEX pour la recherche
movieSchema.index({ title: "text", description: "text" });
movieSchema.index({ genre: 1 });
movieSchema.index({ year: -1 });
movieSchema.index({ rating: -1 });

// VIRTUAL pour la durée formatée
movieSchema.virtual("durationFormatted").get(function () {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`;
});

// MÉTHODE pour incrémenter le compteur de location
movieSchema.methods.incrementRentalCount = async function () {
  return await this.constructor.findByIdAndUpdate(
    this._id,
    { $inc: { rentalCount: 1 } },
    { new: true }
  );
};

// MÉTHODE STATIQUE pour obtenir les films récents
movieSchema.statics.getRecentMovies = function (limit = 10) {
  return this.find({ isAvailable: true }).sort({ year: -1 }).limit(limit);
};

// MÉTHODE STATIQUE pour obtenir les films populaires
movieSchema.statics.getPopularMovies = function (limit = 10) {
  return this.find({ isAvailable: true })
    .sort({ rentalCount: -1, rating: -1 })
    .limit(limit);
};

// MÉTHODE STATIQUE pour obtenir des films aléatoires
movieSchema.statics.getRandomMovies = function (limit = 10) {
  return this.aggregate([
    { $match: { isAvailable: true } },
    { $sample: { size: limit } },
  ]);
};

// MÉTHODE STATIQUE pour rechercher des films
movieSchema.statics.search = function (query) {
  return this.find({
    $text: { $search: query },
    isAvailable: true,
  }).sort({ score: { $meta: "textScore" } });
};

// Obtenir les films par genre
movieSchema.statics.getByGenre = function (genre) {
  return this.find({
    genre,
    isAvailable: true,
  }).sort({ rating: -1 });
};

// Obtenir les films dans une fourchette de prix
movieSchema.statics.getByPriceRange = function (minPrice, maxPrice) {
  return this.find({
    price: { $gte: minPrice, $lte: maxPrice },
    isAvailable: true,
  }).sort({ price: 1 });
};

// Obtenir les statistiques par genre
movieSchema.statics.getStatsByGenre = async function () {
  return await this.aggregate([
    {
      $match: { isAvailable: true },
    },
    {
      $group: {
        _id: "$genre",
        count: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        avgRating: { $avg: "$rating" },
        totalRentals: { $sum: "$rentalCount" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
