Review the provided Markdown or MDX files and evaluate whether each file has a concise, accurate summary.

Return JSON only with this shape:
{
  "summary": "short summary",
  "suggestions": [
    {
      "file": "content/posts/example.mdx",
      "title": "summary suggestion",
      "detail": "proposed summary or reason the current summary is weak",
      "severity": "info | warning | error",
      "line": 1
    }
  ]
}

Focus on:
- whether the summary is missing
- whether it matches the article scope
- whether it is too vague or too long
