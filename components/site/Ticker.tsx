export function Ticker({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;
  const text = items.join('   ·   ') + '   ·   ';
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__inner">
        <span>
          {text}
          {text}
        </span>
      </div>
    </div>
  );
}
