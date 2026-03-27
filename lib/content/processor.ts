import { compileMDX } from 'next-mdx-remote/rsc';
import { renderToStaticMarkup } from 'react-dom/server';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
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

export async function processMarkdown(source: string): Promise<ProcessedContent> {
  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'append' }],
          [rehypePrettyCode, { theme: 'github-light-default', keepBackground: false }],
        ],
      },
    },
  });

  const html = renderToStaticMarkup(content).trim();
  const text = stripTags(html);

  return {
    html,
    text,
    excerpt: buildExcerpt(text),
    headings: extractHeadings(html),
  };
}

