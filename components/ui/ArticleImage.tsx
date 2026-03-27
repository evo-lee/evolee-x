import Image from 'next/image';
import { getImageUrl, getVariantConfig, type ImageVariant } from '@/lib/cloudflare/images';

export function ArticleImage({
  src,
  alt,
  variant = 'thumb-md',
  priority = false,
}: {
  src?: string;
  alt: string;
  variant?: Extract<ImageVariant, 'thumb-sm' | 'thumb-md'>;
  priority?: boolean;
}) {
  const config = getVariantConfig(variant);

  return (
    <div className="article-image" data-variant={variant}>
      <Image
        alt={alt}
        className="article-image__media"
        height={config.height}
        priority={priority}
        sizes={variant === 'thumb-sm' ? '160px' : '(max-width: 900px) 100vw, 220px'}
        src={getImageUrl(src || '/images/default-cover.svg', variant)}
        unoptimized
        width={config.width}
      />
    </div>
  );
}
