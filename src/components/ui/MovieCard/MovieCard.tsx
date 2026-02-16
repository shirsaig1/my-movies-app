import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import type { Movie } from "../../../features/movies/moviesTypes";
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

    return (
      <button
        ref={ref}
        className={`movie-card ${isFocused ? "movie-card--focused" : ""}`}
        onClick={handleClick}
        type="button"
      >
        <img src={imageUrl} alt={movie.title} className="movie-card__image" />
        <div className="movie-card__body">
          <p className="movie-card__title">{movie.title}</p>
        </div>
      </button>
    );
  },
);

MovieCard.displayName = "MovieCard";

export default MovieCard;
