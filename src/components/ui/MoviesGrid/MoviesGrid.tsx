import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { Movie } from "../../../features/movies/moviesTypes";
import type { RootState } from "../../../store/store";
import {
  setGlobalFocus,
  updateFocusIndex,
} from "../../../features/focus/focusSlice";
import MovieCard from "../MovieCard";
import {
  useKeyboardNavigation,
  scrollToElement,
  setActiveComponent,
} from "../../../hooks/useKeyboardNavigation";
import "./MoviesGrid.css";

interface Props {
  movies: Movie[];
}

const COLUMNS = 4; // 4 cards per row

const MovieGrid = ({ movies }: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { section, index: globalFocusIndex } = useSelector(
    (state: RootState) => state.focus,
  );
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGridFocus = () => {
      setActiveComponent("movies-grid");
      // Focus first card when entering grid with mouse
      if (section !== "movies-grid") {
        dispatch(setGlobalFocus({ section: "movies-grid", index: 0 }));
      }
    };

    const handleGridBlur = () => {
      // Don't clear active component - let keyboard hook manage it
    };

    const grid = gridRef.current;
    if (grid) {
      grid.addEventListener("mouseenter", handleGridFocus);
      grid.addEventListener("mouseleave", handleGridBlur);
    }

    return () => {
      if (grid) {
        grid.removeEventListener("mouseenter", handleGridFocus);
        grid.removeEventListener("mouseleave", handleGridBlur);
      }
    };
  }, [section, dispatch]);

  useKeyboardNavigation(
    {
      onArrowDown: () => {
        const newIndex =
          globalFocusIndex === -1
            ? 0
            : Math.min(movies.length - 1, globalFocusIndex + COLUMNS);

        // Check if already at or past the last row
        const isAtLastRow = newIndex >= movies.length - COLUMNS;
        if (isAtLastRow && globalFocusIndex >= movies.length - COLUMNS) {
          // Already at last row, try to navigate to pagination
          dispatch(setGlobalFocus({ section: "pagination", index: 0 }));
          setActiveComponent("pagination");
          return;
        }

        dispatch(updateFocusIndex(newIndex));
        scrollToElement(cardRefs.current[newIndex]);
      },
      onArrowUp: () => {
        // Detect if trying to go up beyond first row
        if (globalFocusIndex !== -1 && globalFocusIndex < COLUMNS) {
          // At first row, navigate to filter bar
          dispatch(setGlobalFocus({ section: "filter-bar", index: 0 }));
          setActiveComponent("filter-bar");
          return;
        }

        const newIndex =
          globalFocusIndex === -1 ? 0 : Math.max(0, globalFocusIndex - COLUMNS);
        dispatch(updateFocusIndex(newIndex));
        scrollToElement(cardRefs.current[newIndex]);
      },
      onArrowRight: () => {
        const newIndex =
          globalFocusIndex === -1
            ? 0
            : Math.min(movies.length - 1, globalFocusIndex + 1);
        dispatch(updateFocusIndex(newIndex));
        scrollToElement(cardRefs.current[newIndex]);
      },
      onArrowLeft: () => {
        const newIndex =
          globalFocusIndex === -1 ? 0 : Math.max(0, globalFocusIndex - 1);
        dispatch(updateFocusIndex(newIndex));
        scrollToElement(cardRefs.current[newIndex]);
      },
      onEnter: () => {
        if (globalFocusIndex !== -1 && movies[globalFocusIndex]) {
          navigate(`/movie/${movies[globalFocusIndex].id}`);
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
        <div className="movies-grid__empty">
          <h3 className="movies-grid__empty-title">No movies found</h3>
          <p className="movies-grid__empty-sub">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        movies.map((movie, cardIndex) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            ref={(el) => {
              cardRefs.current[cardIndex] = el;
            }}
            isFocused={
              section === "movies-grid" && globalFocusIndex === cardIndex
            }
          />
        ))
      )}
    </div>
  );
};

export default MovieGrid;
