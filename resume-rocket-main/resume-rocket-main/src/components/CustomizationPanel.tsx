import React, { useState, useRef, useEffect } from "react";
import { ResumeData } from "./ResumeForm";

// ─── Types ────────────────────────────────────────────────
interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

type Tab = "basics" | "layout" | "design" | "header" | "sections";

// ─── Constants ────────────────────────────────────────────
const FONT_SIZE_LABELS = ["8", "9", "10", "10.5", "11", "11.5", "12", "13", "14"];
const LINE_HEIGHT_LABELS = ["1.0", "1.1", "1.15", "1.2", "1.3", "1.4", "1.5", "1.7", "2.0"];
const MARGIN_H_LABELS = ["6mm", "8mm", "10mm", "12mm", "14mm", "16mm", "18mm", "22mm", "28mm"];
const MARGIN_V_LABELS = ["6mm", "8mm", "10mm", "12mm", "14mm", "16mm", "18mm", "22mm", "28mm"];
const ENTRY_SPACING_LABELS = ["–", "1mm", "2mm", "3mm", "4mm", "5mm", "6mm", "8mm", "10mm"];

const ACCENT_COLORS = [
  null, // "none" slot — transparent/slash
  "#495963", "#547980", "#93b7be", "#348aa7", "#355c7d",
  "#386fa4", "#6798c0", "#59a5d8", "#84d2f6",
  "#432371", "#672d50", "#c06c84", "#c7417b", "#f45b69",
];

const SERIF_FONTS = [
  { label: "Lora",              value: "Lora, serif" },
  { label: "Source Serif Pro",  value: "'Source Serif Pro', serif" },
  { label: "Zilla Slab",        value: "'Zilla Slab', serif" },
  { label: "PT Serif",          value: "'PT Serif', serif" },
  { label: "EB Garamond",       value: "'EB Garamond', serif" },
  { label: "Crimson Pro",       value: "'Crimson Pro', serif" },
  { label: "Garamond",          value: "Garamond, serif" },
  { label: "Georgia",           value: "Georgia, serif" },
  { label: "Times New Roman",   value: "'Times New Roman', serif" },
];
const SANS_FONTS = [
  { label: "Inter",             value: "'Inter', sans-serif" },
  { label: "Roboto",            value: "Roboto, sans-serif" },
  { label: "Open Sans",         value: "'Open Sans', sans-serif" },
  { label: "Lato",              value: "Lato, sans-serif" },
  { label: "Nunito",            value: "Nunito, sans-serif" },
  { label: "Raleway",           value: "Raleway, sans-serif" },
  { label: "Arial",             value: "Arial, sans-serif" },
  { label: "Trebuchet MS",      value: "'Trebuchet MS', sans-serif" },
  { label: "Calibri",           value: "Calibri, sans-serif" },
];
const MONO_FONTS = [
  { label: "Courier New",       value: "'Courier New', monospace" },
  { label: "Consolas",          value: "Consolas, monospace" },
  { label: "IBM Plex Mono",     value: "'IBM Plex Mono', monospace" },
];

const HEADING_STYLES: { id: string; svg: React.ReactNode }[] = [
  {
    id: "underline",
    svg: (
      <svg viewBox="0 0 137 49" fill="none" className="w-full h-auto">
        <rect width="48" height="9" x="20" y="16" rx="1" stroke="currentColor" />
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5" d="M20 32L68 32" />
      </svg>
    ),
  },
  {
    id: "box",
    svg: (
      <svg viewBox="0 0 137 49" fill="none" className="w-full h-auto">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M29 35h79M108 14v21M29 13.92h79M29 14v20.5" />
        <rect x="47" y="20" width="44" height="9" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "simple",
    svg: (
      <svg viewBox="0 0 137 49" fill="none" className="w-full h-auto">
        <rect width="44" height="9" x="20" y="20" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "topBottomLine",
    svg: (
      <svg viewBox="0 0 137 49" fill="none" className="w-full h-auto">
        <line x1="27" y1="35" x2="110" y2="35" stroke="currentColor" strokeWidth="2" />
        <line x1="27" y1="14" x2="110" y2="14" stroke="currentColor" strokeWidth="2" />
        <rect x="46" y="20" width="44" height="9" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "line",
    svg: (
      <svg viewBox="0 0 137 49" fill="none" className="w-full h-auto">
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M20 33L100 33" />
        <rect width="44" height="9" x="20" y="16" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "thickShortUnderline",
    svg: (
      <svg viewBox="0 0 137 49" fill="none" className="w-full h-auto">
        <rect width="48" height="9" x="20" y="15" rx="1" fill="currentColor" />
        <path stroke="currentColor" strokeWidth="5" d="M20 32.5 L40 32.5" />
      </svg>
    ),
  },
  {
    id: "thinLine",
    svg: (
      <svg viewBox="0 0 137 49" fill="none" className="w-full h-auto">
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="1" d="M20 33L100 33" />
        <rect width="44" height="9" x="20" y="16" rx="1" fill="currentColor" />
      </svg>
    ),
  },
];

// ─── The slider step component (like FlowCV) ──────────────
function StepSlider({
  value, max = 8, labels, onChange,
}: {
  value: number;
  max?: number;
  labels: string[];
  onChange: (v: number) => void;
}) {
  const steps = max + 1;
  const pct = (value / max) * 100;
  const trackRef = useRef<HTMLDivElement>(null);

  const clamp = (v: number) => Math.min(max, Math.max(0, Math.round(v)));

  const setFromX = (clientX: number) => {
    if (!trackRef.current) return;
    const { left, width } = trackRef.current.getBoundingClientRect();
    onChange(clamp(((clientX - left) / width) * max));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setFromX(e.clientX);
    const move = (ev: MouseEvent) => setFromX(ev.clientX);
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div className="flex items-center gap-3">
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        className="relative flex h-10 flex-1 cursor-grab items-center rounded bg-gray-100 select-none"
      >
        {/* Tick marks */}
        {Array.from({ length: steps }).map((_, i) => (
          <div
            key={i}
            className="absolute h-4 w-px bg-gray-300"
            style={{ left: `${(i / max) * 100}%`, transform: "translateX(-50%)" }}
          />
        ))}
        {/* Active thumb */}
        <div
          className="absolute h-10 bg-blue-600 rounded transition-transform"
          style={{ left: `${pct}%`, width: `${100 / steps}%`, transform: "translateX(-50%)" }}
        />
      </div>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-10 w-10 min-w-10 items-center justify-center rounded border border-gray-200 font-bold hover:opacity-80"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 13H5v-2h14v2z" /></svg>
      </button>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-10 w-10 min-w-10 items-center justify-center rounded border border-gray-200 font-bold hover:opacity-80"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4"><path d="M15 7H9V1a1 1 0 00-2 0v6H1a1 1 0 000 2h6v6a1 1 0 102 0V9h6a1 1 0 100-2z" /></svg>
      </button>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-7 py-7 mb-5">
      {children}
    </div>
  );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl font-semibold text-gray-800 tracking-tight mb-5">{children}</h2>;
}
function ControlLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[15px] font-bold text-gray-900 mb-2 mt-0.5">{children}</div>;
}
function RadioPill({
  active, onClick, children, style,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`flex h-10 w-full cursor-pointer items-center justify-center rounded-xl text-sm capitalize transition-all ${
        active
          ? "border-2 border-blue-600 bg-blue-50 text-blue-700 font-semibold"
          : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300"
      }`}
    >
      {children}
    </button>
  );
}
function Checkbox({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="cursor-pointer flex items-center gap-3 hover:opacity-80">
      <div
        onClick={() => onChange(!checked)}
        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
          checked ? "bg-blue-600 text-white" : "border-2 border-gray-300"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5">
            <path d="M0 0h24v24H0z" fill="none" /><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
          </svg>
        )}
      </div>
      <span className="text-base">{label}</span>
    </label>
  );
}

