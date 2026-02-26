import Link from "next/link";
import { categoryMap } from "@/lib/site-config";

interface CategoryNavProps {
  currentCategory?: string;
}

export function CategoryNav({ currentCategory }: CategoryNavProps) {
  const homeCategories = categoryMap.filter((category) => category.isHome);
  
  return (
    <div className="category-nav mx-auto max-w-7xl px-1 md:px-4 md:px-0">
      <div className="mt-3 h-16 w-full px-4">
        <div className="flex w-full items-center justify-between">
          <div className="m-auto flex items-center text-black dark:text-slate-300">
            {/* Categories with CSS separator */}
            <div className="flex items-center">
              {/* 最新 */}
              <Link
                href="/"
                prefetch={true}
                className={`home-nav-title relative ml-0 mr-0 rounded-xl px-3 py-1 text-center text-sm hover:text-rose-400 md:ml-1 md:mr-2 md:text-base ${
                  currentCategory
                    ? "!text-black dark:!text-slate-300"
                    : "!text-rose-400 !font-semibold dark:!text-rose-400"
                }`}
              >
                最新
              </Link>
              {/* Category items */}
              {homeCategories.map((category) => {
                const active = currentCategory === category.text;

                return (
                  <Link
                    key={category.text}
                    href={`/category/${encodeURIComponent(category.text)}`}
                    prefetch={true}
                    className={`home-nav-title relative ml-0 mr-0 inline-block rounded-xl px-3 py-1 text-center text-sm hover:text-rose-400 md:ml-1 md:mr-2 md:px-3 md:text-base ${
                      active
                        ? "!text-rose-400 !font-semibold dark:!text-rose-400"
                        : ""
                    }`}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
