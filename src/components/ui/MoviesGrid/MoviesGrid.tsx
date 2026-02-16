import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Movie } from "../../../features/movies/moviesTypes";
import MovieCard from "../MovieCard";
import {
  useKeyboardNavigation,
  scrollToElement,
  setActiveComponent,
  registerNavigationCallback,
  navigateToComponent,
} from "../../../hooks/useKeyboardNavigation";
import "./MoviesGrid.css";

interface Props {
  movies: Movie[];
}

const COLUMNS = 4; // 4 cards per row

const MovieGrid = ({ movies }: Props) => {
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGridFocus = () => {
      setActiveComponent("movies-grid");
    };

    const handleGridBlur = () => {
      setActiveComponent(null);
    };

    const grid = gridRef.current;
    if (grid) {
      grid.addEventListener("mouseenter", handleGridFocus);
      grid.addEventListener("mouseleave", handleGridBlur);
    }

    // Register boundary navigation callback
    registerNavigationCallback("movies-grid", (direction) => {
      if (direction === "up") {
        // Coming from filter bar above, focus first card
        setFocusedIndex(0);
        // Scroll to first card after the state updates
        setTimeout(() => {
          if (cardRefs.current[0]) {
            scrollToElement(cardRefs.current[0]);
          }
        }, 0);
      } else if (direction === "down") {
        // Coming from pagination below, focus last visible row
        const lastRowStart = Math.max(0, movies.length - COLUMNS);
        setFocusedIndex(lastRowStart);
        setTimeout(() => {
          if (cardRefs.current[lastRowStart]) {
            scrollToElement(cardRefs.current[lastRowStart]);
          }
        }, 0);
      }
      // If coming from below (direction="down"), stay at current focus or scroll to last visible
    });

    return () => {
      if (grid) {
        grid.removeEventListener("mouseenter", handleGridFocus);
        grid.removeEventListener("mouseleave", handleGridBlur);
      }
    };
  }, [movies.length]);

  useKeyboardNavigation(
    {
      onArrowDown: () => {
        const newIndex =
          focusedIndex === -1
            ? 0
            : Math.min(movies.length - 1, focusedIndex + COLUMNS);

        // Check if already at or past the last row
        const isAtLastRow = newIndex >= movies.length - COLUMNS;
        if (isAtLastRow && focusedIndex >= movies.length - COLUMNS) {
          // Already at last row, try to navigate to pagination
          navigateToComponent("pagination", "up");
          return;
        }

        setFocusedIndex(newIndex);
        scrollToElement(cardRefs.current[newIndex]);
      },
      onArrowUp: () => {
        // Detect if trying to go up beyond first row
        if (focusedIndex !== -1 && focusedIndex < COLUMNS) {
          // At first row, navigate to filter bar
          navigateToComponent("filter-bar", "down");
          return;
        }

        const newIndex =
          focusedIndex === -1 ? 0 : Math.max(0, focusedIndex - COLUMNS);
        setFocusedIndex(newIndex);
        scrollToElement(cardRefs.current[newIndex]);
      },
      onArrowRight: () => {
        const newIndex =
          focusedIndex === -1
            ? 0
            : Math.min(movies.length - 1, focusedIndex + 1);
        setFocusedIndex(newIndex);
        scrollToElement(cardRefs.current[newIndex]);
      },
      onArrowLeft: () => {
        const newIndex =
          focusedIndex === -1 ? 0 : Math.max(0, focusedIndex - 1);
        setFocusedIndex(newIndex);
        scrollToElement(cardRefs.current[newIndex]);
      },
      onEnter: () => {
        if (focusedIndex !== -1 && movies[focusedIndex]) {
          navigate(`/movie/${movies[focusedIndex].id}`);
        }
      },
    },
    "movies-grid",
  );

  return (
    <div
      className={`movies-grid ${movies.length === 0 ? "empty" : ""}`}
      ref={gridRef}
    >
      {movies.length === 0 ? (
        <div className="movies-grid__empty" role="status" aria-live="polite">
          <h3 className="movies-grid__empty-title">No movies found</h3>
          <p className="movies-grid__empty-sub">Try adjusting your search or filters.</p>
        </div>
      ) : (
        movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            isFocused={focusedIndex === index}
          />
        ))
      )}
    </div>
  );
};

export default MovieGrid;
