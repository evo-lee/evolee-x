"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ArticleTocSectionList } from "@/components/article-toc-section-list";
import { type TocHeading, useArticleTocState } from "@/hooks/use-article-toc";

interface ArticleTocProps {
  headings: TocHeading[];
}

function MobileArticleToc({
  activeId,
  activeSectionLabel,
  expandedSectionId,
  handleSelectHeading,
  sections,
}: {
  activeId: string;
  activeSectionLabel: string;
  expandedSectionId: string;
  handleSelectHeading: (id: string) => void;
  sections: ReturnType<typeof useArticleTocState>["sections"];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="fixed left-1/2 top-2 z-50 w-[calc(100%-1rem)] -translate-x-1/2 md:hidden transition-all duration-300 translate-y-0 opacity-100">
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
            <ArticleTocSectionList
              activeId={activeId}
              expandedSectionId={expandedSectionId}
              onSelectHeading={(id) => {
                setMobileOpen(false);
                handleSelectHeading(id);
              }}
              sections={sections}
              listClassName="max-h-[58vh] space-y-1 overflow-y-auto px-3 py-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArticleToc({ headings }: ArticleTocProps) {
  const {
    activeId,
    activeSectionLabel,
    expandedSectionId,
    handleSelectHeading,
    markerRef,
    mobileVisible,
    sections,
  } = useArticleTocState(headings);

  if (!sections.length) {
    return null;
  }

  return (
    <>
      {mobileVisible ? (
        <MobileArticleToc
          activeId={activeId}
          activeSectionLabel={activeSectionLabel}
          expandedSectionId={expandedSectionId}
          handleSelectHeading={handleSelectHeading}
          sections={sections}
        />
      ) : null}

      <div className="hidden lg:block lg:w-[220px] lg:flex-shrink-0">
        <div className="toc-scroll fixed top-[110px] w-[220px] max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="article-toc">
            <span
              aria-hidden="true"
              ref={markerRef}
              className="article-toc-marker"
            />
            <p className="article-toc-title">本文导览</p>
            <ArticleTocSectionList
              activeId={activeId}
              expandedSectionId={expandedSectionId}
              onSelectHeading={handleSelectHeading}
              sections={sections}
              withDataIds
            />
          </div>
        </div>
      </div>
    </>
  );
}
