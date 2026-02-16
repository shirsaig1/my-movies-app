import { useDispatch, useSelector } from "react-redux";
import { setPage } from "../../../features/movies/moviesSlice";
import type { RootState } from "../../../store/store";
import { useState, useRef, useEffect } from "react";
import {
  useKeyboardNavigation,
  setActiveComponent,
  registerNavigationCallback,
  navigateToComponent,
  scrollToElement,
} from "../../../hooks/useKeyboardNavigation";
import "./Pagination.css";

const MAX_PAGES = 500; // TMDb API typically allows up to 500 pages

export default function Pagination() {
  const dispatch = useDispatch();
  const { page, filter, searchQuery } = useSelector(
    (state: RootState) => state.movies,
  );
  const [inputPage, setInputPage] = useState(page.toString());
  const [focusedControl, setFocusedControl] = useState<
    "previous" | "input" | "next"
  >("previous");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    const handlePaginationFocus = () => {
      setActiveComponent("pagination");
    };

    const handlePaginationBlur = () => {
      setActiveComponent(null);
    };

    const pagination = paginationRef.current;
    if (pagination) {
      pagination.addEventListener("mouseenter", handlePaginationFocus);
      pagination.addEventListener("mouseleave", handlePaginationBlur);
    }

    // Register boundary navigation callback
    registerNavigationCallback("pagination", (direction) => {
      if (direction === "up") {
        // Coming from grid above, focus first control (previous button)
        setFocusedControl("previous");
        if (prevRef.current) {
          scrollToElement(prevRef.current);
        }
      }
      // If coming from below (direction="down"), stay at current focus
    });

    return () => {
      if (pagination) {
        pagination.removeEventListener("mouseenter", handlePaginationFocus);
        pagination.removeEventListener("mouseleave", handlePaginationBlur);
      }
    };
  }, []);

  // Call hook before any early returns (React Hooks rule)
  useKeyboardNavigation(
    {
      onArrowLeft: () => {
        if (focusedControl === "input") {
          setFocusedControl("previous");
          prevRef.current?.focus();
        } else if (focusedControl === "next") {
          setFocusedControl("input");
          inputRef.current?.focus();
        }
      },
      onArrowRight: () => {
        if (focusedControl === "previous") {
          setFocusedControl("input");
          inputRef.current?.focus();
        } else if (focusedControl === "input") {
          setFocusedControl("next");
          nextRef.current?.focus();
        }
      },
      onNavigateUp: () => {
        // Navigate to movies grid when trying to go up beyond pagination
        navigateToComponent("movies-grid", "down");
      },
      onEnter: () => {
        if (focusedControl === "previous") {
          handlePreviousPage();
        } else if (focusedControl === "next") {
          handleNextPage();
        } else if (focusedControl === "input") {
          handlePageInputSubmit();
        }
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
        onClick={handlePreviousPage}
        disabled={page <= 1}
        className={`pagination__btn ${focusedControl === "previous" ? "pagination__btn--focused" : ""}`}
        onFocus={() => setFocusedControl("previous")}
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
        className={`pagination__input ${focusedControl === "input" ? "pagination__input--focused" : ""}`}
        onFocus={() => setFocusedControl("input")}
      />

      <span className="pagination__label">of {MAX_PAGES}</span>

      <button
        ref={nextRef}
        onClick={handleNextPage}
        disabled={page >= MAX_PAGES}
        className={`pagination__btn ${focusedControl === "next" ? "pagination__btn--focused" : ""}`}
        onFocus={() => setFocusedControl("next")}
      >
        Next
      </button>
    </div>
  );
}
