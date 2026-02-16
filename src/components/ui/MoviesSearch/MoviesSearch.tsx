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
      <input
        type="text"
        value={searchQuery}
        placeholder="Search movies by title (minimum 2 characters)"
        onChange={handleSearchChange}
        aria-label="Search movies"
        className="search-input"
      />
      <span className="search-icon">🔍</span>
    </div>
  );
};

export default MoviesSearch;
