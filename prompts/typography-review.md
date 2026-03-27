Review the provided Markdown or MDX files for typography and readability issues.

Return JSON only with this shape:
{
  "summary": "short summary",
  "suggestions": [
    {
      "file": "content/posts/example.mdx",
      "title": "typography issue",
      "detail": "actionable explanation",
      "severity": "info | warning | error",
      "line": 18
    }
  ]
}

Focus on:
- overlong paragraphs
- mixed Chinese-English spacing problems
- inconsistent punctuation style
- weak heading hierarchy
- list phrasing inconsistency
