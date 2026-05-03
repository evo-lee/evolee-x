'use client';

import dynamic from 'next/dynamic';

const TweaksPanel = dynamic(() => import('./TweaksPanel').then((mod) => mod.TweaksPanel), {
  ssr: false,
});

export function DevTweaksMount() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  return <TweaksPanel />;
}
