Review the provided Markdown or MDX files for proofreading issues.

Return JSON only with this shape:
{
  "summary": "short summary",
  "suggestions": [
    {
      "file": "content/posts/example.mdx",
      "title": "short issue title",
      "detail": "actionable explanation",
      "severity": "info | warning | error",
      "line": 12
    }
  ]
}

Focus on:
- spelling and grammar mistakes
- repeated sentence patterns
- punctuation inconsistencies
- awkward wording that hurts readability

Do not rewrite whole sections. Suggest reviewable edits only.
