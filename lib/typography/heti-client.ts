import { HETI_EXCLUDED_SELECTORS } from '@/lib/typography/excluded-selectors';
import { TYPOGRAPHY_FEATURE_FLAG } from '@/lib/typography/policy';

function typographyEnabled() {
  if (typeof process === 'undefined') {
    return true;
  }

  return process.env[TYPOGRAPHY_FEATURE_FLAG] !== 'false';
}

export async function initHetiForArticle(selector: string) {
  if (!typographyEnabled() || typeof document === 'undefined') {
    return;
  }

  const container = document.querySelector<HTMLElement>(selector);

  if (!container || container.dataset.hetiApplied === 'true') {
    return;
  }

  container.classList.add('heti');

  HETI_EXCLUDED_SELECTORS.forEach((excludedSelector) => {
    container.querySelectorAll<HTMLElement>(excludedSelector).forEach((element) => {
      element.classList.add('heti-skip');
    });
  });

  try {
    const mod = await import('heti/js/heti-addon.js');
    const Heti = mod.default;
    const heti = new Heti(selector);

    if (typeof heti.autoSpacing === 'function') {
      heti.autoSpacing();
    }

    container.dataset.hetiApplied = 'true';
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to initialize Heti typography.', error);
    }
  }
}
