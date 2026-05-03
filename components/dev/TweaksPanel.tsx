'use client';

import {
  type ChangeEvent,
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { THEME_STORAGE_KEY } from '@/lib/theme';

const STYLE_ID = 'twk-style';
const STYLE_CSS = `
.twk-fab{position:fixed;right:16px;bottom:16px;z-index:2147483645;width:40px;height:40px;border-radius:999px;background:rgba(0,0,0,.8);color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;border:0;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.18)}
.twk-fab:hover{background:rgba(0,0,0,.9)}
.twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:rgba(250,249,247,.92);color:#29261b;-webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);border:.5px solid rgba(255,255,255,.6);border-radius:14px;box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
.twk-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 8px 10px 14px;cursor:move;user-select:none}
.twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
.twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1}
.twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
.twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;overflow-x:hidden;min-height:0}
.twk-row{display:flex;flex-direction:column;gap:5px}
.twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
.twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
.twk-lbl>span:first-child{font-weight:500}
.twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}
.twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:rgba(41,38,27,.45);padding:10px 0 0}
.twk-sect:first-child{padding-top:0}
.twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;border-radius:999px;background:rgba(0,0,0,.12);outline:none}
.twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:pointer}
.twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;background:rgba(0,0,0,.06)}
.twk-seg button{appearance:none;flex:1;border:0;background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;border-radius:6px;cursor:pointer;padding:4px 6px;line-height:1.2;color:rgba(41,38,27,.6)}
.twk-seg button[data-on='1']{background:rgba(255,255,255,.92);color:#29261b;box-shadow:0 1px 2px rgba(0,0,0,.12)}
.twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;background:rgba(0,0,0,.15);cursor:pointer;padding:0}
.twk-toggle[data-on='1']{background:#34c759}
.twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
.twk-toggle[data-on='1'] i{transform:translateX(14px)}
.twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:pointer;background:transparent}
.twk-swatch::-webkit-color-swatch-wrapper{padding:0}
.twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
`;

type Tweaks = {
  direction: 'light' | 'dark';
  fontScale: number;
  showTicker: boolean;
  accentColor: string;
};

const STORAGE_KEY = 'evolee-tweaks';

const DEFAULTS: Tweaks = {
  direction: 'light',
  fontScale: 1.05,
  showTicker: true,
  accentColor: '#8b6f47',
};

function readInitial(): Tweaks {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Tweaks>) };
    }
  } catch {}
  const themed = document.body.classList.contains('dark') ? 'dark' : 'light';
  return { ...DEFAULTS, direction: themed };
}

export function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULTS);
  const dragRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = STYLE_CSS;
    document.head.appendChild(style);
    setTweaks(readInitial());
    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.className = tweaks.direction;
    document.documentElement.style.setProperty('--font-scale', String(tweaks.fontScale));
    document.documentElement.style.setProperty('--accent', tweaks.accentColor);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks));
      window.localStorage.setItem(THEME_STORAGE_KEY, tweaks.direction);
    } catch {}
    document.body.dataset.showTicker = tweaks.showTicker ? '1' : '0';
  }, [tweaks]);

  const setKey = useCallback(<K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
    setTweaks((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (!open) {
    return (
      <button type="button" className="twk-fab" onClick={() => setOpen(true)} aria-label="Tweaks">
        ⚙
      </button>
    );
  }

  return (
    <div ref={dragRef} className="twk-panel" data-noncommentable="">
      <div className="twk-hd">
        <b>Tweaks (dev)</b>
        <button className="twk-x" onClick={() => setOpen(false)} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="twk-body">
        <div className="twk-sect">外观</div>
        <Row label="配色">
          <Segmented
            value={tweaks.direction}
            options={[
              { value: 'light', label: '亮色' },
              { value: 'dark', label: '暗色' },
            ]}
            onChange={(value) => setKey('direction', value as Tweaks['direction'])}
          />
        </Row>
        <ToggleRow
          label="显示信息滚动条"
          value={tweaks.showTicker}
          onChange={(value) => setKey('showTicker', value)}
        />

        <div className="twk-sect">字体与颜色</div>
        <Row label="字号比例" value={tweaks.fontScale.toFixed(2)}>
          <input
            type="range"
            className="twk-slider"
            min={0.85}
            max={1.2}
            step={0.05}
            value={tweaks.fontScale}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setKey('fontScale', Number(event.target.value))
            }
          />
        </Row>
        <ColorRow
          label="强调色"
          value={tweaks.accentColor}
          onChange={(value) => setKey('accentColor', value)}
        />
      </div>
    </div>
  );
}

function Row({ label, value, children, style }: { label: string; value?: string; children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div className="twk-row" style={style}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null ? <span className="twk-val">{value}</span> : null}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl">
        <span>{label}</span>
      </div>
      <button
        type="button"
        className="twk-toggle"
        data-on={value ? '1' : '0'}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
      >
        <i />
      </button>
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="twk-seg" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          data-on={option.value === value ? '1' : '0'}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl">
        <span>{label}</span>
      </div>
      <input
        type="color"
        className="twk-swatch"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      />
    </div>
  );
}
