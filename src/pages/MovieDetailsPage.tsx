import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMovieDetails,
  addFavoriteMovie,
  removeFavoriteMovie,
  isFavorite,
} from "../utils/api";
import type { MovieDetails, Movie } from "../features/movies/moviesTypes";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import "./MovieDetailsPage.css";

export default function MovieDetailsPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const response = await getMovieDetails(Number(movieId));
        setMovie(response.data);
        setIsFav(isFavorite(Number(movieId)));
      } catch (error) {
        console.error("Failed to fetch movie details", error);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  useKeyboardNavigation({
    onEscape: () => {
      navigate("/");
    },
    onArrowUp: () => {
      window.scrollBy({ top: -100, behavior: "smooth" });
    },
    onArrowDown: () => {
      window.scrollBy({ top: 100, behavior: "smooth" });
    },
  });

  const handleFavoriteToggle = () => {
    if (movie) {
      if (isFav) {
        removeFavoriteMovie(movie.id);
      } else {
        const movieToAdd: Movie = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
        };
        addFavoriteMovie(movieToAdd);
      }
      setIsFav(!isFav);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-details__container">
        <div className="movie-details__not-found">
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            ⬅️ Back to Movies
          </button>
          <h2>Movie not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-details__container">
      <button className="btn btn-primary" onClick={() => navigate("/")}>
        ⬅️ Back to Movies
      </button>

      <div className="movie-details__grid">
        <div className="movie-details__poster">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="movie-details__poster-image"
          />
        </div>

        <div className="movie-details__content">
          <h1 className="movie-details__title">{movie.title}</h1>

          {movie.tagline && (
            <p className="movie-details__tagline">{movie.tagline}</p>
          )}

          <div className="movie-details__meta">
            <p>
              <strong>Release Date:</strong> {movie.release_date}
            </p>
            {movie.runtime > 0 && (
              <p>
                <strong>Runtime:</strong> {movie.runtime} minutes
              </p>
            )}
          </div>

          <div className="movie-details__genres">
            {movie.genres &&
              movie.genres.length > 0 &&
              movie.genres.map((genre) => (
                <span key={genre.id} className="genre-chip">
                  {genre.name}
                </span>
              ))}
          </div>

          <div className="movie-details__rating">
            <div>
              <p className="movie-details__label">Rating</p>
              <p className="movie-details__rating-value">
                {movie.vote_average.toFixed(1)}/10
              </p>
              <p className="movie-details__vote-count">
                ({movie.vote_count} votes)
              </p>
            </div>
          </div>

          <div className="movie-details__overview">
            <h3>Overview</h3>
            <p>{movie.overview}</p>
          </div>

          {movie.budget > 0 && (
            <p>
              <strong>Budget:</strong> ${(movie.budget / 1000000).toFixed(1)}M
            </p>
          )}

          {movie.revenue > 0 && (
            <p>
              <strong>Revenue:</strong> ${(movie.revenue / 1000000).toFixed(1)}M
            </p>
          )}

          <div className="movie-details__actions">
            <button
              className="btn btn-contained"
              onClick={handleFavoriteToggle}
            >
              {isFav ? "❤️ Remove from Favorites" : "♡ Add to Favorites"}
            </button>
          </div>
        </div>
      </div>

      {movie.backdrop_path && (
        <div className="movie-details__backdrop">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="movie-details__backdrop-image"
          />
        </div>
      )}
    </div>
  );
}
