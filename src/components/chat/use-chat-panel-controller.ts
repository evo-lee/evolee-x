"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import type { UIMessage } from "ai";
import type { ChatEntryContext } from "@/lib/ai/chat-context";
import { isArticleChatEntryContext } from "@/lib/ai/chat-context";
import { MIN_SEND_INTERVAL_MS } from "@/lib/constants";
import { useEntranceTransition } from "@/hooks/use-entrance-transition";
import { useMediaQuery } from "@/hooks/use-media-query";

const DESKTOP_CHAT_MEDIA_QUERY = "(min-width: 1024px)";

function useMessagesAutoScroll(
  visibleMessages: UIMessage[],
  messagesEndRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesEndRef, visibleMessages]);
}

function useInputFocus(open: boolean, inputRef: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    if (!open) return;

    const timerId = window.setTimeout(() => inputRef.current?.focus(), 100);
    return () => window.clearTimeout(timerId);
  }, [inputRef, open]);
}

function useOverlayScrollLock(open: boolean, isDockedDesktop: boolean) {
  useEffect(() => {
    if (!open || isDockedDesktop) return;

    const scrollY = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.inset = "0";
    document.body.style.overflowY = "scroll";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.inset = "";
      document.body.style.overflowY = "";
      window.scrollTo(0, scrollY);
    };
  }, [isDockedDesktop, open]);
}

function useMobileViewportSync(
  open: boolean,
  isDockedDesktop: boolean,
  panelRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!open || isDockedDesktop) return;

    const visualViewport = window.visualViewport;
    const panelElement = panelRef.current;
    if (!visualViewport) return;

    const update = () => {
      if (!panelElement || window.innerWidth >= 640) {
        panelElement?.style.removeProperty("height");
        panelElement?.style.removeProperty("transform");
        return;
      }

      panelElement.style.height = `${visualViewport.height}px`;
      panelElement.style.transform = `translateY(${visualViewport.offsetTop}px)`;
    };

    visualViewport.addEventListener("resize", update);
    visualViewport.addEventListener("scroll", update);
    update();

    return () => {
      visualViewport.removeEventListener("resize", update);
      visualViewport.removeEventListener("scroll", update);
      panelElement?.style.removeProperty("height");
      panelElement?.style.removeProperty("transform");
    };
  }, [isDockedDesktop, open, panelRef]);
}

export interface UseChatPanelControllerParams {
  open: boolean;
  entryContext: ChatEntryContext;
  visibleMessages: UIMessage[];
  status: string;
  sendMessage: (params: { text: string }) => void;
}

export function useChatPanelController({
  open,
  entryContext,
  visibleMessages,
  status,
  sendMessage,
}: UseChatPanelControllerParams) {
  const [input, setInput] = useState("");
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimerRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastSendRef = useRef(0);
  const hasEntered = useEntranceTransition();
  const isDesktopViewport = useMediaQuery(DESKTOP_CHAT_MEDIA_QUERY);
  const isDockedDesktop = isArticleChatEntryContext(entryContext) && isDesktopViewport;
  const isLoading = status === "submitted" || status === "streaming";

  useMessagesAutoScroll(visibleMessages, messagesEndRef);
  useInputFocus(open, inputRef);
  useOverlayScrollLock(open, isDockedDesktop);
  useMobileViewportSync(open, isDockedDesktop, panelRef);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current !== null) {
        window.clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  const startCooldown = useCallback((durationMs: number) => {
    if (cooldownTimerRef.current !== null) {
      window.clearTimeout(cooldownTimerRef.current);
    }

    setCooldown(true);
    cooldownTimerRef.current = window.setTimeout(() => {
      cooldownTimerRef.current = null;
      setCooldown(false);
    }, durationMs);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading || cooldown) return;

    const now = Date.now();
    const elapsedMs = now - lastSendRef.current;
    if (elapsedMs < MIN_SEND_INTERVAL_MS) {
      startCooldown(MIN_SEND_INTERVAL_MS - elapsedMs);
      return;
    }

    lastSendRef.current = now;
    startCooldown(MIN_SEND_INTERVAL_MS);
    setInput("");
    sendMessage({ text });
  }, [cooldown, input, isLoading, sendMessage, startCooldown]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return {
    cooldown,
    handleKeyDown,
    handleSend,
    hasEntered,
    input,
    inputRef,
    isDockedDesktop,
    isLoading,
    messagesEndRef,
    panelRef,
    setInput,
  };
}
