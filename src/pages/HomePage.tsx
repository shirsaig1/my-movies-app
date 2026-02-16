import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMoviesRequest, clearError } from "../features/movies/moviesSlice";
import MoviesGrid from "../components/ui/MoviesGrid";
import FilterBar from "../components/ui/FilterBar";
import Pagination from "../components/ui/Pagination";
import type { RootState } from "../store/store";
import MoviesSearch from "../components/ui/MoviesSearch";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import "./HomePage.css";

const SCROLL_DISTANCE_PX = 100;

const HomePage = () => {
  const dispatch = useDispatch();
  const { movies, isLoading, error } = useSelector(
    (state: RootState) => state.movies,
  );

  // Memoize scroll handlers to prevent unnecessary re-renders
  const handleScrollUp = useCallback(() => {
    window.scrollBy({ top: -SCROLL_DISTANCE_PX, behavior: "smooth" });
  }, []);

  const handleScrollDown = useCallback(() => {
    window.scrollBy({ top: SCROLL_DISTANCE_PX, behavior: "smooth" });
  }, []);

  useKeyboardNavigation({
    onArrowUp: handleScrollUp,
    onArrowDown: handleScrollDown,
  });

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchMoviesRequest());
  }, [dispatch]);

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  if (isLoading && movies.length === 0) {
    return (
      <div className="home-page__loading">
        <p>Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <MoviesSearch />
      <FilterBar />

      {error && (
        <div className="alert alert-error home-page__error">
          <div className="alert__content">
            <p>{error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="alert__close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <MoviesGrid movies={movies} />
      <Pagination />
    </div>
  );
};

export default HomePage;
