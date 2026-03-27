import { mkdir, writeFile } from 'fs/promises';
import * as path from 'path';
import { GENERATED_COVERS_DIR } from './files';
import type { CoverResolution } from './types';

const DEFAULT_COVER_ALT = 'Default blog cover';
const DEFAULT_COVER_SRC = '/images/default-cover.svg';

function getFirstImageFromHtml(html: string): { src: string; alt: string } | null {
  const match = html.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i);
  if (!match) {
    return null;
  }

  return {
    src: match[1],
    alt: match[2] || DEFAULT_COVER_ALT,
  };
}

/**
 * Resolve the cover image for a post using a deterministic fallback chain.
 *
 * Resolution order:
 * 1. Explicit `cover` from frontmatter
 * 2. First `<img>` found in rendered body HTML
 * 3. Repository default cover asset
 *
 * @param options.slug Post slug used to persist sidecar metadata.
 * @param options.html Raw rendered HTML before image URL rewriting.
 * @param options.cover Explicit frontmatter cover path, if present.
 * @param options.coverAlt Optional alt text paired with the explicit cover.
 * @returns Final cover source, alt text, and the resolution source label.
 * @throws Propagates filesystem errors if the sidecar metadata file cannot be written.
 */
export async function resolveCoverImage({
  slug,
  html,
  cover,
  coverAlt,
}: {
  slug: string;
  html: string;
  cover?: string;
  coverAlt?: string;
}): Promise<CoverResolution> {
  let resolution: CoverResolution;

  if (cover) {
    resolution = {
      src: cover,
      alt: coverAlt || DEFAULT_COVER_ALT,
      source: 'frontmatter',
    };
  } else {
    const firstImage = getFirstImageFromHtml(html);
    resolution = firstImage
      ? {
          ...firstImage,
          source: 'first-image',
        }
      : {
          src: DEFAULT_COVER_SRC,
          alt: DEFAULT_COVER_ALT,
          source: 'default',
        };
  }

  const outputPath = path.join(GENERATED_COVERS_DIR, `${slug}.json`);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(resolution, null, 2));

  return resolution;
}
