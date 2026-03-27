import Image from 'next/image';
import { getImageUrl, getVariantConfig } from '@/lib/cloudflare/images';

export function CoverImage({
  src,
  alt,
  priority = false,
}: {
  src?: string;
  alt: string;
  priority?: boolean;
}) {
  const config = getVariantConfig('cover-lg');

  return (
    <div className="cover-image">
      <Image
        alt={alt}
        className="cover-image__media"
        height={config.height}
        priority={priority}
        sizes="(max-width: 900px) 100vw, 960px"
        src={getImageUrl(src || '/images/default-cover.svg', 'cover-lg')}
        unoptimized
        width={config.width}
      />
    </div>
  );
}
