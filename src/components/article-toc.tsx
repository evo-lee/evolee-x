"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface TocSection {
  heading: TocHeading;
  children: TocHeading[];
}

interface ArticleTocProps {
  headings: TocHeading[];
}

export function ArticleToc({ headings }: ArticleTocProps) {
  const tocHeadings = useMemo(
    () => headings.filter((h) => h.level === 2 || h.level === 3),
    [headings],
  );

  // 将扁平 heading 列表分组为 h2 → h3[] 树形结构
  const sections = useMemo(() => {
    const result: TocSection[] = [];
    for (const heading of tocHeadings) {
      if (heading.level === 2) {
        result.push({ heading, children: [] });
      } else if (heading.level === 3 && result.length > 0) {
        result[result.length - 1].children.push(heading);
      }
    }
    return result;
  }, [tocHeadings]);

  const [activeId, setActiveId] = useState(tocHeadings[0]?.id ?? "");
  const [mobileVisible, setMobileVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const isClickScrolling = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 当前激活的 h2 section（用于展开/收起）
  const expandedSectionId = useMemo(() => {
    for (const section of sections) {
      if (section.heading.id === activeId) return section.heading.id;
      if (section.children.some((c) => c.id === activeId))
        return section.heading.id;
    }
    return sections[0]?.heading.id ?? "";
  }, [activeId, sections]);

  // 移动端导览条显示当前阅读位置（h2/h3）
  const activeSectionLabel = useMemo(() => {
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
  }, [activeId, sections]);

  // 滚动检测
  useEffect(() => {
    if (!tocHeadings.length) return;

    const updateActiveHeading = () => {
      if (isClickScrolling.current) return;

      const offset = 110;
      let currentId = tocHeadings[0]?.id ?? "";

      for (const heading of tocHeadings) {
        const element = document.getElementById(heading.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top - offset <= 0) {
          currentId = heading.id;
        }
      }

      setActiveId(currentId);
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [tocHeadings]);

  // 移动端：下滑显示“本文导览”折叠面板，上滑/回顶隐藏
  useEffect(() => {
    if (!sections.length) return;

    const mobileMedia = window.matchMedia("(max-width: 767px)");

    const updateMobileVisibility = () => {
      const currentY = window.scrollY;

      if (!mobileMedia.matches) {
        setMobileVisible(false);
        setMobileOpen(false);
        return;
      }

      // 移动端文章阅读模式：离开顶部即显示导览入口，回到顶部隐藏
      if (currentY > 20) {
        setMobileVisible(true);
      } else {
        setMobileVisible(false);
        setMobileOpen(false);
      }
    };

    updateMobileVisibility();
    window.addEventListener("scroll", updateMobileVisibility, { passive: true });
    window.addEventListener("resize", updateMobileVisibility);

    return () => {
      window.removeEventListener("scroll", updateMobileVisibility);
      window.removeEventListener("resize", updateMobileVisibility);
    };
  }, [sections.length]);

  // Marker 位置计算
  const updateMarker = useCallback(() => {
    const markerHeight = 36;
    const current = activeId || tocHeadings[0]?.id;
    if (!current) return;

    const marker = markerRef.current;
    if (!marker) return;

    const el = document.querySelector<HTMLAnchorElement>(
      `a[data-toc-id="${current}"]`,
    );
    if (!el) return;

    const top = el.offsetTop + (el.offsetHeight - markerHeight) / 2;
    marker.style.transform = `translateY(${Math.max(0, top)}px)`;
  }, [activeId, tocHeadings]);

  useEffect(() => {
    updateMarker();
    // 展开/收起动画结束后重新计算 marker 位置
    const timer = setTimeout(updateMarker, 300);
    return () => clearTimeout(timer);
  }, [updateMarker, expandedSectionId]);

  const handleClick = (id: string, closeMobile: boolean = false) => {
    isClickScrolling.current = true;
    setActiveId(id);
    if (closeMobile) {
      setMobileOpen(false);
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);
  };

  if (!sections.length) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed left-1/2 top-2 z-50 w-[calc(100%-1rem)] -translate-x-1/2 md:hidden transition-all duration-300 ${
          mobileVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white/95 shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200"
            aria-expanded={mobileOpen}
            aria-label={`展开本文导览，当前阅读到：${activeSectionLabel}`}
          >
            <span className="min-w-0 truncate text-left">
              本文导览 · {activeSectionLabel}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                mobileOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden border-t border-zinc-200/80 dark:border-zinc-700/80">
              <ul className="max-h-[58vh] space-y-1 overflow-y-auto px-3 py-2">
                {sections.map((section) => (
                  <li key={section.heading.id}>
                    <a
                      href={`#${section.heading.id}`}
                      className={`article-toc-link ${
                        activeId === section.heading.id ? "is-active" : ""
                      }`}
                      onClick={() => handleClick(section.heading.id, true)}
                    >
                      {section.heading.text}
                    </a>
                    {section.children.length > 0 && (
                      <div
                        className={`toc-children-wrapper ${
                          expandedSectionId === section.heading.id
                            ? "is-expanded"
                            : ""
                        }`}
                      >
                        <ul className="toc-children-inner">
                          {section.children.map((child) => (
                            <li key={child.id}>
                              <a
                                href={`#${child.id}`}
                                className={`article-toc-link toc-h3 ${
                                  activeId === child.id ? "is-active" : ""
                                }`}
                                onClick={() => handleClick(child.id, true)}
                              >
                                {child.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-[220px] lg:flex-shrink-0">
        <div className="toc-scroll fixed top-[110px] w-[220px] max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="article-toc">
            <span
              aria-hidden="true"
              ref={markerRef}
              className="article-toc-marker"
            />
            <p className="article-toc-title">本文导览</p>
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.heading.id}>
                  <a
                    href={`#${section.heading.id}`}
                    data-toc-id={section.heading.id}
                    className={`article-toc-link ${
                      activeId === section.heading.id ? "is-active" : ""
                    }`}
                    onClick={() => handleClick(section.heading.id)}
                  >
                    {section.heading.text}
                  </a>
                  {section.children.length > 0 && (
                    <div
                      className={`toc-children-wrapper ${
                        expandedSectionId === section.heading.id
                          ? "is-expanded"
                          : ""
                      }`}
                    >
                      <ul className="toc-children-inner">
                        {section.children.map((child) => (
                          <li key={child.id}>
                            <a
                              href={`#${child.id}`}
                              data-toc-id={child.id}
                              className={`article-toc-link toc-h3 ${
                                activeId === child.id ? "is-active" : ""
                              }`}
                              onClick={() => handleClick(child.id)}
                            >
                              {child.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
