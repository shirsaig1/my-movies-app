import { useEffect, useState, useRef } from "react";
import type { Movie } from "../../../features/movies/moviesTypes";
import { getRecommendedMovies } from "../../../utils/api";
import MovieCard from "../MovieCard";
import "./Carousel.css";

export default function Carousel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    getRecommendedMovies()
      .then((res) => {
        if (!mounted) return;
        const results = res?.data?.results ?? [];
        setMovies(results.slice(0, 10));
      })
      .catch((err) => {
        console.error("Failed to load recommended movies:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const offset = el.clientWidth * 0.7;
    el.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  if (movies.length === 0) return null;

  return (
    <div className="carousel">
      <button
        className="carousel__nav carousel__nav--left"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
      >
        ‹
      </button>
      <div className="carousel__container" ref={containerRef}>
        {movies.map((m) => (
          <div className="carousel__item" key={m.id}>
            <MovieCard movie={m} />
          </div>
        ))}
      </div>
      <button
        className="carousel__nav carousel__nav--right"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
}
