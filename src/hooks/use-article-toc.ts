"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useScrollThreshold } from "@/hooks/use-scroll-threshold";

const MOBILE_TOC_MEDIA_QUERY = "(max-width: 767px)";
const MOBILE_TOC_SCROLL_THRESHOLD = 20;
const ACTIVE_HEADING_OFFSET = 110;
const MANUAL_SCROLL_LOCK_MS = 1000;
const MARKER_HEIGHT_PX = 36;
const MARKER_UPDATE_DELAY_MS = 300;

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export interface TocSection {
  heading: TocHeading;
  children: TocHeading[];
}

function buildSections(headings: TocHeading[]): TocSection[] {
  const sections: TocSection[] = [];

  for (const heading of headings) {
    if (heading.level === 2) {
      sections.push({ heading, children: [] });
      continue;
    }

    if (heading.level === 3 && sections.length > 0) {
      sections[sections.length - 1].children.push(heading);
    }
  }

  return sections;
}

function getExpandedSectionId(sections: TocSection[], activeId: string): string {
  for (const section of sections) {
    if (section.heading.id === activeId) return section.heading.id;
    if (section.children.some((child) => child.id === activeId)) {
      return section.heading.id;
    }
  }

  return sections[0]?.heading.id ?? "";
}

function getActiveSectionLabel(sections: TocSection[], activeId: string): string {
  for (const section of sections) {
    if (section.heading.id === activeId) {
      return section.heading.text;
    }

    const child = section.children.find((item) => item.id === activeId);
    if (child) {
      return `${section.heading.text} / ${child.text}`;
    }
  }

  return sections[0]?.heading.text ?? "本文导览";
}

export function useArticleTocState(headings: TocHeading[]) {
  const tocHeadings = useMemo(
    () => headings.filter((heading) => heading.level === 2 || heading.level === 3),
    [headings],
  );
  const sections = useMemo(() => buildSections(tocHeadings), [tocHeadings]);
  const [activeId, setActiveId] = useState("");
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<number | null>(null);
  const isMobileViewport = useMediaQuery(MOBILE_TOC_MEDIA_QUERY);
  const isPastMobileThreshold = useScrollThreshold(
    MOBILE_TOC_SCROLL_THRESHOLD,
    { disabled: sections.length === 0 },
  );
  const mobileVisible = isMobileViewport && isPastMobileThreshold && sections.length > 0;
  const resolvedActiveId =
    activeId && tocHeadings.some((heading) => heading.id === activeId)
      ? activeId
      : tocHeadings[0]?.id ?? "";

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current !== null) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!tocHeadings.length) return;

    const updateActiveHeading = () => {
      if (isClickScrollingRef.current) return;

      let currentId = tocHeadings[0]?.id ?? "";

      for (const heading of tocHeadings) {
        const element = document.getElementById(heading.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top - ACTIVE_HEADING_OFFSET <= 0) {
          currentId = heading.id;
        }
      }

      setActiveId(currentId);
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveHeading);
  }, [tocHeadings]);

  const expandedSectionId = useMemo(
    () => getExpandedSectionId(sections, resolvedActiveId),
    [resolvedActiveId, sections],
  );
  const activeSectionLabel = useMemo(
    () => getActiveSectionLabel(sections, resolvedActiveId),
    [resolvedActiveId, sections],
  );

  const updateMarker = useCallback(() => {
    const currentId = resolvedActiveId || tocHeadings[0]?.id;
    if (!currentId) return;

    const marker = markerRef.current;
    if (!marker) return;

    const target = document.querySelector<HTMLAnchorElement>(`a[data-toc-id="${currentId}"]`);
    if (!target) return;

    const top = target.offsetTop + (target.offsetHeight - MARKER_HEIGHT_PX) / 2;
    marker.style.transform = `translateY(${Math.max(0, top)}px)`;
  }, [resolvedActiveId, tocHeadings]);

  useEffect(() => {
    updateMarker();

    const timerId = window.setTimeout(updateMarker, MARKER_UPDATE_DELAY_MS);
    return () => window.clearTimeout(timerId);
  }, [expandedSectionId, updateMarker]);

  const handleSelectHeading = useCallback((id: string) => {
    isClickScrollingRef.current = true;
    setActiveId(id);

    if (clickTimeoutRef.current !== null) {
      window.clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = window.setTimeout(() => {
      isClickScrollingRef.current = false;
      clickTimeoutRef.current = null;
    }, MANUAL_SCROLL_LOCK_MS);
  }, []);

  return {
    activeId: resolvedActiveId,
    activeSectionLabel,
    expandedSectionId,
    handleSelectHeading,
    markerRef,
    mobileVisible,
    sections,
  };
}
