"use client";

import { useEffect, useState } from "react";

export function useEntranceTransition(): boolean {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    let frameId = 0;
    let nestedFrameId = 0;

    frameId = window.requestAnimationFrame(() => {
      nestedFrameId = window.requestAnimationFrame(() => {
        setEntered(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(nestedFrameId);
    };
  }, []);

  return entered;
}
