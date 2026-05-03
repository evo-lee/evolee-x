'use client';

export function SearchBar({
  value,
  onChange,
  placeholder = '搜索标题、摘要、标签…',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        className="search-bar__input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="清空搜索"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
