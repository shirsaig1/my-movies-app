import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../../../features/movies/moviesSlice";
import type { RootState } from "../../../store/store";
import "./MoviesSearch.css";

const MoviesSearch = () => {
  const dispatch = useDispatch();
  const searchQuery = useSelector(
    (state: RootState) => state.movies.searchQuery,
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearchQuery(event.target.value));
    },
    [dispatch],
  );

  return (
    <div className="search-container">
      <svg
        className="search-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M14.5 14.5L21 21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <input
        type="text"
        value={searchQuery}
        placeholder="Search movies by title (minimum 2 characters)"
        onChange={handleSearchChange}
        aria-label="Search movies"
        className="search-input"
      />
    </div>
  );
};

export default MoviesSearch;
