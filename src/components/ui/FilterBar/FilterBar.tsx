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

  const renderIcon = (value: string) => {
    if (value === "popular") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C12 2 7 7 7 11C7 14.3137 9.68629 17 13 17C16.3137 17 19 14.3137 19 11C19 8 16.5 5 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 21C8 21 9 19 12 19C15 19 16 21 16 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }

    if (value === "now_playing") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 10L15 13L8 16V10Z" fill="currentColor"/>
        </svg>
      );
    }

    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61C20.3299 4.09995 19.7226 3.69382 19.0591 3.41708C18.3955 3.14034 17.6896 2.99983 16.98 3C15.93 3 14.93 3.42 14.17 4.17L12 6.34L9.83 4.17C8.57 2.91 6.68 2.91 5.42 4.17C4.16 5.43 4.16 7.32 5.42 8.58L12 15.16L20.84 6.32C21.3501 5.81 21.3501 5.0 20.84 4.61Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

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
          <span className="filter-button__icon" aria-hidden>
            {renderIcon(option.value)}
          </span>
          <span className="filter-button__label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
