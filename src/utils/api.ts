import axiosInstance from "./axiosInstance";
import type { Movie } from "../features/movies/moviesTypes";

const STORAGE_KEYS = {
  FAVORITES: "app:favorites:movies",
} as const;

// API endpoints
export const getPopularMovies = (page: number) =>
  axiosInstance.get("/movie/popular", { params: { page } });

export const getNowPlayingMovies = (page: number) =>
  axiosInstance.get("/movie/now_playing", { params: { page } });

export const getMovieDetails = (movieId: number) =>
  axiosInstance.get(`/movie/${movieId}`);

// Favorites management with error handling
export const getFavoriteMovies = (): Movie[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse favorites from localStorage:", error);
    return [];
  }
};

export const addFavoriteMovie = (movie: Movie): boolean => {
  try {
    if (!movie.id || !movie.title || !movie.poster_path) {
      console.warn("Invalid movie object: missing required fields");
      return false;
    }

    const favorites = getFavoriteMovies();
    const alreadyExists = favorites.some((m) => m.id === movie.id);

    if (!alreadyExists) {
      favorites.push(movie);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to add favorite movie:", error);
    return false;
  }
};

export const removeFavoriteMovie = (movieId: number): boolean => {
  try {
    if (!movieId) {
      console.warn("Invalid movieId for removal");
      return false;
    }

    const favorites = getFavoriteMovies();
    const filtered = favorites.filter((m) => m.id !== movieId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to remove favorite movie:", error);
    return false;
  }
};

export const isFavorite = (movieId: number): boolean => {
  try {
    const favorites = getFavoriteMovies();
    return favorites.some((m) => m.id === movieId);
  } catch (error) {
    console.error("Failed to check favorite status:", error);
    return false;
  }
};

export const clearAllFavorites = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
  } catch (error) {
    console.error("Failed to clear favorites:", error);
  }
};
