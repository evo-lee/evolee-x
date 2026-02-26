import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { getAllPosts, getPostRawContent } from "@/lib/content/posts";
import { getAISummary } from "@/lib/content/ai-data";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function compressHtml(html: string): string {
  return html.replace(/\n{2,}/g, "\n").replace(/>\s+</g, "> <").trim();
}

async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const cleaned = markdown
    .replace(/<TweetCard[\s\S]*?\/>/g, "")
    .replace(/<GearCard[\s\S]*?\/>/g, "");

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(cleaned);

  return compressHtml(String(result));
}

function buildAISummaryHtml(abstract: string): string {
  return `<blockquote style="border-left:4px solid #f59e0b;padding:12px 16px;margin:0 0 24px;background:#fffbeb;"><p><strong>🤖 AI 摘要</strong></p><p>${escapeXml(abstract)}</p></blockquote>`;
}

export async function GET() {
  const posts = getAllPosts().slice(0, 10);

  const items: string[] = [];
  for (const post of posts) {
    const rawContent = getPostRawContent(post.slug);
    let contentHtml = "";

    if (rawContent) {
      contentHtml = await renderMarkdownToHtml(rawContent);
    }

    const aiSummary = getAISummary(post.slug);
    const summaryHtml = aiSummary ? buildAISummaryHtml(aiSummary.abstract) : "";

    const fullHtml = summaryHtml + contentHtml;

    items.push(`<item><title><![CDATA[${post.title}]]></title><link>${siteConfig.siteUrl}/${post.slug}</link><guid>${siteConfig.siteUrl}/${post.slug}</guid><pubDate>${new Date(post.dateTime).toUTCString()}</pubDate><description><![CDATA[${post.excerpt}]]></description><content:encoded><![CDATA[${fullHtml}]]></content:encoded></item>`);
  }

  const rss = `<?xml version="1.0" encoding="UTF-8" ?><rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0"><channel><title><![CDATA[${siteConfig.title}]]></title><description><![CDATA[${siteConfig.description}]]></description><link>${siteConfig.siteUrl}</link><language>zh-CN</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate><image><title>${escapeXml(siteConfig.title)}</title><url>${siteConfig.siteUrl}/logo.jpg</url><link>${siteConfig.siteUrl}</link></image>${items.join("")}</channel></rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
