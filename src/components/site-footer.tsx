import { IconGitHub } from "@/components/icons";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-12 border-t border-zinc-200/80 py-6 dark:border-zinc-800/80">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 px-4 text-[13px] leading-6 text-zinc-400 md:flex-row md:items-center md:justify-between md:px-8 dark:text-zinc-500">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            &copy; {new Date().getFullYear()}{" "}
            <a href={siteConfig.siteUrl} className="hover:text-zinc-600 dark:hover:text-zinc-300">
              LUOLEI.ORG
            </a>
          </span>
          <span className="hidden md:inline text-zinc-300 dark:text-zinc-700">·</span>
          <a href="http://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:text-zinc-600 dark:hover:text-zinc-300">
            {siteConfig.beian}
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a href="https://www.cloudflare.com" target="_blank" rel="noreferrer" className="group/cf inline-flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300">
            <img
              src="/icons/cloudflare-icon.svg"
              alt="Cloudflare"
              className="inline-block h-3.5 w-3.5 align-[-2px] grayscale opacity-60 transition-all duration-300 group-hover/cf:grayscale-0 group-hover/cf:opacity-100"
            />
            <span className="transition-colors duration-300 group-hover/cf:text-[#f38020]">Cloudflare 全球加速</span>
          </a>
          <span className="hidden md:inline text-zinc-300 dark:text-zinc-700">·</span>
          <span>
            本博客基于{" "}
            <a href="https://github.com/cloudflare/vinext" target="_blank" rel="noreferrer" className="hover:text-zinc-600 dark:hover:text-zinc-300">
              vinext
            </a>
            {" "}构建
          </span>
          <span className="hidden md:inline text-zinc-300 dark:text-zinc-700">·</span>
          <a
            href="https://github.com/foru17/luoleiorg-x"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            开源在 <IconGitHub className="inline-block h-3.5 w-3.5 align-[-2px]" /> GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
