# Chinese Typography Policy

## Scope

Apply typography enhancement only to reading-first article surfaces:

- published post bodies
- standalone long-form pages such as `about`
- explicitly opt-in prose containers

Do not apply automatic enhancement to:

- navigation
- cards and list metadata
- code blocks and inline code
- tables
- search controls
- tags, badges, and pagination
- buttons, forms, and any interactive widgets

## Hard Rules

1. Enhancement must be opt-in and container-scoped.
2. `NEXT_PUBLIC_ENABLE_HETI=false` must disable runtime typography enhancement cleanly.
3. Code semantics, table alignment, and UI affordances must never be altered.
4. Typography polish must not block first paint.

## Soft Rules

1. Prefer better Chinese-Latin spacing over decorative styling.
2. Preserve warm, quiet reading rhythm in both light and dark themes.
3. Keep punctuation compression subtle and readable.
4. Tune mobile paragraph flow before adding extra flourish.

## Escape Hatches

Use any of the following to exclude a subtree from typography mutation:

- `data-no-typography="true"`
- `.heti-skip`
- the selectors listed in `lib/typography/excluded-selectors.ts`
