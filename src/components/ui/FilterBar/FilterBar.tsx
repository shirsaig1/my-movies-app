import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilter } from "../../../features/movies/moviesSlice";
import type { RootState } from "../../../store/store";
import type { MovieFilter } from "../../../features/movies/moviesTypes";
import {
  useKeyboardNavigation,
  scrollToElement,
  setActiveComponent,
  registerNavigationCallback,
  navigateToComponent,
} from "../../../hooks/useKeyboardNavigation";
import "./FilterBar.css";

const FILTER_OPTIONS: { label: string; value: MovieFilter }[] = [
  { label: "Popular", value: "popular" },
  { label: "Airing Now", value: "now_playing" },
  { label: "My Favorites", value: "favorites" },
];

const FOCUS_DELAY_MS = 2000; // 2 seconds

export default function FilterBar() {
  const dispatch = useDispatch();
  const currentFilter = useSelector((state: RootState) => state.movies.filter);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFilterFocus = () => {
      setActiveComponent("filter-bar");
    };

    const handleFilterBlur = () => {
      setActiveComponent(null);
    };

    const filterBar = filterBarRef.current;
    if (filterBar) {
      filterBar.addEventListener("mouseenter", handleFilterFocus);
      filterBar.addEventListener("mouseleave", handleFilterBlur);
    }

    // Register boundary navigation callback
    registerNavigationCallback("filter-bar", (direction) => {
      if (direction === "down") {
        // Coming from grid below, focus filter bar (already focused)
        const firstButton = buttonRefs.current[0];
        if (firstButton) {
          scrollToElement(firstButton);
        }
      }
      // If coming from above (direction="up"), stay at current focus
    });

    return () => {
      if (filterBar) {
        filterBar.removeEventListener("mouseenter", handleFilterFocus);
        filterBar.removeEventListener("mouseleave", handleFilterBlur);
      }
    };
  }, []);

  const handleFilterChange = (filter: MovieFilter) => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }
    dispatch(setFilter(filter));
  };

  const currentFilterIndex = FILTER_OPTIONS.findIndex(
    (opt) => opt.value === currentFilter,
  );

  useEffect(() => {
    setFocusedIndex(currentFilterIndex);
  }, [currentFilterIndex]);

  const handleFilterFocus = (index: number) => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
    focusTimeoutRef.current = setTimeout(() => {
      dispatch(setFilter(FILTER_OPTIONS[index].value));
      focusTimeoutRef.current = null;
    }, FOCUS_DELAY_MS);
  };

  useKeyboardNavigation(
    {
      onArrowLeft: () => {
        const newIndex = Math.max(0, focusedIndex - 1);
        setFocusedIndex(newIndex);
        scrollToElement(buttonRefs.current[newIndex]);
        handleFilterFocus(newIndex);
      },
      onArrowRight: () => {
        const newIndex = Math.min(FILTER_OPTIONS.length - 1, focusedIndex + 1);
        setFocusedIndex(newIndex);
        scrollToElement(buttonRefs.current[newIndex]);
        handleFilterFocus(newIndex);
      },
      onNavigateDown: () => {
        // Navigate to movies grid when trying to go down beyond filter bar
        navigateToComponent("movies-grid", "up");
      },
      onNavigateUp: () => {
        // Stay in filter bar - it's the top boundary
      },
      onEnter: () => {
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
          focusTimeoutRef.current = null;
        }
        handleFilterChange(FILTER_OPTIONS[focusedIndex].value);
      },
    },
    "filter-bar",
  );

  return (
    <div className="filter-bar" ref={filterBarRef}>
      {FILTER_OPTIONS.map((option, index) => (
        <button
          key={option.value}
          ref={(el) => {
            buttonRefs.current[index] = el;
          }}
          onClick={() => handleFilterChange(option.value)}
          className={`filter-button ${
            focusedIndex === index || currentFilter === option.value
              ? "filter-button--active"
              : "filter-button--outlined"
          } ${focusedIndex === index ? "filter-button--focused" : ""}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
