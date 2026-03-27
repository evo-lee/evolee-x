Review the provided Markdown or MDX files and suggest improved SEO metadata when needed.

Return JSON only with this shape:
{
  "summary": "short summary",
  "suggestions": [
    {
      "file": "content/posts/example.mdx",
      "title": "seo metadata suggestion",
      "detail": "proposed seoTitle and/or seoDescription with a short reason",
      "severity": "info | warning | error",
      "line": 1
    }
  ]
}

Focus on:
- weak or generic titles
- descriptions that are too short, too long, or repetitive
- mismatches between metadata tone and article content
