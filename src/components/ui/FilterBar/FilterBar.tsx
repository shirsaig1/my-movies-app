import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilter } from "../../../features/movies/moviesSlice";
import {
  setGlobalFocus,
  updateFocusIndex,
} from "../../../features/focus/focusSlice";
import type { RootState } from "../../../store/store";
import type { MovieFilter } from "../../../features/movies/moviesTypes";
import {
  useKeyboardNavigation,
  scrollToElement,
  setActiveComponent,
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
  const { section, index } = useSelector((state: RootState) => state.focus);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFilterFocus = () => {
      setActiveComponent("filter-bar");
      // Set global focus only if not already in filter bar
      if (section !== "filter-bar") {
        dispatch(setGlobalFocus({ section: "filter-bar", index: 0 }));
      }
    };

    const handleFilterBlur = () => {
      // Don't clear active component - let keyboard hook manage it
    };

    const filterBar = filterBarRef.current;
    if (filterBar) {
      filterBar.addEventListener("mouseenter", handleFilterFocus);
      filterBar.addEventListener("mouseleave", handleFilterBlur);
    }

    return () => {
      if (filterBar) {
        filterBar.removeEventListener("mouseenter", handleFilterFocus);
        filterBar.removeEventListener("mouseleave", handleFilterBlur);
      }
    };
  }, [section, dispatch]);

  const handleFilterChange = (filter: MovieFilter) => {
    // Immediate dispatch when clicked or Enter pressed
    dispatch(setFilter(filter));
  };

  const currentFilterIndex = FILTER_OPTIONS.findIndex(
    (opt) => opt.value === currentFilter,
  );

  // Sync global focus index when filter changes (e.g., from Redux action)
  useEffect(() => {
    if (section === "filter-bar") {
      dispatch(updateFocusIndex(currentFilterIndex));
    }
  }, [currentFilterIndex, section, dispatch]);

  // Only trigger 2s readout when focus is via keyboard navigation
  const handleFilterFocus = (filterIndex: number, fromKeyboard = false) => {
    if (!fromKeyboard) return;
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
    focusTimeoutRef.current = setTimeout(() => {
      dispatch(setFilter(FILTER_OPTIONS[filterIndex].value));
      focusTimeoutRef.current = null;
    }, FOCUS_DELAY_MS);
  };

  // When keyboard focus leaves a button, cancel pending timeout
  const handleFilterBlur = () => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  useKeyboardNavigation(
    {
      onArrowLeft: () => {
        const newIndex = Math.max(0, index - 1);
        dispatch(updateFocusIndex(newIndex));
        scrollToElement(buttonRefs.current[newIndex]);
        handleFilterFocus(newIndex, true);
      },
      onArrowRight: () => {
        const newIndex = Math.min(FILTER_OPTIONS.length - 1, index + 1);
        dispatch(updateFocusIndex(newIndex));
        scrollToElement(buttonRefs.current[newIndex]);
        handleFilterFocus(newIndex, true);
      },
      onNavigateDown: () => {
        // Always move focus to grid on ArrowDown, even on first render
        dispatch(setGlobalFocus({ section: "movies-grid", index: 0 }));
        setActiveComponent("movies-grid");
        // Optionally, scroll grid into view for accessibility
        const grid = document.querySelector(".movies-grid");
        if (grid && "scrollIntoView" in grid) {
          (grid as HTMLElement).scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      },
      onNavigateUp: () => {
        // Stay in filter bar - it's the top boundary
      },
      onEnter: () => {
        // ✅ FIX: On Enter key, cancel pending focus timeout and dispatch immediately
        handleFilterBlur(); // Cancel pending timeout
        handleFilterChange(FILTER_OPTIONS[index].value); // Dispatch immediately
      },
    },
    "filter-bar",
  );

  const renderIcon = (value: string) => {
    if (value === "popular") {
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C12 2 7 7 7 11C7 14.3137 9.68629 17 13 17C16.3137 17 19 14.3137 19 11C19 8 16.5 5 12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 21C8 21 9 19 12 19C15 19 16 21 16 21"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (value === "now_playing") {
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="6"
            width="20"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M8 10L15 13L8 16V10Z" fill="currentColor" />
        </svg>
      );
    }

    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.84 4.61C20.3299 4.09995 19.7226 3.69382 19.0591 3.41708C18.3955 3.14034 17.6896 2.99983 16.98 3C15.93 3 14.93 3.42 14.17 4.17L12 6.34L9.83 4.17C8.57 2.91 6.68 2.91 5.42 4.17C4.16 5.43 4.16 7.32 5.42 8.58L12 15.16L20.84 6.32C21.3501 5.81 21.3501 5.0 20.84 4.61Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="filter-bar" ref={filterBarRef}>
      {FILTER_OPTIONS.map((option, buttonIndex) => (
        <button
          key={option.value}
          ref={(el) => {
            buttonRefs.current[buttonIndex] = el;
          }}
          onClick={() => {
            handleFilterBlur(); // Cancel pending timeout
            handleFilterChange(option.value);
            dispatch(
              setGlobalFocus({ section: "filter-bar", index: buttonIndex }),
            );
          }}
          onFocus={(e) => {
            // Only trigger 2s readout if focus is from keyboard
            if (
              e &&
              e.relatedTarget &&
              (e.relatedTarget as HTMLElement)?.tagName !== "BUTTON"
            )
              return;
            handleFilterFocus(buttonIndex, true);
          }}
          className={`filter-button ${
            currentFilter === option.value
              ? "filter-button--active"
              : "filter-button--outlined"
          } ${section === "filter-bar" && index === buttonIndex ? "filter-button--focused" : ""}`}
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
