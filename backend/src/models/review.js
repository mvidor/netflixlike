import mongoose from "mongoose";
import Movie from "./movie.js";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'utilisateur est requis"],
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Le film est requis"],
    },
    rating: {
      type: Number,
      required: [true, "La note est requise"],
      min: [1, "La note minimale est 1"],
      max: [5, "La note maximale est 5"],
    },
    comment: {
      type: String,
      required: [true, "Le commentaire est requis"],
      trim: true,
      maxlength: [1000, "Le commentaire ne peut pas dépasser 1000 caractères"],
    },
  },
  {
    timestamps: true,
  }
);


reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function (movieId) {
  const result = await this.aggregate([
    {
      $match: { movie: movieId },
    },
    {
      $group: {
        _id: "$movie",
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  const average = result.length > 0 ? Number(result[0].avgRating.toFixed(2)) : 0;
  await Movie.findByIdAndUpdate(movieId, { rating: average });
};

reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.movie);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.movie);
  }
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
