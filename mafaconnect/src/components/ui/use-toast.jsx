import { useState, useEffect, useCallback } from "react";

/**
 * ✅ Simple global toast system for React JS
 * Works with Toaster.jsx
 */

// Global state
let toastListeners = [];
let idCounter = 0;

/**
 * 🔥 Global function to show a toast from anywhere
 */
export const toast = ({ title, description, duration = 3000, variant = "default" }) => {
  const id = ++idCounter;
  const newToast = { id, title, description, variant };

  // Notify all useToast() hooks
  toastListeners.forEach((fn) => fn((prev) => [...prev, newToast]));

  // Auto remove after timeout
  setTimeout(() => {
    toastListeners.forEach((fn) => fn((prev) => prev.filter((t) => t.id !== id)));
  }, duration);
};

/**
 * 🧩 React hook to access and listen to all toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  // Subscribe this component to the global toast list
  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismiss, toast };
}
