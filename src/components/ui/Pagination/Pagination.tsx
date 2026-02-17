import { setPage } from "../../../features/movies/moviesSlice";
import type { RootState } from "../../../store/store";
import { useState, useRef, useEffect } from "react";
import {
  useKeyboardNavigation,
  setActiveComponent,
} from "../../../hooks/useKeyboardNavigation";
import {
  useDispatch as useReduxDispatch,
  useSelector,
  useDispatch,
} from "react-redux";
import {
  focusPrevious,
  updateFocusIndex,
  setGlobalFocus,
} from "../../../features/focus/focusSlice";
import "./Pagination.css";

const MAX_PAGES = 500; // TMDb API typically allows up to 500 pages

const PAGINATION_ITEMS = ["previous", "input", "next"] as const;

export default function Pagination() {
  const dispatch = useDispatch();
  const { page, filter, searchQuery } = useSelector(
    (state: RootState) => state.movies,
  );
  const { section, index: globalFocusIndex } = useSelector(
    (state: RootState) => state.focus,
  );
  const [inputPage, setInputPage] = useState(page.toString());
  const prevRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync input field with page from Redux state
    setInputPage(page.toString());
  }, [page]);

  useEffect(() => {
    // Scroll to top of grid when page changes
    const grid = document.querySelector(".movies-grid");
    if (grid && "scrollTo" in grid) {
      (grid as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [page]);

  useEffect(() => {
    const handlePaginationFocus = () => {
      setActiveComponent("pagination");
      // Set global focus to pagination (first item by default)
      if (section !== "pagination") {
        dispatch(setGlobalFocus({ section: "pagination", index: 0 }));
      }
    };

    const handlePaginationBlur = () => {
      // Don't clear active component - let keyboard hook manage it
    };

    const pagination = paginationRef.current;
    if (pagination) {
      pagination.addEventListener("mouseenter", handlePaginationFocus);
      pagination.addEventListener("mouseleave", handlePaginationBlur);
    }

    return () => {
      if (pagination) {
        pagination.removeEventListener("mouseenter", handlePaginationFocus);
        pagination.removeEventListener("mouseleave", handlePaginationBlur);
      }
    };
  }, [section, dispatch]);

  // Call hook before any early returns (React Hooks rule)
  const reduxDispatch = useReduxDispatch();
  useKeyboardNavigation(
    {
      onArrowLeft: () => {
        const newIndex = Math.max(0, globalFocusIndex - 1);
        dispatch(updateFocusIndex(newIndex));
        // Scroll to focused element
        if (newIndex === 0) prevRef.current?.focus();
        else if (newIndex === 1) inputRef.current?.focus();
        else if (newIndex === 2) nextRef.current?.focus();
      },
      onArrowRight: () => {
        const newIndex = Math.min(
          PAGINATION_ITEMS.length - 1,
          globalFocusIndex + 1,
        );
        dispatch(updateFocusIndex(newIndex));
        // Scroll to focused element
        if (newIndex === 0) prevRef.current?.focus();
        else if (newIndex === 1) inputRef.current?.focus();
        else if (newIndex === 2) nextRef.current?.focus();
      },
      onNavigateUp: () => {
        // Focus the first card in the last row of the grid
        const grid = document.querySelector(".movies-grid");
        if (grid) {
          const cards = grid.querySelectorAll(".movie-card");
          const COLUMNS = 4;
          const total = cards.length;
          const lastRowStart = Math.max(
            0,
            Math.floor((total - 1) / COLUMNS) * COLUMNS,
          );
          // Set global focus to last row's first card
          dispatch(
            setGlobalFocus({ section: "movies-grid", index: lastRowStart }),
          );
          setActiveComponent("movies-grid");
          // Optionally scroll to the card
          if (cards[lastRowStart] && "scrollIntoView" in cards[lastRowStart]) {
            (cards[lastRowStart] as HTMLElement).scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        } else {
          // fallback: focus first card
          dispatch(setGlobalFocus({ section: "movies-grid", index: 0 }));
          setActiveComponent("movies-grid");
        }
      },
      onEnter: () => {
        if (globalFocusIndex === 0) {
          handlePreviousPage();
        } else if (globalFocusIndex === 2) {
          handleNextPage();
        } else if (globalFocusIndex === 1) {
          handlePageInputSubmit();
        }
      },
      onEscape: () => {
        reduxDispatch(focusPrevious());
      },
    },
    "pagination",
  );

  // Only show pagination for Popular and Airing Now, not for Favorites or search
  if (filter === "favorites" || searchQuery) {
    return null;
  }

  const handlePreviousPage = () => {
    if (page > 1) {
      dispatch(setPage(page - 1));
    }
  };

  const handleNextPage = () => {
    if (page < MAX_PAGES) {
      dispatch(setPage(page + 1));
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handlePageInputSubmit = () => {
    const newPage = Number.parseInt(inputPage, 10);
    if (newPage > 0 && newPage <= MAX_PAGES && newPage !== page) {
      dispatch(setPage(newPage));
    } else {
      setInputPage(page.toString());
    }
  };

  return (
    <div className="pagination" ref={paginationRef}>
      <button
        ref={prevRef}
        onClick={() => {
          dispatch(setGlobalFocus({ section: "pagination", index: 0 }));
          handlePreviousPage();
        }}
        disabled={page <= 1}
        className={`pagination__btn ${section === "pagination" && globalFocusIndex === 0 ? "pagination__btn--focused" : ""}`}
      >
        Previous
      </button>

      <input
        ref={inputRef}
        type="number"
        value={inputPage}
        onChange={handlePageInputChange}
        onBlur={handlePageInputSubmit}
        min={1}
        max={MAX_PAGES}
        className={`pagination__input ${section === "pagination" && globalFocusIndex === 1 ? "pagination__input--focused" : ""}`}
        onClick={() =>
          dispatch(setGlobalFocus({ section: "pagination", index: 1 }))
        }
      />

      <span className="pagination__label">of {MAX_PAGES}</span>

      <button
        ref={nextRef}
        onClick={() => {
          dispatch(setGlobalFocus({ section: "pagination", index: 2 }));
          handleNextPage();
        }}
        disabled={page >= MAX_PAGES}
        className={`pagination__btn ${section === "pagination" && globalFocusIndex === 2 ? "pagination__btn--focused" : ""}`}
      >
        Next
      </button>
    </div>
  );
}
