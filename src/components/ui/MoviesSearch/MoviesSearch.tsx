import { useCallback, useEffect, useRef } from "react";
import { useKeyboardNavigation } from "../../../hooks/useKeyboardNavigation";
import { setGlobalFocus } from "../../../features/focus/focusSlice";
import {
  useDispatch,
  useSelector,
  useDispatch as useReduxDispatch,
} from "react-redux";
import { setSearchQuery } from "../../../features/movies/moviesSlice";
import type { RootState } from "../../../store/store";
import "./MoviesSearch.css";

const MoviesSearch = () => {
  const dispatch = useDispatch();
  const searchQuery = useSelector(
    (state: RootState) => state.movies.searchQuery,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const { section } = useSelector((state: RootState) => state.focus);
  const isFocused = section === "search";

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  // Keyboard navigation for search
  const reduxDispatch = useReduxDispatch();
  useKeyboardNavigation(
    {
      onArrowDown: () => {
        reduxDispatch(setGlobalFocus({ section: "filter-bar", index: 0 }));
      },
      onArrowUp: () => {
        reduxDispatch(setGlobalFocus({ section: "pagination", index: 0 }));
      },
      onEscape: () => {
        inputRef.current?.blur();
      },
    },
    "search",
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearchQuery(event.target.value));
    },
    [dispatch],
  );

  return (
    <div
      className={`search-container${isFocused ? " search-container--focused" : ""}`}
    >
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
        ref={inputRef}
        type="text"
        value={searchQuery}
        placeholder="Search movies by title (minimum 2 characters)"
        onChange={handleSearchChange}
        aria-label="Search movies"
        className={`search-input${isFocused ? " search-input--focused" : ""}`}
        onFocus={() =>
          reduxDispatch(setGlobalFocus({ section: "search", index: 0 }))
        }
      />
    </div>
  );
};

export default MoviesSearch;
