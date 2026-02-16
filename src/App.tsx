import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import HomePage from "./pages/HomePage";

const KEYBOARD_CONFIG = {
  DISABLED_KEYS: "Tab",
} as const;

const GLOBAL_STYLES = `
  html, body {
    overflow: hidden !important;
    height: 100vh;
    width: 100vw;
  }
  #root {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
`;

/**
 * Root application component with keyboard navigation and global event handling
 * - Disables Tab key to prevent browser default focus management
 * - Disables mouse scrolling to force keyboard-only navigation
 * - Sets up global styles for proper overflow handling
 */
function App() {
  useEffect(() => {
    const handleKeyboardEvent = (event: KeyboardEvent) => {
      if (KEYBOARD_CONFIG.DISABLED_KEYS.includes(event.key)) {
        event.preventDefault();
      }
    };

    const handleWheelEvent = (event: WheelEvent) => {
      event.preventDefault();
    };

    const styleElement = document.createElement("style");
    styleElement.textContent = GLOBAL_STYLES;
    document.head.appendChild(styleElement);

    globalThis.addEventListener("keydown", handleKeyboardEvent);
    window.addEventListener("wheel", handleWheelEvent, { passive: false });

    return () => {
      globalThis.removeEventListener("keydown", handleKeyboardEvent);
      window.removeEventListener("wheel", handleWheelEvent);
      if (document.head.contains(styleElement)) {
        styleElement.remove();
      }
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
