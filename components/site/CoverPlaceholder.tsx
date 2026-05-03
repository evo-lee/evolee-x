const PALETTE = ['#D4C5B0', '#B8C4B4', '#C4B8D4', '#B4C4C4', '#C4CAB4', '#D4C4B4'];

export function pickCoverColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function CoverPlaceholder({ color, label = 'cover image' }: { color?: string; label?: string }) {
  return (
    <div className="cover-ph" style={{ background: color || PALETTE[0] }}>
      <span className="cover-ph__label">{label}</span>
    </div>
  );
}
