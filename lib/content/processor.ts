import { toHtml } from 'hast-util-to-html';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { getImageUrl } from '@/lib/cloudflare/images';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import type { Heading, ProcessedContent } from './types';

function stripTags(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripInlineHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

function buildExcerpt(text: string, maxLength = 180): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function extractHeadings(html: string): Heading[] {
  const matches = html.matchAll(/<h([1-6]) id="([^"]+)".*?>([\s\S]*?)<\/h\1>/g);
  return Array.from(matches, (match) => ({
    level: Number(match[1]),
    id: match[2],
    text: stripInlineHtml(match[3]),
  }));
}

function rewriteImageSources(html: string): string {
  return html.replace(/<img([^>]*?)src="([^"]+)"([^>]*)>/g, (match, beforeSrc, src, afterSrc) => {
    if (src.startsWith('/image/')) {
      return match;
    }

    return `<img${beforeSrc}src="${getImageUrl(src, 'cover-md')}"${afterSrc}>`;
  });
}

export interface ProcessedMarkdown extends ProcessedContent {
  rawHtml: string;
}

export async function processMarkdown(source: string): Promise<ProcessedMarkdown> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'append' })
    .use(rehypePrettyCode, { theme: 'github-light-default', keepBackground: false });

  const tree = processor.parse(source);
  const htmlTree = await processor.run(tree);
  const rawHtml = toHtml(htmlTree).trim();
  const html = rewriteImageSources(rawHtml);
  const text = stripTags(rawHtml);

  return {
    html,
    rawHtml,
    text,
    excerpt: buildExcerpt(text),
    headings: extractHeadings(rawHtml),
  };
}
