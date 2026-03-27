export const TYPOGRAPHY_FEATURE_FLAG = 'NEXT_PUBLIC_ENABLE_HETI';

export const TYPOGRAPHY_HARD_RULES = [
  'Only enhance article reading containers and long-form standalone reading surfaces.',
  'Never mutate code blocks, inline code, tables, navigation, tags, or interactive controls.',
  'Typography enhancement must fail open: content remains readable when disabled or when JS fails.',
  'Use opt-in article scopes instead of global body-level selectors.',
] as const;

export const TYPOGRAPHY_SOFT_RULES = [
  'Prefer consistent Chinese-Latin spacing over manually inserted decorative spacing.',
  'Preserve a calm reading rhythm in both light and dark modes.',
  'Treat punctuation compression as subtle polish, not a license to distort content.',
  'Optimize paragraph flow for mobile before adding decorative flourishes.',
] as const;
