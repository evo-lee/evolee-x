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
import tweetsCache from "@/../data/tweets-cache.json";

export const dynamic = "force-static";

interface CachedTweet {
  id: string;
  text: string;
  created_at: string;
  author: {
    name: string;
    username: string;
    profile_image_url: string;
  };
  media?: Array<{
    type: string;
    url: string;
    preview_image_url: string;
  }>;
}

const tweets = tweetsCache.tweets as unknown as Record<string, CachedTweet | undefined>;

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

function renderTweetForRss(tweetId: string): string {
  const tweetUrl = `https://x.com/i/status/${tweetId}`;
  const tweet = tweets[tweetId];

  if (!tweet) {
    return `<blockquote style="border-left:4px solid #1d9bf0;padding:12px 16px;margin:16px 0;background:#f7f9fa;"><p>🐦 <a href="${tweetUrl}" style="color:#1d9bf0;font-weight:bold;">查看推文 →</a></p></blockquote>`;
  }

  const { author, text, created_at, media } = tweet;
  const authorUrl = `https://x.com/${author.username}`;
  const date = new Date(created_at).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Render tweet text: preserve line breaks, escape XML entities
  const tweetText = escapeXml(text).replace(/\n/g, "<br/>");

  // Build image HTML if tweet has photos
  const images = media?.filter((m) => m.type === "photo") ?? [];
  const imageHtml = images.length > 0
    ? `<p>${images.map((img) => `<img src="${escapeXml(img.url || img.preview_image_url)}" alt="Tweet image" style="max-width:100%;border-radius:8px;margin-top:8px;" />`).join("")}</p>`
    : "";

  return `<blockquote style="border-left:4px solid #1d9bf0;padding:12px 16px;margin:16px 0;background:#f7f9fa;border-radius:0 8px 8px 0;"><p style="margin:0 0 8px;"><strong><a href="${authorUrl}" style="color:#0f1419;text-decoration:none;">${escapeXml(author.name)}</a></strong> <span style="color:#536471;">@${escapeXml(author.username)} · ${date}</span></p><p style="margin:0 0 12px;white-space:pre-wrap;line-height:1.6;">${tweetText}</p>${imageHtml}<p style="margin:8px 0 0;"><a href="${tweetUrl}" style="color:#1d9bf0;font-weight:bold;text-decoration:none;">🐦 在 X (Twitter) 上查看原文 →</a></p></blockquote>`;
}

function replaceTweetCards(markdown: string): string {
  return markdown.replace(
    /<TweetCard[\s\S]*?tweetId=["']([^"']+)["'][\s\S]*?\/>/g,
    (_match, tweetId: string) => renderTweetForRss(tweetId),
  );
}

async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const withTweets = replaceTweetCards(markdown);
  const cleaned = withTweets.replace(/<GearCard[\s\S]*?\/>/g, "");

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
