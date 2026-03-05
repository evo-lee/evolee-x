"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AIChatContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const AIChatContext = createContext<AIChatContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

export function useAIChat() {
  return useContext(AIChatContext);
}

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey)
        return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tag = target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable ||
        target.closest("[role='dialog']") ||
        target.closest("[role='combobox']") ||
        target.closest("[data-ai-chat-panel]")
      ) {
        return;
      }

      e.preventDefault();
      setOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AIChatContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </AIChatContext.Provider>
  );
}
