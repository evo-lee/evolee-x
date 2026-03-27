import assert from 'node:assert/strict';
import { readFile, rm } from 'fs/promises';
import path from 'path';
import test from 'node:test';
import { resolveCoverImage } from '@/lib/content/cover-resolver';
import { GENERATED_COVERS_DIR } from '@/lib/content/files';

async function cleanup(slug: string) {
  await rm(path.join(GENERATED_COVERS_DIR, `${slug}.json`), { force: true });
}

test('resolveCoverImage prefers frontmatter cover over body images', async () => {
  const slug = 'test-frontmatter-cover';

  try {
    const cover = await resolveCoverImage({
      slug,
      html: '<p><img src="/images/body.svg" alt="Body image"></p>',
      cover: '/images/frontmatter.svg',
      coverAlt: 'Frontmatter image',
    });

    assert.deepEqual(cover, {
      src: '/images/frontmatter.svg',
      alt: 'Frontmatter image',
      source: 'frontmatter',
    });

    const persisted = JSON.parse(await readFile(path.join(GENERATED_COVERS_DIR, `${slug}.json`), 'utf8'));
    assert.deepEqual(persisted, cover);
  } finally {
    await cleanup(slug);
  }
});

test('resolveCoverImage falls back to the first body image', async () => {
  const slug = 'test-first-body-image';

  try {
    const cover = await resolveCoverImage({
      slug,
      html: '<p>Intro</p><img src="/images/body.svg" alt="Body image"><p>Outro</p>',
    });

    assert.deepEqual(cover, {
      src: '/images/body.svg',
      alt: 'Body image',
      source: 'first-image',
    });
  } finally {
    await cleanup(slug);
  }
});

test('resolveCoverImage falls back to the site default when no image exists', async () => {
  const slug = 'test-default-cover';

  try {
    const cover = await resolveCoverImage({
      slug,
      html: '<p>No images here.</p>',
    });

    assert.deepEqual(cover, {
      src: '/images/default-cover.svg',
      alt: 'Default blog cover',
      source: 'default',
    });
  } finally {
    await cleanup(slug);
  }
});
