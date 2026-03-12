import type { ReactNode } from "react";
import Image from "next/image";

interface TweetMediaGridProps {
  images: string[];
  tweetUrl: string;
}

function TweetMediaImage({
  className,
  sizes,
  src,
}: {
  className: string;
  sizes: string;
  src: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt="Tweet media"
        fill
        sizes={sizes}
        className="border-0 object-cover transition-transform hover:scale-[1.02]"
      />
    </div>
  );
}

function TweetMediaLink({
  children,
  className,
  tweetUrl,
}: {
  children: ReactNode;
  className?: string;
  tweetUrl: string;
}) {
  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noreferrer"
      className={`block overflow-hidden rounded-xl ${className ?? ""}`}
    >
      {children}
    </a>
  );
}

export function TweetMediaGrid({ images, tweetUrl }: TweetMediaGridProps) {
  const count = images.length;

  if (count === 1) {
    return (
      <TweetMediaLink tweetUrl={tweetUrl}>
        <TweetMediaImage
          src={images[0]}
          className="aspect-[16/10]"
          sizes="(max-width: 768px) 100vw, 32rem"
        />
      </TweetMediaLink>
    );
  }

  if (count === 2) {
    return (
      <TweetMediaLink tweetUrl={tweetUrl}>
        <div className="grid grid-cols-2 gap-0.5">
          <TweetMediaImage
            src={images[0]}
            className="aspect-[4/3]"
            sizes="(max-width: 768px) 50vw, 16rem"
          />
          <TweetMediaImage
            src={images[1]}
            className="aspect-[4/3]"
            sizes="(max-width: 768px) 50vw, 16rem"
          />
        </div>
      </TweetMediaLink>
    );
  }

  if (count === 3) {
    return (
      <TweetMediaLink tweetUrl={tweetUrl}>
        <div className="grid grid-cols-2 gap-0.5" style={{ aspectRatio: "16/9" }}>
          <TweetMediaImage
            src={images[0]}
            className="row-span-2 h-full"
            sizes="(max-width: 768px) 50vw, 16rem"
          />
          <TweetMediaImage
            src={images[1]}
            className="h-full"
            sizes="(max-width: 768px) 25vw, 8rem"
          />
          <TweetMediaImage
            src={images[2]}
            className="h-full"
            sizes="(max-width: 768px) 25vw, 8rem"
          />
        </div>
      </TweetMediaLink>
    );
  }

  return (
    <TweetMediaLink tweetUrl={tweetUrl}>
      <div className="grid grid-cols-2 gap-0.5">
        {images.slice(0, 4).map((src, index) => (
          <div key={index} className="contents">
            <TweetMediaImage
              src={src}
              className="aspect-[4/3]"
              sizes="(max-width: 768px) 50vw, 16rem"
            />
          </div>
        ))}
      </div>
    </TweetMediaLink>
  );
}