// ─── Tab nav (like FlowCV's top nav) ─────────────────────
const TABS: { id: Tab; label: string }[] = [
  { id: "basics",   label: "Basics" },
  { id: "layout",   label: "Layout & Spacing" },
  { id: "design",   label: "Design" },
  { id: "header",   label: "Header" },
  { id: "sections", label: "Sections" },
];

// ─── MAIN COMPONENT ───────────────────────────────────────
export const CustomizationPanel = ({ data, onChange }: Props) => {
  const [tab, setTab] = useState<Tab>("basics");
  const set = (patch: Partial<ResumeData>) => onChange({ ...data, ...patch });

  // Derived values with defaults
  const fs = data.fontSize ?? 5;          // step index 0–8
  const lh = data.lineHeight ?? 4;        // step index
  const mh = data.marginH ?? 2;
  const mv = data.marginV ?? 3;
  const es = data.entrySpacing ?? 0;
  const accent = data.accentColor ?? "#1d4ed8";
  const hs = data.headingStyle ?? "thinLine";
  const hcap = data.headingCaps ?? "capitalize";
  const hsize = data.headingSize ?? "xl";
  const ff = data.fontFamily ?? "";

  // Font category
  const isSerif = SERIF_FONTS.some(f => f.value === ff);
  const isMono  = MONO_FONTS.some(f => f.value === ff);
  const fontCat = isMono ? "mono" : isSerif ? "serif" : "sans";
  const fontList = fontCat === "serif" ? SERIF_FONTS : fontCat === "mono" ? MONO_FONTS : SANS_FONTS;

  return (
    <div className="w-full font-sans">

      {/* ── Tab nav ─────────────────────────────── */}
      <nav className="mb-8">
        {/* Mobile: horizontal scroll pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 lg:hidden scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-[13px] font-medium shadow-sm transition-all ${
                tab === t.id
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-200 bg-white text-gray-700 hover:underline"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Desktop: pill group */}
        <div className="hidden lg:inline-flex rounded-xl border border-gray-200 bg-gray-50 shadow-sm overflow-hidden">
          {TABS.map((t, i) => (
            <React.Fragment key={t.id}>
              {i > 0 && <span className="w-px shrink-0 bg-gray-200" />}
              <button
                type="button"
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap px-5 py-3.5 text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-white text-blue-700 font-semibold shadow-inner"
                    : "text-gray-700 hover:underline"
                }`}
              >
                {t.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          TAB: BASICS
      ══════════════════════════════════════════ */}
      {tab === "basics" && (
        <div>
          <SectionTitle>Basics</SectionTitle>

          {/* Template picker */}
          <Card>
            <div className="text-xl font-extrabold text-gray-900 mb-1">Apply a design template</div>
            <p className="text-gray-500 mb-5 text-sm">Click any template to instantly transform your resume ✨</p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {([
                {
                  id: "modern", label: "Modern", sub: "Accent sidebar",
                  thumb: (
                    <svg viewBox="0 0 80 106" fill="none" className="w-full h-auto">
                      <rect width="80" height="106" rx="2" fill="#f8fafc"/>
                      <rect width="26" height="106" rx="0" fill="#1d4ed8"/>
                      <rect x="30" y="8" width="42" height="5" rx="1" fill="#1e293b"/>
                      <rect x="30" y="16" width="30" height="2" rx="1" fill="#94a3b8"/>
                      <rect x="30" y="24" width="38" height="2" rx="1" fill="#cbd5e1"/>
                      <rect x="30" y="28" width="30" height="2" rx="1" fill="#cbd5e1"/>
                      <rect x="30" y="36" width="20" height="2" rx="1" fill="#1d4ed8"/>
                      <rect x="30" y="40" width="42" height="1.5" rx="1" fill="#e2e8f0"/>
                      <rect x="30" y="45" width="38" height="2" rx="1" fill="#cbd5e1"/>
                      <rect x="30" y="49" width="34" height="2" rx="1" fill="#cbd5e1"/>
                      <rect x="30" y="56" width="20" height="2" rx="1" fill="#1d4ed8"/>
                      <rect x="30" y="60" width="42" height="1.5" rx="1" fill="#e2e8f0"/>
                      <rect x="30" y="65" width="36" height="2" rx="1" fill="#cbd5e1"/>
                      <rect x="4" y="8" width="18" height="18" rx="9" fill="#3b82f6" opacity=".4"/>
                      <rect x="4" y="32" width="18" height="2" rx="1" fill="#fff" opacity=".5"/>
                      <rect x="4" y="37" width="14" height="2" rx="1" fill="#fff" opacity=".35"/>
                      <rect x="4" y="42" width="16" height="2" rx="1" fill="#fff" opacity=".35"/>
                      <rect x="4" y="52" width="18" height="2" rx="1" fill="#fff" opacity=".5"/>
                      <rect x="4" y="57" width="12" height="2" rx="1" fill="#fff" opacity=".35"/>
                      <rect x="4" y="62" width="15" height="2" rx="1" fill="#fff" opacity=".35"/>
                    </svg>
                  ),
                },
                {
                  id: "simple", label: "Minimalist", sub: "Classic single col",
                  thumb: (
                    <svg viewBox="0 0 80 106" fill="none" className="w-full h-auto">
                      <rect width="80" height="106" rx="2" fill="#fff"/>
                      <rect x="10" y="10" width="60" height="6" rx="1" fill="#111"/>
                      <rect x="10" y="18" width="60" height="1" rx="1" fill="#111"/>
                      <rect x="10" y="22" width="40" height="2" rx="1" fill="#9ca3af"/>
                      <rect x="10" y="30" width="22" height="2" rx="1" fill="#374151"/>
                      <rect x="10" y="33" width="60" height="1" rx="1" fill="#e5e7eb"/>
                      <rect x="10" y="37" width="55" height="2" rx="1" fill="#9ca3af"/>
                      <rect x="10" y="41" width="50" height="2" rx="1" fill="#9ca3af"/>
                      <rect x="10" y="50" width="22" height="2" rx="1" fill="#374151"/>
                      <rect x="10" y="53" width="60" height="1" rx="1" fill="#e5e7eb"/>
                      <rect x="10" y="57" width="55" height="2" rx="1" fill="#9ca3af"/>
                      <rect x="10" y="61" width="48" height="2" rx="1" fill="#9ca3af"/>
                      <rect x="10" y="68" width="22" height="2" rx="1" fill="#374151"/>
                      <rect x="10" y="71" width="60" height="1" rx="1" fill="#e5e7eb"/>
                      <rect x="10" y="75" width="52" height="2" rx="1" fill="#9ca3af"/>
                    </svg>
                  ),
                },
                {
                  id: "creative", label: "Creative", sub: "Two-column layout",
                  thumb: (
                    <svg viewBox="0 0 80 106" fill="none" className="w-full h-auto">
                      <rect width="80" height="106" rx="2" fill="#fff"/>
                      <rect width="80" height="3" fill="#6366f1"/>
                      <rect x="8" y="7" width="64" height="14" rx="2" fill="#f5f3ff"/>
                      <rect x="12" y="10" width="30" height="4" rx="1" fill="#4338ca"/>
                      <rect x="12" y="16" width="22" height="2" rx="1" fill="#818cf8"/>
                      <rect x="8" y="25" width="30" height="74" rx="1" fill="none"/>
                      <rect x="42" y="25" width="30" height="74" rx="1" fill="none"/>
                      <rect x="8" y="25" width="28" height="2" rx="1" fill="#6366f1" opacity=".3"/>
                      <rect x="8" y="29" width="28" height="2" rx="1" fill="#d1d5db"/>
                      <rect x="8" y="33" width="22" height="2" rx="1" fill="#d1d5db"/>
                      <rect x="8" y="40" width="28" height="2" rx="1" fill="#6366f1" opacity=".3"/>
                      <rect x="8" y="44" width="26" height="2" rx="1" fill="#d1d5db"/>
                      <rect x="8" y="48" width="20" height="2" rx="1" fill="#d1d5db"/>
                      <rect x="42" y="25" width="28" height="2" rx="1" fill="#6366f1" opacity=".3"/>
                      <rect x="42" y="29" width="28" height="2" rx="1" fill="#d1d5db"/>
                      <rect x="42" y="33" width="22" height="2" rx="1" fill="#d1d5db"/>
                      <rect x="42" y="40" width="28" height="2" rx="1" fill="#6366f1" opacity=".3"/>
                      <rect x="42" y="44" width="26" height="2" rx="1" fill="#d1d5db"/>
                    </svg>
                  ),
                },
                {
                  id: "executive", label: "Executive", sub: "Dark header band",
                  thumb: (
                    <svg viewBox="0 0 80 106" fill="none" className="w-full h-auto">
                      <rect width="80" height="106" rx="2" fill="#fff"/>
                      <rect width="80" height="28" fill="#0f172a"/>
                      <rect x="8" y="6" width="36" height="5" rx="1" fill="#fff"/>
                      <rect x="8" y="14" width="24" height="2" rx="1" fill="#94a3b8"/>
                      <rect x="8" y="18" width="50" height="2" rx="1" fill="#64748b"/>
                      <rect width="80" height="6" y="28" fill="#1e3a5f"/>
                      <rect x="8" y="30" width="12" height="2" rx="1" fill="#7dd3fc"/>
                      <rect x="24" y="30" width="12" height="2" rx="1" fill="#7dd3fc"/>
                      <rect x="40" y="30" width="12" height="2" rx="1" fill="#7dd3fc"/>
                      <rect x="8" y="40" width="20" height="2" rx="1" fill="#1e293b"/>
                      <rect x="8" y="44" width="64" height="1" rx="1" fill="#e2e8f0"/>
                      <rect x="8" y="48" width="58" height="2" rx="1" fill="#9ca3af"/>
                      <rect x="8" y="52" width="52" height="2" rx="1" fill="#9ca3af"/>
                      <rect x="8" y="60" width="20" height="2" rx="1" fill="#1e293b"/>
                      <rect x="8" y="64" width="64" height="1" rx="1" fill="#e2e8f0"/>
                      <rect x="8" y="68" width="58" height="2" rx="1" fill="#9ca3af"/>
                    </svg>
                  ),
                },
                {
                  id: "bold", label: "Bold", sub: "Left color bar",
                  thumb: (
                    <svg viewBox="0 0 80 106" fill="none" className="w-full h-auto">
                      <rect width="80" height="106" rx="2" fill="#fff"/>
                      <rect width="4" height="106" fill="#0891b2"/>
                      <rect x="8" y="8" width="64" height="4" rx="0" fill="none" stroke="#0891b2" strokeWidth=".5"/>
                      <rect x="8" y="8" width="44" height="7" rx="1" fill="#111"/>
                      <rect x="8" y="18" width="30" height="2" rx="1" fill="#0891b2"/>
                      <rect x="8" y="24" width="68" height="3" rx="0" fill="#e2e8f0"/>
                      <rect x="8" y="29" width="18" height="2" rx="1" fill="#0891b2"/>
                      <rect x="8" y="34" width="64" height="1.5" rx="1" fill="#cbd5e1"/>
                      <rect x="8" y="37" width="58" height="1.5" rx="1" fill="#cbd5e1"/>
                      <rect x="8" y="44" width="18" height="2" rx="1" fill="#0891b2"/>
                      <rect x="8" y="49" width="64" height="1.5" rx="1" fill="#cbd5e1"/>
                      <rect x="8" y="52" width="55" height="1.5" rx="1" fill="#cbd5e1"/>
                    </svg>
                  ),
                },
                {
                  id: "compact", label: "Compact", sub: "Green accent sidebar",
                  thumb: (
                    <svg viewBox="0 0 80 106" fill="none" className="w-full h-auto">
                      <rect width="80" height="106" rx="2" fill="#fff"/>
                      <rect width="80" height="18" fill="#16a34a"/>
                      <rect x="6" y="5" width="30" height="4" rx="1" fill="#fff"/>
                      <rect x="6" y="12" width="22" height="2" rx="1" fill="#bbf7d0"/>
                      <rect width="26" height="88" y="18" fill="#f0fdf4"/>
                      <rect x="4" y="22" width="18" height="2" rx="1" fill="#16a34a"/>
                      <rect x="4" y="26" width="16" height="1.5" rx="1" fill="#86efac"/>
                      <rect x="4" y="29" width="18" height="1.5" rx="1" fill="#86efac"/>
                      <rect x="4" y="36" width="18" height="2" rx="1" fill="#16a34a"/>
                      <rect x="4" y="40" width="16" height="1.5" rx="1" fill="#86efac"/>
                      <rect x="30" y="22" width="42" height="2" rx="1" fill="#374151"/>
                      <rect x="30" y="26" width="42" height="1.5" rx="1" fill="#9ca3af"/>
                      <rect x="30" y="30" width="36" height="1.5" rx="1" fill="#9ca3af"/>
                      <rect x="30" y="36" width="42" height="2" rx="1" fill="#374151"/>
                      <rect x="30" y="40" width="38" height="1.5" rx="1" fill="#9ca3af"/>
                    </svg>
                  ),
                },
                {
                  id: "academic", label: "Academic", sub: "Serif, formal style",
                  thumb: (
                    <svg viewBox="0 0 80 106" fill="none" className="w-full h-auto">
                      <rect width="80" height="106" rx="2" fill="#fffdf7"/>
                      <rect x="8" y="8" width="64" height="7" rx="1" fill="#1a1a1a"/>
                      <rect x="8" y="17" width="64" height="1" rx="1" fill="#1a1a1a"/>
                      <rect x="8" y="20" width="64" height="1" rx="1" fill="#1a1a1a"/>
                      <rect x="18" y="23" width="44" height="2" rx="1" fill="#555"/>
                      <rect x="8" y="30" width="22" height="2" rx="1" fill="#1a1a1a"/>
                      <rect x="8" y="34" width="64" height="1" rx="1" fill="#ccc"/>
                      <rect x="8" y="37" width="60" height="1.5" rx="1" fill="#666"/>
                      <rect x="8" y="41" width="56" height="1.5" rx="1" fill="#666"/>
                      <rect x="8" y="48" width="22" height="2" rx="1" fill="#1a1a1a"/>
                      <rect x="8" y="52" width="64" height="1" rx="1" fill="#ccc"/>
                      <rect x="8" y="55" width="60" height="1.5" rx="1" fill="#666"/>
                      <rect x="8" y="60" width="22" height="2" rx="1" fill="#1a1a1a"/>
                      <rect x="8" y="64" width="64" height="1" rx="1" fill="#ccc"/>
                      <rect x="8" y="67" width="56" height="1.5" rx="1" fill="#666"/>
                    </svg>
                  ),
                },
                {
                  id: "elegant", label: "Elegant", sub: "Centered, luxe feel",
                  thumb: (
                    <svg viewBox="0 0 80 106" fill="none" className="w-full h-auto">
                      <rect width="80" height="106" rx="2" fill="#fafaf9"/>
                      <rect x="16" y="8" width="48" height="6" rx="1" fill="#292524"/>
                      <rect x="26" y="16" width="28" height="1.5" rx="1" fill="#a8a29e"/>
                      <rect x="20" y="20" width="40" height="0.75" rx="1" fill="#d6d3d1"/>
                      <rect x="32" y="23" width="16" height="1.5" rx="1" fill="#d6d3d1"/>
                      <rect x="20" y="27" width="40" height="0.75" rx="1" fill="#d6d3d1"/>
                      <rect x="24" y="32" width="32" height="2" rx="1" fill="#292524"/>
                      <rect x="8" y="36" width="64" height="0.75" rx="1" fill="#d6d3d1"/>
                      <rect x="8" y="39" width="64" height="1.5" rx="1" fill="#a8a29e"/>
                      <rect x="8" y="43" width="60" height="1.5" rx="1" fill="#a8a29e"/>
                      <rect x="24" y="50" width="32" height="2" rx="1" fill="#292524"/>
                      <rect x="8" y="54" width="64" height="0.75" rx="1" fill="#d6d3d1"/>
                      <rect x="8" y="57" width="64" height="1.5" rx="1" fill="#a8a29e"/>
                      <rect x="24" y="64" width="32" height="2" rx="1" fill="#292524"/>
                      <rect x="8" y="68" width="64" height="0.75" rx="1" fill="#d6d3d1"/>
                      <rect x="8" y="71" width="56" height="1.5" rx="1" fill="#a8a29e"/>
                    </svg>
                  ),
                },
                {
                  id: "timeline", label: "Timeline", sub: "Milestone timeline",
                  thumb: (
                    <svg viewBox="0 0 80 106" fill="none" className="w-full h-auto">
                      <rect width="80" height="106" rx="2" fill="#fff"/>
                      <rect x="8" y="8" width="48" height="6" rx="1" fill="#0f172a"/>
                      <rect x="8" y="16" width="36" height="2" rx="1" fill="#64748b"/>
                      <rect x="8" y="22" width="64" height="1" rx="1" fill="#e2e8f0"/>
                      <rect x="20" y="27" width="1.5" height="72" fill="#e2e8f0"/>
                      <circle cx="20.75" cy="32" r="4" fill="#3b82f6"/>
                      <rect x="28" y="29" width="38" height="2" rx="1" fill="#1e293b"/>
                      <rect x="28" y="33" width="28" height="1.5" rx="1" fill="#94a3b8"/>
                      <rect x="28" y="37" width="34" height="1.5" rx="1" fill="#cbd5e1"/>
                      <circle cx="20.75" cy="50" r="4" fill="#3b82f6"/>
                      <rect x="28" y="47" width="38" height="2" rx="1" fill="#1e293b"/>
                      <rect x="28" y="51" width="30" height="1.5" rx="1" fill="#94a3b8"/>
                      <rect x="28" y="55" width="36" height="1.5" rx="1" fill="#cbd5e1"/>
                      <circle cx="20.75" cy="68" r="4" fill="#3b82f6"/>
                      <rect x="28" y="65" width="38" height="2" rx="1" fill="#1e293b"/>
                      <rect x="28" y="69" width="26" height="1.5" rx="1" fill="#94a3b8"/>
                      <rect x="28" y="73" width="32" height="1.5" rx="1" fill="#cbd5e1"/>
                    </svg>
                  ),
                },
                {
                  id: "infographic", label: "Infographic", sub: "Skill bars & icons",
                  thumb: (
                    <svg viewBox="0 0 80 106" fill="none" className="w-full h-auto">
                      <rect width="80" height="106" rx="2" fill="#fff"/>
                      <rect width="28" height="106" fill="#0f172a"/>
                      <circle cx="14" cy="18" r="9" fill="#334155"/>
                      <rect x="4" y="32" width="20" height="2" rx="1" fill="#f8fafc"/>
                      <rect x="4" y="38" width="20" height="3" rx="1.5" fill="#334155"/>
                      <rect x="4" y="38" width="15" height="3" rx="1.5" fill="#3b82f6"/>
                      <rect x="4" y="44" width="20" height="3" rx="1.5" fill="#334155"/>
                      <rect x="4" y="44" width="18" height="3" rx="1.5" fill="#3b82f6"/>
                      <rect x="4" y="50" width="20" height="3" rx="1.5" fill="#334155"/>
                      <rect x="4" y="50" width="12" height="3" rx="1.5" fill="#3b82f6"/>
                      <rect x="4" y="58" width="20" height="2" rx="1" fill="#f8fafc"/>
                      <rect x="4" y="63" width="16" height="1.5" rx="1" fill="#94a3b8"/>
                      <rect x="4" y="67" width="18" height="1.5" rx="1" fill="#94a3b8"/>
                      <rect x="32" y="8" width="40" height="6" rx="1" fill="#0f172a"/>
                      <rect x="32" y="16" width="32" height="2" rx="1" fill="#64748b"/>
                      <rect x="32" y="22" width="40" height="2" rx="1" fill="#94a3b8"/>
                      <rect x="32" y="30" width="22" height="2" rx="1" fill="#3b82f6"/>
                      <rect x="32" y="34" width="40" height="1" rx="1" fill="#e2e8f0"/>
                      <rect x="32" y="37" width="38" height="1.5" rx="1" fill="#cbd5e1"/>
                      <rect x="32" y="41" width="34" height="1.5" rx="1" fill="#cbd5e1"/>
                      <rect x="32" y="48" width="22" height="2" rx="1" fill="#3b82f6"/>
                      <rect x="32" y="52" width="40" height="1" rx="1" fill="#e2e8f0"/>
                      <rect x="32" y="55" width="38" height="1.5" rx="1" fill="#cbd5e1"/>
                    </svg>
                  ),
                },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set({ templateId: t.id })}
                  className={`group relative rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                    (data.templateId || "modern") === t.id
                      ? "border-blue-600 shadow-md shadow-blue-100"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {/* Mini resume thumbnail */}
                  <div className="w-full bg-gray-50 p-2">
                    {t.thumb}
                  </div>
                  {/* Label bar */}
                  <div className={`px-2 py-1.5 text-left border-t ${
                    (data.templateId || "modern") === t.id
                      ? "bg-blue-50 border-blue-100"
                      : "bg-white border-gray-100"
                  }`}>
                    <div className={`text-[11px] font-bold leading-tight ${
                      (data.templateId || "modern") === t.id ? "text-blue-700" : "text-gray-800"
                    }`}>{t.label}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{t.sub}</div>
                  </div>
                  {/* Checkmark overlay */}
                  {(data.templateId || "modern") === t.id && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                      </svg>
                    </div>
                  )}
                </button>
              )))}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: LAYOUT & SPACING
      ══════════════════════════════════════════ */}
      {tab === "layout" && (
        <div>
          <SectionTitle>Layout & Spacing</SectionTitle>

          {/* Columns */}
          <Card>
            <div className="text-xl font-extrabold text-gray-900 mb-5">Layout</div>
            <ControlLabel>Columns</ControlLabel>
            <div className="grid grid-cols-3 gap-3 mb-7">
              {([["one","One"], ["two","Two"], ["mix","Mix"]] as const).map(([val,label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set({ columns: val })}
                  className={`flex flex-col items-center justify-center rounded-xl border py-3 text-sm font-medium transition-all ${
                    (data.columns ?? "one") === val
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {val === "one" && (
                    <svg viewBox="0 0 47 24" className="w-10 mb-1.5" fill="none">
                      <rect width="44.971" height="4.878" x="1.011" y="0.523" fill="currentColor" stroke="currentColor" rx="1.5" />
                      <rect width="44.971" height="4.878" x="1.011" y="9.339" fill="currentColor" stroke="currentColor" rx="1.5" />
                      <rect width="44.971" height="4.878" x="1.011" y="18.155" fill="currentColor" stroke="currentColor" rx="1.5" />
                    </svg>
                  )}
                  {val === "two" && (
                    <svg viewBox="0 0 47 24" className="w-10 mb-1.5" fill="none">
                      <rect width="20.671" height="4.878" x="0.853" y="0.841" fill="currentColor" stroke="currentColor" rx="1.5" />
                      <rect width="20.671" height="4.878" x="0.853" y="9.339" fill="currentColor" stroke="currentColor" rx="1.5" />
                      <rect width="20.671" height="4.878" x="0.853" y="17.838" fill="currentColor" stroke="currentColor" rx="1.5" />
                      <rect width="20.671" height="4.878" x="25.476" y="0.84" fill="currentColor" stroke="currentColor" rx="1.5" />
                      <rect width="20.671" height="4.878" x="25.476" y="9.339" fill="currentColor" stroke="currentColor" rx="1.5" />
                      <rect width="20.671" height="4.878" x="25.476" y="17.838" fill="currentColor" stroke="currentColor" rx="1.5" />
                    </svg>
                  )}
                  {val === "mix" && (
                    <svg viewBox="0 0 47 23" className="w-10 mb-1.5" fill="none">
                      <rect width="20.701" height="4.878" x="0.818" y="0.953" fill="currentColor" stroke="currentColor" rx="1.5" />
                      <rect width="20.701" height="4.878" x="25.479" y="0.953" fill="currentColor" stroke="currentColor" rx="1.5" />
                      <rect width="45.361" height="4.878" x="0.818" y="8.896" fill="currentColor" stroke="currentColor" rx="1.5" />
                      <rect width="30.565" height="4.878" x="0.818" y="16.838" fill="currentColor" stroke="currentColor" rx="1.5" />
                      <rect width="10.837" height="4.878" x="35.345" y="16.838" fill="currentColor" stroke="currentColor" rx="1.5" />
                    </svg>
                  )}
                  {label}
                </button>
              ))}
            </div>

            {/* Entry layout */}
            <ControlLabel>Entry Layout</ControlLabel>
            <div className="flex flex-col gap-2 mb-5">
              {([
                ["dateLocationRight","Date & location on right"],
                ["dateLocationLeft", "Date & location on left"],
                ["fullWidth",        "Full width (no aside)"],
              ] as const).map(([val, label]) => (
                <label key={val} className="cursor-pointer hover:opacity-80">
                  <div
                    onClick={() => set({ entryLayout: val })}
                    className={`flex h-[43px] w-[220px] items-center justify-between rounded-xl p-2 border transition-all ${
                      (data.entryLayout ?? "dateLocationRight") === val
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Subtitle style */}
            <ControlLabel>Subtitle style</ControlLabel>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {(["normal","bold","italic"] as const).map(s => (
                <RadioPill key={s} active={(data.subtitleStyle ?? "normal") === s} onClick={() => set({ subtitleStyle: s })}>
                  <span className={s === "bold" ? "font-bold" : s === "italic" ? "italic" : ""}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </RadioPill>
              ))}
            </div>

            {/* List style */}
            <ControlLabel>List style</ControlLabel>
            <div className="grid grid-cols-2 gap-2">
              {([["bullet","• Bullet"],["hyphen","– Hyphen"]] as const).map(([val, label]) => (
                <RadioPill key={val} active={(data.listStyle ?? "bullet") === val} onClick={() => set({ listStyle: val })}>
                  {label}
                </RadioPill>
              ))}
            </div>
          </Card>

          {/* Spacing */}
          <Card>
            <div className="text-xl font-extrabold text-gray-900 mb-5">Spacing</div>

            <ControlLabel>Font Size</ControlLabel>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500">{FONT_SIZE_LABELS[fs]}pt</span>
            </div>
            <StepSlider value={fs} max={8} labels={FONT_SIZE_LABELS} onChange={v => set({ fontSize: v })} />

            <div className="mt-5">
              <ControlLabel>Line Height</ControlLabel>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">{LINE_HEIGHT_LABELS[lh]}</span>
              </div>
              <StepSlider value={lh} max={8} labels={LINE_HEIGHT_LABELS} onChange={v => set({ lineHeight: v })} />
            </div>

            <div className="mt-5">
              <ControlLabel>Left & Right Margin</ControlLabel>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">{MARGIN_H_LABELS[mh]}</span>
              </div>
              <StepSlider value={mh} max={8} labels={MARGIN_H_LABELS} onChange={v => set({ marginH: v })} />
            </div>

            <div className="mt-5">
              <ControlLabel>Top & Bottom Margin</ControlLabel>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">{MARGIN_V_LABELS[mv]}</span>
              </div>
              <StepSlider value={mv} max={8} labels={MARGIN_V_LABELS} onChange={v => set({ marginV: v })} />
            </div>

            <div className="mt-5">
              <ControlLabel>Space between Entries</ControlLabel>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">{ENTRY_SPACING_LABELS[es]}</span>
              </div>
              <StepSlider value={es} max={8} labels={ENTRY_SPACING_LABELS} onChange={v => set({ entrySpacing: v })} />
            </div>

            {/* Sidebar width — only for sidebar templates */}
            {["modern", "compact"].includes(data.templateId ?? "modern") && (
              <div className="mt-5">
                <ControlLabel>Sidebar Width</ControlLabel>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-600 w-12">{data.sidebarWidth ?? 33}%</span>
                  <input
                    type="range" min={20} max={45} step={1}
                    value={data.sidebarWidth ?? 33}
                    onChange={e => set({ sidebarWidth: Number(e.target.value) })}
                    className="flex-1 h-1.5 appearance-none rounded-full bg-gray-200 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: DESIGN
      ══════════════════════════════════════════ */}
      {tab === "design" && (
        <div>
          <SectionTitle>Design</SectionTitle>

          {/* Font */}
          <Card>
            <div className="text-xl font-extrabold text-gray-900 mb-5">Font</div>

            {/* Category */}
            <div className="flex gap-3 mb-5">
              {(["sans","serif","mono"] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    const first = cat === "serif" ? SERIF_FONTS[0].value : cat === "mono" ? MONO_FONTS[0].value : SANS_FONTS[0].value;
                    set({ fontFamily: first });
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
                    fontCat === cat
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                  }`}
                >
                  <span className="text-lg font-bold mb-0.5">{cat === "sans" ? "Aa" : cat === "serif" ? <em>Aa</em> : <code>Aa</code>}</span>
                  <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                </button>
              ))}
            </div>

            {/* Typeface grid */}
            <div className="grid grid-cols-2 gap-2">
              {fontList.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => set({ fontFamily: f.value })}
                  style={{ fontFamily: f.value }}
                  className={`flex h-10 items-center justify-center rounded-xl border text-sm truncate transition-all ${
                    ff === f.value
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Colors */}
          <Card>
            <div className="text-xl font-extrabold text-gray-900 mb-5">Colors</div>
            <ControlLabel>Accent Color</ControlLabel>
            <div className="flex flex-wrap gap-2 mb-6">
              {ACCENT_COLORS.map((c, i) => (
                c === null ? (
                  <button
                    key="none"
                    type="button"
                    onClick={() => set({ accentColor: "#1d4ed8" })}
                    className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center">
                      <div className="h-px w-10 bg-gray-400 rotate-[135deg]" />
                    </div>
                  </button>
                ) : (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set({ accentColor: c })}
                    className={`w-10 h-10 rounded-full transition-all ${
                      accent === c ? "ring-2 ring-offset-2 ring-gray-600 scale-110" : "hover:scale-105"
                    }`}
                    style={{ background: c }}
                  />
                )
              ))}
              {/* Custom color picker */}
              <label
                title="Custom color"
                className={`w-10 h-10 rounded-full cursor-pointer overflow-hidden relative transition-all ${
                  !ACCENT_COLORS.slice(1).includes(accent) ? "ring-2 ring-offset-2 ring-gray-600 scale-110" : "hover:scale-105"
                }`}
                style={{ background: "conic-gradient(from 90deg, violet, indigo, blue, green, yellow, orange, red, violet)" }}
              >
                <input
                  type="color"
                  value={accent}
                  onChange={e => set({ accentColor: e.target.value })}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>
            </div>

            {/* Apply accent to */}
            <ControlLabel>Apply accent color to</ControlLabel>
            <div className="grid grid-cols-2 gap-y-3">
              <Checkbox checked={data.accentName ?? true}        onChange={v => set({ accentName: v })}        label="Name" />
              <Checkbox checked={data.accentJobTitle ?? true}    onChange={v => set({ accentJobTitle: v })}    label="Job title" />
              <Checkbox checked={data.accentHeadings ?? true}    onChange={v => set({ accentHeadings: v })}    label="Headings" />
              <Checkbox checked={data.accentHeadingLine ?? true} onChange={v => set({ accentHeadingLine: v })} label="Heading line" />
            </div>
          </Card>

          {/* Section Headings */}
          <Card>
            <div className="text-xl font-extrabold text-gray-900 mb-5">Section Headings</div>

            <ControlLabel>Style</ControlLabel>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {HEADING_STYLES.map(h => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => set({ headingStyle: h.id })}
                  className={`h-12 flex items-center justify-center rounded-xl border p-1 transition-all ${
                    hs === h.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {h.svg}
                </button>
              ))}
            </div>

            <ControlLabel>Capitalization</ControlLabel>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {([["none","None"],["capitalize","Capitalize"],["uppercase","Uppercase"]] as const).map(([val, label]) => (
                <RadioPill key={val} active={hcap === val} onClick={() => set({ headingCaps: val })}>
                  {label}
                </RadioPill>
              ))}
            </div>

            <ControlLabel>Size</ControlLabel>
            <div className="grid grid-cols-5 gap-2" style={{ gridTemplateColumns: "repeat(4, 44px)" }}>
              {(["s","m","l","xl"] as const).map(s => (
                <RadioPill key={s} active={hsize === s} onClick={() => set({ headingSize: s })}>
                  {s.toUpperCase()}
                </RadioPill>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: HEADER
      ══════════════════════════════════════════ */}
      {tab === "header" && (
        <div>
          <SectionTitle>Header</SectionTitle>

          <Card>
            <div className="text-xl font-extrabold text-gray-900 mb-5">Personal Details</div>

            <ControlLabel>Align</ControlLabel>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {([
                ["left",   <svg key="l" viewBox="0 0 92 26" fill="none" className="w-14"><path fill="currentColor" d="M92 13c0 7.18-5.82 13-13 13s-13-5.82-13-13S71.82 0 79 0s13 5.82 13 13zM56 2H2a2 2 0 00-2 2v5a2 2 0 002 2h54a2 2 0 002-2V4a2 2 0 00-2-2zm0 13H2a2 2 0 00-2 2v5a2 2 0 002 2h54a2 2 0 002-2v-5a2 2 0 00-2-2z"/></svg>],
                ["center", <svg key="c" viewBox="0 0 92 56" fill="none" className="w-10"><path fill="currentColor" d="M88.828 34H3.172C1.42 34 0 34.895 0 36v5c0 1.105 1.42 2 3.172 2h85.656C90.58 43 92 42.105 92 41v-5c0-1.105-1.42-2-3.172-2zm0 13H3.172C1.42 47 0 47.895 0 49v5c0 1.105 1.42 2 3.172 2h85.656C90.58 56 92 55.105 92 54v-5c0-1.105-1.42-2-3.172-2zM60 13c0 7.18-5.82 13-13 13s-13-5.82-13-13S39.82 0 47 0s13 5.82 13 13z"/></svg>],
                ["right",  <svg key="r" viewBox="0 0 92 26" fill="none" className="w-14"><path fill="currentColor" d="M26 13c0 7.18-5.82 13-13 13S0 20.18 0 13 5.82 0 13 0s13 5.82 13 13zM90 2H36a2 2 0 00-2 2v5a2 2 0 002 2h54a2 2 0 002-2V4a2 2 0 00-2-2zm0 13H36a2 2 0 00-2 2v5a2 2 0 002 2h54a2 2 0 002-2v-5a2 2 0 00-2-2z"/></svg>],
              ] as [string, React.ReactNode][]).map(([val, icon]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set({ headerAlign: val })}
                  className={`flex flex-col items-center justify-center rounded-xl border py-3 gap-1 text-sm font-medium transition-all ${
                    (data.headerAlign ?? "left") === val
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {icon}
                  <span className="capitalize">{val}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="text-xl font-extrabold text-gray-900 mb-5">Name</div>

            <ControlLabel>Size</ControlLabel>
            <div className="flex gap-2 mb-5">
              {(["xs","s","m","l","xl"] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set({ nameSize: s })}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-medium uppercase transition-all ${
                    (data.nameSize ?? "s") === s
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: SECTIONS
      ══════════════════════════════════════════ */}
      {tab === "sections" && (
        <div>
          <SectionTitle>Sections</SectionTitle>

          {/* Skills */}
          <Card>
            <div className="text-xl font-extrabold text-gray-900 mb-5">Skills</div>

            <ControlLabel>Display</ControlLabel>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {([["grid","Grid"],["level","Level"],["text","Compact"],["bubble","Bubble"]] as const).map(([val, label]) => (
                <RadioPill key={val} active={(data.skillDisplay ?? "grid") === val} onClick={() => set({ skillDisplay: val })}>
                  {label}
                </RadioPill>
              ))}
            </div>

            <ControlLabel>Columns</ControlLabel>
            <div className="grid grid-cols-4 gap-2">
              {([
                ["one",   <svg key="1" fill="none" width="24" height="16"><rect width="24" height="16" rx="1" fill="currentColor" /></svg>],
                ["two",   <div key="2" className="grid grid-cols-2 gap-[2px]"><svg fill="none" width="11" height="16"><rect width="11" height="16" rx="1" fill="currentColor" /></svg><svg fill="none" width="11" height="16"><rect width="11" height="16" rx="1" fill="currentColor" /></svg></div>],
                ["three", <div key="3" className="grid grid-cols-3 gap-[2px]">{[0,1,2].map(i=><svg key={i} fill="none" width="7" height="16"><rect width="7" height="16" rx="1" fill="currentColor" /></svg>)}</div>],
                ["four",  <div key="4" className="grid grid-cols-4 gap-[2px]">{[0,1,2,3].map(i=><svg key={i} fill="none" width="5" height="16"><rect width="5" height="16" rx="1" fill="currentColor" /></svg>)}</div>],
              ] as [string, React.ReactNode][]).map(([val, icon]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set({ skillColumns: val })}
                  className={`flex h-10 items-center justify-center rounded-xl border transition-all ${
                    (data.skillColumns ?? "one") === val
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
