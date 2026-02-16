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
  const componentRef = useRef<string>(componentId || "");

  useEffect(() => {
    if (!componentRef.current && !componentId) {
      componentRef.current = `nav-${Symbol.for("nav").toString()}`;
    }
    if (componentId) {
      componentRef.current = componentId;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      // If a specific component ID is provided, only handle if this component is active
      if (componentRef.current && activeComponentId !== componentRef.current) {
        return;
      }

      // Prevent Tab key from doing anything
      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          if (options.onArrowUp) {
            options.onArrowUp();
          } else if (options.onNavigateUp) {
            options.onNavigateUp();
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (options.onArrowDown) {
            options.onArrowDown();
          } else if (options.onNavigateDown) {
            options.onNavigateDown();
          }
          break;
        case "ArrowLeft":
          event.preventDefault();
          options.onArrowLeft?.();
          break;
        case "ArrowRight":
          event.preventDefault();
          options.onArrowRight?.();
          break;
        case "Enter":
          event.preventDefault();
          options.onEnter?.();
          break;
        case "Escape":
          event.preventDefault();
          options.onEscape?.();
          break;
        default:
          break;
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [options, componentId]);
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
