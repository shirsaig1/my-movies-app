import { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMoviesRequest, clearError } from "../features/movies/moviesSlice";
import MoviesGrid from "../components/ui/MoviesGrid";
import FilterBar from "../components/ui/FilterBar";
import Pagination from "../components/ui/Pagination";
import Carousel from "../components/ui/Carousel/Carousel";
import type { RootState } from "../store/store";
import MoviesSearch from "../components/ui/MoviesSearch";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import { getAccountDetails } from "../utils/api";
import "./HomePage.css";

const SCROLL_DISTANCE_PX = 100;

const HomePage = () => {
  const dispatch = useDispatch();
  const { movies, isLoading, error } = useSelector(
    (state: RootState) => state.movies,
  );
  const [username, setUsername] = useState<string | null>(null);

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

  // Fetch account details to get username
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await getAccountDetails();
        const data = response.data as { username?: string; name?: string };
        setUsername(data.username || data.name || null);
      } catch (err) {
        console.error("Failed to fetch account details:", err);
      }
    };
    fetchUsername();
  }, []);

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
      <div className="home-page__header">
        <h1 className="home-page__header-title">{username ? `Welcome, ${username}.` : "Welcome."}</h1>
        <p className="home-page__header-subtitle">Millions of popular and airing now movies to discover. Explore now.</p>
      </div>

      <div className="home-page__title">
        <h2>Recommended For You</h2>
      </div>

      <Carousel />

      <div className="home-page__controls">
        <div className="home-page__search">
          <MoviesSearch />
        </div>
        <div className="home-page__filters">
          <FilterBar />
        </div>
      </div>

      <div className="home-page__content">
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
    </div>
  );
};

export default HomePage;
