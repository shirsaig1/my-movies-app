import { useEffect, useRef } from "react";

interface KeyboardNavigationOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onNavigateUp?: () => void; // Called when trying to navigate up but at boundary
  onNavigateDown?: () => void; // Called when trying to navigate down but at boundary
}

let activeComponentId: string | null = null;
const navigationCallbacks: Map<string, (direction: "up" | "down") => void> =
  new Map();

export const useKeyboardNavigation = (
  options: KeyboardNavigationOptions,
  componentId?: string,
) => {
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Global Escape: always works
      if (event.key === "Escape") {
        event.preventDefault();
        optionsRef.current.onEscape?.();
        return;
      }
      // 2. Tab prevention (always)
      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }
      // 3. Scoped navigation: only if no componentId, or matches activeComponentId
      if (componentId && activeComponentId !== componentId) {
        return;
      }
      // 4. Arrow/Enter logic (always use latest optionsRef)
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          if (optionsRef.current.onArrowUp) {
            optionsRef.current.onArrowUp();
          } else if (optionsRef.current.onNavigateUp) {
            optionsRef.current.onNavigateUp();
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (optionsRef.current.onArrowDown) {
            optionsRef.current.onArrowDown();
          } else if (optionsRef.current.onNavigateDown) {
            optionsRef.current.onNavigateDown();
          }
          break;
        case "ArrowLeft":
          event.preventDefault();
          optionsRef.current.onArrowLeft?.();
          break;
        case "ArrowRight":
          event.preventDefault();
          optionsRef.current.onArrowRight?.();
          break;
        case "Enter":
          event.preventDefault();
          optionsRef.current.onEnter?.();
          break;
        default:
          break;
      }
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [componentId]);
};

export const setActiveComponent = (componentId: string | null) => {
  activeComponentId = componentId;
};

export const registerNavigationCallback = (
  componentId: string,
  callback: (direction: "up" | "down") => void,
) => {
  navigationCallbacks.set(componentId, callback);
};

export const navigateToComponent = (
  componentId: string,
  direction: "up" | "down",
) => {
  setActiveComponent(componentId);
  const callback = navigationCallbacks.get(componentId);
  if (callback) {
    callback(direction);
  }
};

export const scrollToElement = (element: HTMLElement | null) => {
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};
