import { mkdir, writeFile } from 'fs/promises';
import * as path from 'path';
import { GENERATED_COVERS_DIR } from './files';
import type { CoverResolution } from './types';

const DEFAULT_COVER_ALT = 'Default blog cover';
const DEFAULT_COVER_SVG = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">' +
    '<rect width="1200" height="630" fill="#f4efe7"/>' +
    '<rect x="72" y="72" width="1056" height="486" rx="32" fill="#143642"/>' +
    '<text x="120" y="260" fill="#f4efe7" font-size="88" font-family="Georgia, serif">evolee</text>' +
    '<text x="120" y="360" fill="#d9c6a5" font-size="36" font-family="Georgia, serif">Personal blog</text>' +
    '</svg>'
);

const DEFAULT_COVER_SRC = `data:image/svg+xml;charset=utf-8,${DEFAULT_COVER_SVG}`;

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
