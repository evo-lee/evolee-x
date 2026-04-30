import { getImageUrl } from '@/lib/cloudflare/images';

export function CoverImage({
  src,
  alt,
  priority = false,
}: {
  src?: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="cover-image">
      <img
        alt={alt}
        className="cover-image__media"
        src={getImageUrl(src || '/images/default-cover.svg', 'cover-lg')}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  );
}
