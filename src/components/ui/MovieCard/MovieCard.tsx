import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import type { Movie, MovieDetails } from "../../../features/movies/moviesTypes";
import "./MovieCard.css";

interface Props {
  movie: Movie;
  isFocused?: boolean;
}

const MovieCard = forwardRef<HTMLButtonElement, Props>(
  ({ movie, isFocused = false }, ref) => {
    const navigate = useNavigate();
    const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    const handleClick = () => {
      navigate(`/movie/${movie.id}`);
    };

    const isMovieDetails = (m: Movie | MovieDetails): m is MovieDetails => {
      return (
        typeof (m as MovieDetails).vote_average === "number" ||
        typeof (m as MovieDetails).release_date === "string"
      );
    };

    return (
      <button
        ref={ref}
        className={`movie-card ${isFocused ? "movie-card--focused" : ""}`}
        onClick={handleClick}
        type="button"
        aria-label={`Open details for ${movie.title}`}
      >
        <div className="movie-card__media">
          <img src={imageUrl} alt={movie.title} className="movie-card__image" />

          {isMovieDetails(movie) && (
            <div className="movie-card__badge">
              {Math.round(movie.vote_average * 10) / 10}
            </div>
          )}

          <div className="movie-card__overlay">
            <div className="movie-card__overlay-content">
              <p className="movie-card__title">{movie.title}</p>
              {isMovieDetails(movie) && movie.release_date && (
                <small className="movie-card__meta">
                  {new Date(movie.release_date).getFullYear()}
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="movie-card__body" aria-hidden>
          <p className="movie-card__title movie-card__title--body">
            {movie.title}
          </p>
        </div>
      </button>
    );
  },
);

MovieCard.displayName = "MovieCard";

export default MovieCard;
