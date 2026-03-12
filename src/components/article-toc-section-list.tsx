"use client";

import type { TocSection } from "@/hooks/use-article-toc";

interface ArticleTocSectionListProps {
  activeId: string;
  expandedSectionId: string;
  onSelectHeading: (id: string) => void;
  sections: TocSection[];
  listClassName?: string;
  withDataIds?: boolean;
}

export function ArticleTocSectionList({
  activeId,
  expandedSectionId,
  onSelectHeading,
  sections,
  listClassName = "space-y-1",
  withDataIds = false,
}: ArticleTocSectionListProps) {
  return (
    <ul className={listClassName}>
      {sections.map((section) => (
        <li key={section.heading.id}>
          <a
            href={`#${section.heading.id}`}
            data-toc-id={withDataIds ? section.heading.id : undefined}
            className={`article-toc-link ${
              activeId === section.heading.id ? "is-active" : ""
            }`}
            onClick={() => onSelectHeading(section.heading.id)}
          >
            {section.heading.text}
          </a>
          {section.children.length > 0 && (
            <div
              className={`toc-children-wrapper ${
                expandedSectionId === section.heading.id ? "is-expanded" : ""
              }`}
            >
              <ul className="toc-children-inner">
                {section.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      data-toc-id={withDataIds ? child.id : undefined}
                      className={`article-toc-link toc-h3 ${
                        activeId === child.id ? "is-active" : ""
                      }`}
                      onClick={() => onSelectHeading(child.id)}
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
  );
}
