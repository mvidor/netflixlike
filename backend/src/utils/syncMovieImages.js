import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from '../config/database.js';
import Movie from '../models/movie.js';
import { searchMovieImages } from './tmdb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

export const syncMovieImages = async () => {
  try {
    await connectDB();

    const movies = await Movie.find().sort({ createdAt: 1 });
    console.log(`Recherche TMDB pour ${movies.length} film(s)...`);

    let updatedCount = 0;

    for (const movie of movies) {
      try {
        const result = await searchMovieImages({ title: movie.title, year: movie.year });

        if (!result?.poster && !result?.backdrop) {
          console.log(`Aucune image trouvée pour "${movie.title}"`);
          continue;
        }

        let changed = false;

        if (result.poster && movie.poster !== result.poster) {
          movie.poster = result.poster;
          changed = true;
        }

        if (result.backdrop && movie.backdrop !== result.backdrop) {
          movie.backdrop = result.backdrop;
          changed = true;
        }

        if (changed) {
          await movie.save();
          updatedCount += 1;
          console.log(`Images mises à jour pour "${movie.title}"`);
        } else {
          console.log(`Images déjà à jour pour "${movie.title}"`);
        }
      } catch (error) {
        console.log(`Échec pour "${movie.title}": ${error.message}`);
      }
    }

    console.log(`Synchronisation terminée. ${updatedCount} film(s) mis à jour.`);
    process.exit(0);
  } catch (error) {
    console.error(`Erreur pendant la synchronisation: ${error.message}`);
    process.exit(1);
  }
};

const currentFilePath = fileURLToPath(import.meta.url);
const entryFilePath = process.argv[1];

if (entryFilePath && currentFilePath === entryFilePath) {
  syncMovieImages();
}
