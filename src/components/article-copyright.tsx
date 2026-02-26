import { IconCopyright, IconMarkdown } from "@/components/icons";

interface ArticleCopyrightProps {
  title: string;
  date: string;
  slug: string;
}

export function ArticleCopyright({ title, date, slug }: ArticleCopyrightProps) {
  const articleLink = `https://luolei.org/${slug}`;
  const markdownLink = `https://github.com/foru17/luoleiorg-x/tree/main/content/posts/${slug}.md`;

  return (
    <div className="w-auto">
      <div className="relative rounded-md border border-zinc-300 px-5 py-5 dark:border-zinc-700">
        <section className="flex flex-col gap-y-2 text-sm">
          {/* Copyright icon - absolute positioned */}
          <IconCopyright className="absolute right-3 top-3 h-4 w-4 text-gray-900 dark:text-slate-200 md:right-5 md:h-6 md:w-6" />
          
          {/* 作者 */}
          <div>
            <span className="mr-1 font-medium">作者:</span>
            <span>
              <a
                href="https://luolei.org"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-300"
                rel="noreferrer"
                target="_blank"
              >
                罗磊
              </a>
            </span>
          </div>

          {/* 文章标题 */}
          <div className="inline-flex">
            <span className="mr-1 font-medium">文章标题:</span>
            <span>
              <a
                href={markdownLink}
                className="flex flex-row items-center hover:text-blue-500"
                rel="noreferrer"
                target="_blank"
              >
                {title}
                <IconMarkdown className="ml-2 h-5 w-5" />
              </a>
            </span>
          </div>

          {/* 发表时间 */}
          <div>
            <span className="mr-1 font-medium">发表时间:</span>
            <span>{date}</span>
          </div>

          {/* 文章链接 */}
          <div>
            <span className="mr-1 font-medium">文章链接:</span>
            <span>
              <a
                href={articleLink}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-300"
                rel="noreferrer"
                target="_blank"
              >
                {articleLink}
              </a>
            </span>
          </div>

          {/* 版权说明 */}
          <div className="flex items-center">
            <span className="mr-1 font-medium">版权说明:</span>
            <a
              href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-300"
              rel="noreferrer"
              target="_blank"
            >
              <span>CC BY-NC-ND 4.0 DEED </span>
            </a>
            <IconCopyright className="ml-2 h-4 w-4 text-gray-900 dark:text-slate-400" />
          </div>
        </section>
      </div>
    </div>
  );
}
