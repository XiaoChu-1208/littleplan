import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Scissors, MousePointer2, Plus, Trash2, Palette, PaintBucket, X, Maximize, SunDim, Calendar, ListTodo, Circle, CheckCircle2, Settings2, Keyboard, Download, Upload, RotateCcw, Info, Type, Eye, SlidersHorizontal, Sun, Moon, Flag } from "lucide-react";
import { CustomPin, CustomPinOff } from "./components/CustomPin";
import appIcon from "../assets/icons/icon.png";

const baseYear = 2026;
const DEFAULT_BAR_COLOR = "rgba(0,0,0,0.4)";
const ROW_HEIGHT_NARROW = 32;
const ROW_HEIGHT_WIDE = 80;
const ROW_HEIGHT_COMPACT = 16;
const HEADER_HEIGHT = 52;
const ADD_ROW_HEIGHT = 32;
const GANTT_PADDING = 48;
const HUD_HEIGHT = 44;
const CONTAINER_TOP = 8;
const DEFAULT_SHORTCUT_CONFIG = { togglePin: "CmdOrCtrl+Shift+T" };
const DEFAULT_SETTINGS = {
  uiScale: 100,
  panelSurfaceOpacity: 100,
  ganttTitleFontSize: 11,
  timelineFontSize: 10,
  segmentLabelFontSize: 10,
  todoItemFontSize: 10,
  showAnnualFieldNames: true,
  showAnnualStatusText: true,
  showMonthlyFieldNames: true,
  showMonthlyStatusText: true,
  showRemarks: true,
  hudLabelMode: 'icon',
  hudDensity: 'compact',
  animationLevel: 'full',
  rememberWindowSize: true,
  rememberWindowPosition: true,
  startupViewPreset: 'remember',
  shortcutConfig: DEFAULT_SHORTCUT_CONFIG,
};

const FONT_LIMITS = {
  ganttTitleFontSize: { min: 9, max: 15, step: 1, label: '甘特标题' },
  timelineFontSize: { min: 8, max: 14, step: 1, label: '时间轴' },
  segmentLabelFontSize: { min: 8, max: 14, step: 1, label: '阶段名' },
  todoItemFontSize: { min: 8, max: 14, step: 1, label: 'ToDo' },
};

const initialRows = [
  { id: 1, title: "年度战略规划与执行", segments: [{ id: "1-1", name: "阶段一", start: 0.0, end: 12.0, color: DEFAULT_BAR_COLOR, isAcknowledged: false }] },
  { id: 2, title: "核心产品V2.0研发", segments: [{ id: "2-1", name: "研发期", start: 1.0, end: 6.5, color: DEFAULT_BAR_COLOR, isAcknowledged: false }] },
  { id: 3, title: "海外市场渠道拓展", segments: [{ id: "3-1", name: "出海", start: 5.5, end: 12.0, color: DEFAULT_BAR_COLOR, isAcknowledged: false }] },
  { id: 4, title: "团队扩充与培训建设", segments: [{ id: "4-1", name: "招聘", start: -2.0, end: 1.5, color: DEFAULT_BAR_COLOR, isAcknowledged: false }] },
  { id: 5, title: "年终总结与财报准备", segments: [{ id: "5-1", name: "筹备", start: 10.0, end: 12.0, color: DEFAULT_BAR_COLOR, isAcknowledged: false }] },
];

const presetColors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#a855f7", "#d946ef", "#f43f5e", "#64748b", "#334155"];

const PAINT_BUCKET_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z' stroke='%23000' stroke-width='3.5'/%3E%3Cpath d='m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z' stroke='%23fff' stroke-width='2'/%3E%3Cpath d='m5 2 5 5' stroke='%23000' stroke-width='3.5'/%3E%3Cpath d='m5 2 5 5' stroke='%23fff' stroke-width='2'/%3E%3Cpath d='M2 13h15' stroke='%23000' stroke-width='3.5'/%3E%3Cpath d='M2 13h15' stroke='%23fff' stroke-width='2'/%3E%3Cpath d='M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z' stroke='%23000' stroke-width='3.5'/%3E%3Cpath d='M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 3 19, crosshair`;

const GLOBAL_THEMES = [
  { id: 'amber', name: '黄', color: '#eab308', todayColor: '#fef08a', tint: 'rgba(234, 179, 8, 0.08)', highlight: 'bg-yellow-500/40 text-yellow-300', lightHighlight: 'bg-yellow-500/20 text-yellow-800 font-semibold', todayLine: 'bg-yellow-200/80', todayBg: 'bg-yellow-200/10', todayArrow: 'border-t-yellow-200' },
  { id: 'blue', name: '蓝', color: '#3b82f6', todayColor: '#bfdbfe', tint: 'rgba(59, 130, 246, 0.08)', highlight: 'bg-blue-500/40 text-blue-300', lightHighlight: 'bg-blue-500/20 text-blue-800 font-semibold', todayLine: 'bg-blue-200/80', todayBg: 'bg-blue-200/10', todayArrow: 'border-t-blue-200' },
  { id: 'rose', name: '粉', color: '#f43f5e', todayColor: '#fecdd3', tint: 'rgba(244, 63, 94, 0.08)', highlight: 'bg-rose-500/40 text-rose-300', lightHighlight: 'bg-rose-500/20 text-rose-800 font-semibold', todayLine: 'bg-rose-200/80', todayBg: 'bg-rose-200/10', todayArrow: 'border-t-rose-200' },
  { id: 'emerald', name: '绿', color: '#10b981', todayColor: '#a7f3d0', tint: 'rgba(16, 185, 129, 0.08)', highlight: 'bg-emerald-500/40 text-emerald-300', lightHighlight: 'bg-emerald-500/20 text-emerald-800 font-semibold', todayLine: 'bg-emerald-200/80', todayBg: 'bg-emerald-200/10', todayArrow: 'border-t-emerald-200' },
  { id: 'fuchsia', name: '紫', color: '#d946ef', todayColor: '#f5d0fe', tint: 'rgba(217, 70, 239, 0.08)', highlight: 'bg-fuchsia-500/40 text-fuchsia-300', lightHighlight: 'bg-fuchsia-500/20 text-fuchsia-800 font-semibold', todayLine: 'bg-fuchsia-200/80', todayBg: 'bg-fuchsia-200/10', todayArrow: 'border-t-fuchsia-200' },
  { id: 'sky', name: '天蓝', color: '#0ea5e9', todayColor: '#bae6fd', tint: 'rgba(14, 165, 233, 0.08)', highlight: 'bg-sky-500/40 text-sky-300', lightHighlight: 'bg-sky-500/20 text-sky-800 font-semibold', todayLine: 'bg-sky-200/80', todayBg: 'bg-sky-200/10', todayArrow: 'border-t-sky-200' },
];

const hexToRgba = (hex, alpha) => {
  if (hex.startsWith('#') && hex.length === 7) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
};

// 从主题色派生浅色背景：intensity 控制主题色混入比例（0.07 = 7% 主题色 + 93% 白）
const hexToLightBg = (hex, intensity, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r * intensity + 255 * (1 - intensity));
  const lg = Math.round(g * intensity + 255 * (1 - intensity));
  const lb = Math.round(b * intensity + 255 * (1 - intensity));
  return `rgba(${lr},${lg},${lb},${alpha})`;
};

const hexToDarkBg = (hex, intensity, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${Math.round(r * intensity)},${Math.round(g * intensity)},${Math.round(b * intensity)},${alpha})`;
};

const getVisualLength = (str) => {
  let len = 0;
  for (let i = 0; i < (str?.length || 0); i++) {
    len += str.charCodeAt(i) > 255 ? 2 : 1.1;
  }
  return len;
};

const getProgressText = (p) => {
  if (p === 0) return "尚未开始";
  if (p <= 10) return "起步阶段";
  if (p <= 20) return "开始动工了";
  if (p <= 30) return "渐入状态";
  if (p <= 40) return "稳步推进";
  if (p <= 50) return "即将过半";
  if (p <= 60) return "行程过半";
  if (p <= 70) return "势如破竹";
  if (p <= 80) return "胜利在望";
  if (p <= 90) return "快完成了";
  if (p < 100) return "马上就要完成了";
  return "完美收官";
};


const getHoverTextValue = ({ showFieldNames, showStatusText, hoverShowsStatus, name, status }) => {
  if (showFieldNames && showStatusText) {
    return hoverShowsStatus ? status : name;
  }
  if (showFieldNames) return name;
  if (showStatusText) return status;
  return '';
};

const globalStyles = `
@keyframes nintendo-burst-right {
  0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 1; filter: brightness(1.5); }
  20% { transform: translate(calc(var(--tx) * 0.4), calc(var(--ty) * 0.4)) scale(var(--s)) rotate(calc(var(--r) * 0.4)); opacity: 1; filter: brightness(1.2); }
  80% { opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(calc(var(--s) * 0.3)) rotate(var(--r)); opacity: 0; }
}
@keyframes pop-in {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes longpress-ring-fill {
  from { stroke-dasharray: 0, 100; }
  to { stroke-dasharray: 100, 0; }
}
[data-color-mode="light"] [data-popup-panel] {
  color: #374151;
}
[data-color-mode="light"] [data-popup-panel] input[type="range"] {
  accent-color: var(--theme-color, #f59e0b);
}
`;



const LongPressAck = ({ onConfirm, holdDuration = 2000, themeColor = '#f59e0b', size = 18, isLight = false }) => {
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const holdTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const startXRef = useRef(0);
  const globalListenersRef = useRef({ move: null, up: null });

  const cleanupGlobal = () => {
    if (globalListenersRef.current.move) {
      window.removeEventListener('pointermove', globalListenersRef.current.move);
      window.removeEventListener('pointerup', globalListenersRef.current.up);
      globalListenersRef.current = { move: null, up: null };
    }
  };

  const cleanupTimers = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  useEffect(() => () => { cleanupTimers(); cleanupGlobal(); }, []);

  const cancelHolding = () => {
    cleanupTimers();
    cleanupGlobal();
    setProgress(0);
    setState('idle');
  };

  const startHolding = (e) => {
    // No stopPropagation: let the parent bar drag handler also receive the event
    if (state !== 'idle') return;
    startXRef.current = e.clientX;
    setState('holding');
    setProgress(0);
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - startTime) / holdDuration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(progressIntervalRef.current);
    }, 20);

    holdTimerRef.current = setTimeout(() => {
      cleanupTimers();
      cleanupGlobal();
      setState('confirmed');
      setProgress(100);
      onConfirm?.();
    }, holdDuration);

    const onGlobalMove = (moveEvent) => {
      const dx = moveEvent.clientX - startXRef.current;
      if (dx > 8) {
        // User dragged right → cancel acknowledgment
        cleanupTimers();
        cleanupGlobal();
        setProgress(0);
        setState('idle');
      }
    };
    const onGlobalUp = () => {
      // Released without completing the hold → cancel
      cleanupTimers();
      cleanupGlobal();
      setProgress(0);
      setState(s => s === 'confirmed' ? 'confirmed' : 'idle');
    };

    globalListenersRef.current = { move: onGlobalMove, up: onGlobalUp };
    window.addEventListener('pointermove', onGlobalMove);
    window.addEventListener('pointerup', onGlobalUp);
  };

  const r = 7;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;

  const checkColor = isLight ? '#059669' : '#10b981';
  const ringTrackStroke = isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.35)';
  const ringFill = isLight ? 'none' : 'rgba(0,0,0,0.35)';
  const ringProgressStroke = isLight ? 'rgba(0,0,0,0.65)' : 'white';
  const ringDropShadow = isLight ? 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' : 'drop-shadow(0 0 3px rgba(0,0,0,0.5))';

  if (state === 'confirmed') {
    return (
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none z-50 flex items-center justify-center"
        style={{ width: size, height: size }}>
        <div style={{ animation: 'pop-in 0.35s cubic-bezier(0.175,0.885,0.32,1.275) forwards', color: checkColor }}>
          <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-40"
      onPointerDown={startHolding}
    >
      {state === 'holding' && (
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox="0 0 18 18" style={{ transform: 'rotate(-90deg)', filter: ringDropShadow }}>
            <circle cx="9" cy="9" r={r} fill={ringFill} stroke={ringTrackStroke} strokeWidth="2.5" />
            <circle
              cx="9" cy="9" r={r}
              fill="none"
              stroke={ringProgressStroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ - dash}`}
              style={{ transition: 'stroke-dasharray 0.02s linear' }}
            />
          </svg>
        </div>
      )}
    </div>
  );
};

const CustomSortIcon = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M4 6h16" />
    <path d="M5 12h10" />
    <path d="M6 18h4" />
    <path d="M16 10v10" />
    <path d="M19 17l-3 3-3-3" />
  </svg>
);

const DensityIcon = ({ mode, className, animationLevel = 'full' }) => {
  const variants = {
    narrow: { outerScaleY: 0.62, innerScaleY: 0.68, label: '窄' },
    normal: { outerScaleY: 0.9, innerScaleY: 0.9, label: '中' },
    wide: { outerScaleY: 1.22, innerScaleY: 1.15, label: '宽' },
  };
  const current = variants[mode] || variants.normal;
  const transition = animationLevel === 'off'
    ? { duration: 0 }
    : animationLevel === 'reduced'
      ? { duration: 0.12, ease: 'easeOut' }
      : { type: 'spring', stiffness: 360, damping: 24 };

  return (
    <div className={`relative flex items-center justify-center ${className || ''}`}>
      <motion.div
        animate={{ scaleY: current.outerScaleY }}
        transition={transition}
        className="absolute inset-[2px] rounded-[5px] border border-current opacity-70 origin-center"
      />
      <motion.div
        animate={{ scaleY: current.innerScaleY }}
        transition={transition}
        className="absolute inset-x-[6px] inset-y-[5px] rounded-[3px] border border-current opacity-90 origin-center"
      />
      <span className="absolute bottom-[-8px] text-[7px] font-black tracking-[0.18em]">{current.label}</span>
    </div>
  );
};

const ToggleRow = ({ label, desc, checked, onChange, isLight = false }) => (
  <label className="flex items-start justify-between gap-2 py-1">
    <div className="min-w-0">
      <div className={`text-[10px] font-semibold leading-tight ${isLight ? 'text-gray-700' : 'text-white/84'}`}>{label}</div>
      {desc && <div className={`mt-0.5 text-[9px] leading-tight ${isLight ? 'text-gray-400' : 'text-white/45'}`}>{desc}</div>}
    </div>
    <button
      type="button"
      onClick={onChange}
      className={`relative mt-0.5 h-[18px] w-8 rounded-full border transition-colors ${
        isLight
          ? (checked ? 'border-gray-500 bg-gray-600' : 'border-gray-300 bg-gray-200')
          : (checked ? 'border-white/30 bg-white/20' : 'border-white/10 bg-white/5')
      }`}
    >
      <span className={`absolute top-[2px] h-[12px] w-[12px] rounded-full transition-all ${isLight && !checked ? 'bg-gray-400' : 'bg-white'} ${checked ? 'left-[16px]' : 'left-[2px]'}`} />
    </button>
  </label>
);

const SelectRow = ({ label, value, onChange, options }) => (
  <label className="flex items-center justify-between gap-4 py-2">
    <span className="text-[12px] font-semibold text-white">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-white outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-neutral-900">{opt.label}</option>
      ))}
    </select>
  </label>
);

const SliderPanel = ({ label, value, min, max, step, onChange, markerAt, markerColor, progressColor, secondaryStart, isLight = false }) => {
  const pct = ((value - min) / (max - min)) * 100;
  const markerPct = markerAt == null ? null : ((markerAt - min) / (max - min)) * 100;
  const secondaryPct = secondaryStart == null ? null : ((secondaryStart - min) / (max - min)) * 100;
  const splitPct = markerPct ?? secondaryPct;
  const leftEnd = splitPct == null ? 100 : Math.max(0, Math.min(100, splitPct));
  const beforeFillPct = splitPct == null ? pct : Math.min(pct, leftEnd);
  const afterFillPct = splitPct == null ? 0 : Math.max(0, pct - leftEnd);
  return (
    <div>
      <div className={`mb-1 text-[10px] leading-none ${isLight ? 'text-gray-600' : 'text-white/72'}`}>{label} {value}%</div>
      <div className="relative h-5">
        <div className={`absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 overflow-hidden rounded-full ${isLight ? 'bg-gray-300' : 'bg-white/8'}`}>
          {splitPct == null ? (
            <div className={`absolute inset-0 ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
          ) : (
            <>
              <div className={`absolute inset-y-0 left-0 ${isLight ? 'bg-gray-300' : 'bg-white/16'}`} style={{ width: `${leftEnd}%` }} />
              <div className="absolute inset-y-0 right-0" style={{ left: `${leftEnd}%`, backgroundColor: `${markerColor}44` }} />
            </>
          )}
          <div className="absolute inset-y-0 left-0 rounded-l-full" style={{ width: `${beforeFillPct}%`, background: splitPct == null ? (isLight ? 'rgba(0,0,0,0.25)' : progressColor) : (isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.46)') }} />
          {splitPct != null && afterFillPct > 0 && (
            <div className="absolute inset-y-0 rounded-r-full" style={{ left: `${leftEnd}%`, width: `${afterFillPct}%`, backgroundColor: markerColor }} />
          )}
          {markerPct != null && (
            <div className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-full" style={{ left: `${markerPct}%`, backgroundColor: markerColor }} />
          )}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

const StepperRow = ({ label, value, min, max, step = 1, onChange, isLight = false }) => (
  <div className="flex items-center justify-between gap-2 py-1">
    <span className={`text-[10px] font-semibold leading-tight ${isLight ? 'text-gray-700' : 'text-white/78'}`}>{label}</span>
    <div className={`inline-flex items-center gap-0.5 rounded-lg border px-1 py-[3px] ${isLight ? 'border-gray-300 bg-gray-100' : 'border-white/10 bg-black/20'}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className={`h-4 w-4 rounded-md text-[10px] font-bold ${isLight ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-800' : 'text-white/65 hover:bg-white/8 hover:text-white'}`}
      >
        -
      </button>
      <span className={`min-w-[34px] text-center text-[10px] font-semibold leading-none ${isLight ? 'text-gray-800' : 'text-white'}`}>{value}px</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        className={`h-4 w-4 rounded-md text-[10px] font-bold ${isLight ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-800' : 'text-white/65 hover:bg-white/8 hover:text-white'}`}
      >
        +
      </button>
    </div>
  </div>
);

const SettingsSection = ({ icon: Icon, title, children }) => (
  <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
    <div className="mb-3 flex items-center gap-2 text-white">
      <Icon className="h-4 w-4 text-white/70" />
      <h3 className="text-[12px] font-black tracking-[0.18em] uppercase">{title}</h3>
    </div>
    <div className="space-y-1">{children}</div>
  </section>
);

const App = () => {
  const [rows, setRows] = useState(initialRows);
  const [activeTool, setActiveTool] = useState("pointer");
  const [paintColor, setPaintColor] = useState("#3b82f6");
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [appMeta, setAppMeta] = useState(null);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showPalette, setShowPalette] = useState(false);
  const [isWideMode, setIsWideMode] = useState(false);
  const [isNarrowMode, setIsNarrowMode] = useState(false);
  const [annualDensityOverride, setAnnualDensityOverride] = useState(null);
  const [monthlyDensityOverride, setMonthlyDensityOverride] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [globalOpacity, setGlobalOpacity] = useState(60);
  const [uiScale, setUiScale] = useState(100);
  const [panelSurfaceOpacity, setPanelSurfaceOpacity] = useState(DEFAULT_SETTINGS.panelSurfaceOpacity);
  const [ganttTitleFontSize, setGanttTitleFontSize] = useState(DEFAULT_SETTINGS.ganttTitleFontSize);
  const [timelineFontSize, setTimelineFontSize] = useState(DEFAULT_SETTINGS.timelineFontSize);
  const [segmentLabelFontSize, setSegmentLabelFontSize] = useState(DEFAULT_SETTINGS.segmentLabelFontSize);
  const [todoItemFontSize, setTodoItemFontSize] = useState(DEFAULT_SETTINGS.todoItemFontSize);
  const [showSettings, setShowSettings] = useState(false);
  const [showOpacity, setShowOpacity] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showAnnualView, setShowAnnualView] = useState(true);
  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const [showTodoList, setShowTodoList] = useState(true);
  const [showAnnualFieldNames, setShowAnnualFieldNames] = useState(DEFAULT_SETTINGS.showAnnualFieldNames);
  const [showAnnualStatusText, setShowAnnualStatusText] = useState(DEFAULT_SETTINGS.showAnnualStatusText);
  const [showMonthlyFieldNames, setShowMonthlyFieldNames] = useState(DEFAULT_SETTINGS.showMonthlyFieldNames);
  const [showMonthlyStatusText, setShowMonthlyStatusText] = useState(DEFAULT_SETTINGS.showMonthlyStatusText);
  const [showRemarks, setShowRemarks] = useState(DEFAULT_SETTINGS.showRemarks);
  const [hudLabelMode, setHudLabelMode] = useState(DEFAULT_SETTINGS.hudLabelMode);
  const [hudDensity, setHudDensity] = useState(DEFAULT_SETTINGS.hudDensity);
  const [animationLevel, setAnimationLevel] = useState(DEFAULT_SETTINGS.animationLevel);
  const [rememberWindowSize, setRememberWindowSize] = useState(DEFAULT_SETTINGS.rememberWindowSize);
  const [rememberWindowPosition, setRememberWindowPosition] = useState(DEFAULT_SETTINGS.rememberWindowPosition);
  const [startupViewPreset, setStartupViewPreset] = useState(DEFAULT_SETTINGS.startupViewPreset);
  const [shortcutConfig, setShortcutConfig] = useState(DEFAULT_SETTINGS.shortcutConfig);
  const [openAtLogin, setOpenAtLogin] = useState(false);
  const [monthlyData, setMonthlyData] = useState({});
  const [monthlyOffset, setMonthlyOffset] = useState(0);
  const [monthlyDayOffset, setMonthlyDayOffset] = useState(0);
  const [todoData, setTodoData] = useState({});
  const [sortMode, setSortMode] = useState('creation');
  const [globalThemeId, setGlobalThemeId] = useState('amber');
  const [colorMode, setColorMode] = useState('dark');
  const hoveredMonthlyTaskRef = useRef(null);
  const [creationOrderIds, setCreationOrderIds] = useState(() => initialRows.map(r => r.id));
  const hoveredSegRef = useRef(null);
  const [now, setNow] = useState(new Date());
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth));
  const [viewportHeight, setViewportHeight] = useState(() => (typeof window === 'undefined' ? 900 : window.innerHeight));
  const [hudHeight, setHudHeight] = useState(HUD_HEIGHT + 20);
  const dataLoaded = useRef(false);
  const ganttWindowRef = useRef(null);
  const hudRef = useRef(null);
  const resizeStateRef = useRef(null);
  const resizeFrameRef = useRef(null);
  const pendingBoundsRef = useRef(null);
  const handleWindowEdgePointerDown = useCallback((e, edge) => {
    if (!window.electronAPI?.getWindowBounds || !window.electronAPI?.setWindowBounds || isPinned) return;
    e.preventDefault();
    e.stopPropagation();
    window.electronAPI.getWindowBounds().then((bounds) => {
      if (!bounds) return;
      resizeStateRef.current = {
        edge,
        startX: e.clientX,
        startY: e.clientY,
        startBounds: bounds,
      };
      const onMove = (moveE) => {
        if (!resizeStateRef.current) return;
        const { edge: ed, startX, startY, startBounds } = resizeStateRef.current;
        const dx = moveE.clientX - startX;
        const dy = moveE.clientY - startY;
        let { x, y, width, height } = { ...startBounds };
        const maxHeight = typeof window !== 'undefined' && window.screen?.availHeight ? window.screen.availHeight - 20 : 1400;
        if (ed === 'e' || ed === 'se') width = Math.max(800, startBounds.width + dx);
        if (ed === 'w' || ed === 'sw') {
          const newW = Math.max(800, startBounds.width - dx);
          x = startBounds.x + startBounds.width - newW;
          width = newW;
        }
        if (ed === 's' || ed === 'se' || ed === 'sw') height = Math.min(maxHeight, Math.max(200, startBounds.height + dy));
        pendingBoundsRef.current = { x, y, width, height };
        if (!resizeFrameRef.current) {
          resizeFrameRef.current = requestAnimationFrame(() => {
            resizeFrameRef.current = null;
            if (pendingBoundsRef.current) {
              window.electronAPI?.setWindowBounds?.(pendingBoundsRef.current);
            }
          });
        }
      };
      const onUp = () => {
        resizeStateRef.current = null;
        if (resizeFrameRef.current) {
          cancelAnimationFrame(resizeFrameRef.current);
          resizeFrameRef.current = null;
        }
        if (pendingBoundsRef.current) {
          window.electronAPI?.setWindowBounds?.(pendingBoundsRef.current);
          pendingBoundsRef.current = null;
        }
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });
  }, [isPinned]);

  useEffect(() => {
    if (!window.electronAPI?.loadPlanData) { dataLoaded.current = true; return; }
    window.electronAPI.loadPlanData().then((d) => {
      if (d) {
        if (d.rows) setRows(d.rows);
        if (d.timelineOffset != null) setTimelineOffset(d.timelineOffset);
        if (d.isWideMode != null) setIsWideMode(d.isWideMode);
        if (d.isNarrowMode != null) setIsNarrowMode(d.isNarrowMode);
        if (['narrow', 'normal', 'wide'].includes(d.annualDensityOverride)) setAnnualDensityOverride(d.annualDensityOverride);
        if (['narrow', 'normal', 'wide'].includes(d.monthlyDensityOverride)) setMonthlyDensityOverride(d.monthlyDensityOverride);
        if (d.globalOpacity != null) setGlobalOpacity(d.globalOpacity);
        if (d.uiScale != null) setUiScale(d.uiScale);
        if (d.panelSurfaceOpacity != null) setPanelSurfaceOpacity(d.panelSurfaceOpacity);
        if (d.ganttTitleFontSize != null) setGanttTitleFontSize(d.ganttTitleFontSize);
        if (d.timelineFontSize != null) setTimelineFontSize(d.timelineFontSize);
        if (d.segmentLabelFontSize != null) setSegmentLabelFontSize(d.segmentLabelFontSize);
        if (d.todoItemFontSize != null) setTodoItemFontSize(d.todoItemFontSize);
        if (d.showAnnualFieldNames != null) setShowAnnualFieldNames(d.showAnnualFieldNames);
        if (d.showAnnualStatusText != null) setShowAnnualStatusText(d.showAnnualStatusText);
        if (d.showMonthlyFieldNames != null) setShowMonthlyFieldNames(d.showMonthlyFieldNames);
        if (d.showMonthlyStatusText != null) setShowMonthlyStatusText(d.showMonthlyStatusText);
        if (d.showRemarks != null) setShowRemarks(d.showRemarks);
        if (d.rememberWindowSize != null) setRememberWindowSize(d.rememberWindowSize);
        if (d.rememberWindowPosition != null) setRememberWindowPosition(d.rememberWindowPosition);
        if (d.startupViewPreset) setStartupViewPreset(d.startupViewPreset);
        if (d.shortcutConfig?.togglePin) setShortcutConfig({ togglePin: d.shortcutConfig.togglePin });
        if (d.showAnnualView != null) setShowAnnualView(d.showAnnualView);
        if (d.showMonthlyView != null) setShowMonthlyView(d.showMonthlyView);
        if (d.showTodoList != null) setShowTodoList(d.showTodoList);
        if (d.paintColor) setPaintColor(d.paintColor);
        if (d.monthlyData) setMonthlyData(d.monthlyData);
        if (d.todoData) setTodoData(d.todoData);
        if (d.sortMode) setSortMode(d.sortMode);
        if (d.globalThemeId) setGlobalThemeId(d.globalThemeId);
        if (d.colorMode) setColorMode(d.colorMode);
        if (d.rows?.length) {
          const loadedIds = d.rows.map(r => r.id);
          if (d.creationOrderIds?.length) {
            const known = new Set(d.creationOrderIds);
            const extra = loadedIds.filter(id => !known.has(id));
            setCreationOrderIds([...d.creationOrderIds.filter(id => loadedIds.includes(id)), ...extra]);
          } else {
            setCreationOrderIds(loadedIds);
          }
        }
        if (d.startupViewPreset && d.startupViewPreset !== 'remember') {
          if (d.startupViewPreset === 'annual-monthly') {
            setShowAnnualView(true);
            setShowMonthlyView(true);
            setShowTodoList(false);
          } else if (d.startupViewPreset === 'annual-todo') {
            setShowAnnualView(true);
            setShowMonthlyView(false);
            setShowTodoList(true);
          } else if (d.startupViewPreset === 'monthly-todo') {
            setShowAnnualView(false);
            setShowMonthlyView(true);
            setShowTodoList(true);
          }
        }
      }
      dataLoaded.current = true;
    });
    window.electronAPI?.getAppMeta?.().then((m) => { if (m) setAppMeta(m); });
    window.electronAPI?.onUpdateAvailable?.((info) => setUpdateInfo(info));
  }, []);

  const unifiedPastRef = useRef([]);
  const rowsRef = useRef(rows);
  const todoDataRef = useRef(todoData);
  const creationOrderIdsRef = useRef(creationOrderIds);
  useEffect(() => { rowsRef.current = rows; }, [rows]);
  useEffect(() => { todoDataRef.current = todoData; }, [todoData]);
  useEffect(() => { creationOrderIdsRef.current = creationOrderIds; }, [creationOrderIds]);

  useEffect(() => {
    if (window.electronAPI?.onForceUnpin) {
      window.electronAPI.onForceUnpin(() => setIsPinned(false));
    }
    if (window.electronAPI?.onForcePin) {
      window.electronAPI.onForcePin(() => setIsPinned(true));
    }
  }, []);

  useEffect(() => {
    if (window.electronAPI?.setWindowPinned) {
      window.electronAPI.setWindowPinned(isPinned);
    }
  }, [isPinned]);

  useEffect(() => {
    if (window.electronAPI?.setWindowOpacity) {
      window.electronAPI.setWindowOpacity(Math.min(100, globalOpacity) / 100);
    }
  }, [globalOpacity]);

  useEffect(() => {
    window.electronAPI?.getLoginItemSettings?.().then((v) => setOpenAtLogin(!!v));
  }, []);

  useEffect(() => {
    if (!dataLoaded.current || !window.electronAPI?.savePlanData) return;
    const timer = setTimeout(() => {
      window.electronAPI.savePlanData({
        rows,
        timelineOffset,
        isWideMode,
        isNarrowMode,
        annualDensityOverride,
        monthlyDensityOverride,
        globalOpacity,
        uiScale,
        panelSurfaceOpacity,
        ganttTitleFontSize,
        timelineFontSize,
        segmentLabelFontSize,
        todoItemFontSize,
        showAnnualFieldNames,
        showAnnualStatusText,
        showMonthlyFieldNames,
        showMonthlyStatusText,
        showRemarks,
        rememberWindowSize,
        rememberWindowPosition,
        startupViewPreset,
        shortcutConfig,
        showAnnualView,
        showMonthlyView,
        showTodoList,
        paintColor,
        monthlyData,
        todoData,
        sortMode,
        creationOrderIds,
        globalThemeId,
        colorMode
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [rows, timelineOffset, isWideMode, isNarrowMode, annualDensityOverride, monthlyDensityOverride, globalOpacity, uiScale, panelSurfaceOpacity, ganttTitleFontSize, timelineFontSize, segmentLabelFontSize, todoItemFontSize, showAnnualFieldNames, showAnnualStatusText, showMonthlyFieldNames, showMonthlyStatusText, showRemarks, rememberWindowSize, rememberWindowPosition, startupViewPreset, shortcutConfig, showAnnualView, showMonthlyView, showTodoList, paintColor, monthlyData, todoData, sortMode, creationOrderIds, globalThemeId, colorMode]);

  const ROW_HEIGHT_MONTHLY = 32;
  const TODO_ITEM_HEIGHT = 28;
  const rowHeight = isWideMode ? ROW_HEIGHT_WIDE : (isNarrowMode ? ROW_HEIGHT_COMPACT : ROW_HEIGHT_NARROW);
  const effectiveAnnualDensity = annualDensityOverride ?? (isWideMode ? 'wide' : isNarrowMode ? 'narrow' : 'normal');
  const effectiveMonthlyDensity = monthlyDensityOverride ?? (isWideMode ? 'wide' : isNarrowMode ? 'narrow' : 'normal');
  const annualRowHeight = effectiveAnnualDensity === 'wide' ? ROW_HEIGHT_WIDE : (effectiveAnnualDensity === 'narrow' ? ROW_HEIGHT_COMPACT : ROW_HEIGHT_NARROW);
  const ganttContentHeight = showAnnualView ? (HEADER_HEIGHT + rows.length * annualRowHeight + ADD_ROW_HEIGHT + GANTT_PADDING) : 0;

  const { monthlyHeight, todoHeight } = useMemo(() => {
    let mh = 0;
    if (showMonthlyView) {
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const totalMonths = (year - baseYear) * 12 + (month - 1) + monthlyOffset;
      const displayYear = baseYear + Math.floor(totalMonths / 12);
      const displayMonth = ((totalMonths % 12) + 12) % 12 + 1;
      const monthKey = `${displayYear}-${String(displayMonth).padStart(2, '0')}`;
      const monthStart = (displayYear - baseYear) * 12 + (displayMonth - 1);
      const monthEnd = monthStart + 1;
      const spanRows = rows.filter(r => r.segments.some(s => s.start < monthEnd && s.end > monthStart));
      const dataForMonth = monthlyData[monthKey] || { groups: {}, ungroupedTasks: [] };
      let taskRows = 0;
      spanRows.forEach(r => {
        const g = dataForMonth.groups?.[r.id] || { tasks: [] };
        taskRows += Math.max(1, g.tasks?.length || 0);
      });
      taskRows += Math.max(1, (dataForMonth.ungroupedTasks || []).length);
      mh = 60 + 40 + (spanRows.length + 1) * ROW_HEIGHT_MONTHLY + taskRows * ROW_HEIGHT_MONTHLY;
    }
    let th = 0;
    if (showTodoList) {
      const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
      const today = new Date(now);
      const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
      const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const n1 = (todoData[fmt(yesterday)] || []).length;
      const n2 = (todoData[fmt(today)] || []).length;
      const n3 = (todoData[fmt(tomorrow)] || []).length;
      const maxItems = Math.max(n1, n2, n3, 1);
      th = 40 + maxItems * TODO_ITEM_HEIGHT + 32;
    }
    return { monthlyHeight: mh, todoHeight: th };
  }, [showMonthlyView, showTodoList, rows, monthlyData, todoData, now, monthlyOffset]);

  const contentHeight = ganttContentHeight + (showMonthlyView ? 24 + monthlyHeight : 0) + (showTodoList ? 24 + todoHeight : 0);
  const rawWindowHeight = CONTAINER_TOP + 12 + contentHeight + (isPinned ? 0 : HUD_HEIGHT + 20);
  const maxWindowHeight = typeof window !== 'undefined' && window.screen?.availHeight ? Math.max(400, window.screen.availHeight - 80) : 900;
  const totalWindowHeight = Math.min(Math.max(300, rawWindowHeight), maxWindowHeight);

  useEffect(() => {
    if (window.electronAPI?.resizeWindow) {
      window.electronAPI.resizeWindow(undefined, totalWindowHeight);
    }
  }, [totalWindowHeight]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!hudRef.current) return;
    const node = hudRef.current;
    const updateHeight = () => setHudHeight(node.getBoundingClientRect().height);
    updateHeight();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateHeight);
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, [showAnnualView, showMonthlyView, showTodoList, isPinned]);

  useEffect(() => {
    if (!window.electronAPI?.setShortcutConfig) return;
    window.electronAPI.setShortcutConfig(shortcutConfig);
  }, [shortcutConfig]);

  const commitHistory = useCallback(() => {
    unifiedPastRef.current.push({
      type: 'rows',
      rows: structuredClone(rowsRef.current),
      creationOrderIds: [...creationOrderIdsRef.current],
    });
  }, []);

  const commitTodoHistory = useCallback(() => {
    unifiedPastRef.current.push({
      type: 'todo',
      state: structuredClone(todoDataRef.current),
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        const tag = document.activeElement?.tagName?.toLowerCase();
        const stack = unifiedPastRef.current;
        const last = stack[stack.length - 1];
        // 在输入框内仍允许撤销 Todo（含顺延/反顺延），甘特等其它栈顶保持原逻辑
        if ((tag === 'input' || tag === 'textarea') && (!last || last.type !== 'todo')) return;
        e.preventDefault();
        const entry = unifiedPastRef.current.pop();
        if (!entry) return;
        if (entry.type === 'rows') {
          setRows(entry.rows);
          setCreationOrderIds(entry.creationOrderIds);
        } else {
          setTodoData(entry.state);
        }
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const tag = document.activeElement?.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        if (hoveredMonthlyTaskRef.current) {
          const { groupId, taskId, monthKey } = hoveredMonthlyTaskRef.current;
          hoveredMonthlyTaskRef.current = null;
          if (monthKey) {
            setMonthlyData(prev => {
              const d = prev[monthKey] || { groups: {}, ungroupedTasks: [] };
              if (groupId) {
                const g = d.groups?.[groupId];
                if (!g) return prev;
                const tasks = g.tasks.filter(t => t.id !== taskId);
                return { ...prev, [monthKey]: { ...d, groups: { ...d.groups, [groupId]: { ...g, tasks } } } };
              }
              return { ...prev, [monthKey]: { ...d, ungroupedTasks: (d.ungroupedTasks || []).filter(t => t.id !== taskId) } };
            });
          }
        } else if (hoveredSegRef.current) {
          commitHistory();
          const { rowId, segId } = hoveredSegRef.current;
          setRows(prev => {
            const rowIndex = prev.findIndex(r => r.id === rowId);
            if (rowIndex === -1) return prev;
            const row = prev[rowIndex];
            if (row.segments.length <= 1) return prev.filter(r => r.id !== rowId);
            const sortedSegs = [...row.segments].sort((a, b) => a.start - b.start);
            const segIdx = sortedSegs.findIndex(s => s.id === segId);
            if (segIdx === -1) return prev;
            const deletedSeg = sortedSegs[segIdx];
            if (segIdx > 0) {
              sortedSegs[segIdx - 1] = { ...sortedSegs[segIdx - 1], end: deletedSeg.end };
            } else if (sortedSegs.length > 1) {
              sortedSegs[1] = { ...sortedSegs[1], start: deletedSeg.start };
            }
            sortedSegs.splice(segIdx, 1);
            const newRows = [...prev];
            newRows[rowIndex] = { ...row, segments: sortedSegs };
            return newRows;
          });
          hoveredSegRef.current = null;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commitHistory, commitTodoHistory, setMonthlyData, setTodoData]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const currentTimelinePos = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return (year - baseYear) * 12 + month + ((date - 1) / daysInMonth);
  }, [now]);

  const { currentAnnualLabel, currentMonthlyLabel, currentTodoLabel } = useMemo(() => {
    const startMonthInt = Math.floor(timelineOffset);
    const annualYear = baseYear + Math.floor(startMonthInt / 12);
    let monthlyYear = now.getFullYear();
    let monthlyMonth = now.getMonth() + 1;
    if (showMonthlyView) {
      const totalMonths = (monthlyYear - baseYear) * 12 + (monthlyMonth - 1) + monthlyOffset;
      monthlyYear = baseYear + Math.floor(totalMonths / 12);
      monthlyMonth = ((totalMonths % 12) + 12) % 12 + 1;
    }
    return {
      currentAnnualLabel: `${annualYear}年`,
      currentMonthlyLabel: `${monthlyMonth}月`,
      currentTodoLabel: `${now.getDate()}日`,
    };
  }, [timelineOffset, monthlyOffset, now, showMonthlyView]);

  const rowsWithProgress = useMemo(() => {
    return rows.map(row => ({
      ...row,
      segments: row.segments.map(seg => {
        let p = 0;
        if (currentTimelinePos >= seg.end) p = 100;
        else if (currentTimelinePos <= seg.start) p = 0;
        else p = ((currentTimelinePos - seg.start) / (seg.end - seg.start)) * 100;
        let isAck = seg.isAcknowledged;
        if (p < 100) isAck = false;
        return { ...seg, progress: p, isAcknowledged: isAck };
      })
    }));
  }, [rows, currentTimelinePos]);

  const updateSegment = (rowId, segmentId, updates) => {
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      return { ...row, segments: row.segments.map(seg => seg.id !== segmentId ? seg : { ...seg, ...updates }) };
    }));
  };

  const handleCutSegment = (rowId, segmentId, cutTime) => {
    commitHistory();
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      const segIdx = row.segments.findIndex(s => s.id === segmentId);
      if (segIdx === -1) return row;
      const seg = row.segments[segIdx];
      if (cutTime <= seg.start + 0.2 || cutTime >= seg.end - 0.2) return row;
      const newSeg = { ...seg, id: Date.now().toString(), name: "新段落", start: cutTime, isAcknowledged: false };
      const updatedSeg = { ...seg, end: cutTime };
      const newSegments = [...row.segments];
      newSegments[segIdx] = updatedSeg;
      newSegments.splice(segIdx + 1, 0, newSeg);
      return { ...row, segments: newSegments };
    }));
    setActiveTool("pointer");
  };

  const addRow = () => {
    commitHistory();
    const newId = Date.now();
    setRows(prev => [...prev, {
      id: newId, title: "新任务项目",
      segments: [{ id: `${newId}-1`, name: "起始", start: currentTimelinePos, end: currentTimelinePos + 4.0, color: DEFAULT_BAR_COLOR, isAcknowledged: false }]
    }]);
    setCreationOrderIds(prev => [...prev, newId]);
  };

  const deleteRow = (id) => { commitHistory(); setRows(prev => prev.filter(r => r.id !== id)); setCreationOrderIds(prev => prev.filter(rid => rid !== id)); };

  const sortTasksByStartDate = () => {
    if (sortMode === 'time') {
      commitHistory();
      setSortMode('creation');
      setRows(prev => {
        const byId = Object.fromEntries(prev.map(r => [r.id, r]));
        const ordered = creationOrderIds.filter(id => byId[id]).map(id => byId[id]);
        const remaining = prev.filter(r => !creationOrderIds.includes(r.id));
        return [...ordered, ...remaining];
      });
    } else {
      commitHistory();
      setSortMode('time');
      setRows(prev => {
        const sorted = [...prev].sort((a, b) => {
          const startA = Math.min(...a.segments.map(s => s.start));
          const startB = Math.min(...b.segments.map(s => s.start));
          return startA - startB;
        });
        return sorted;
      });
    }
  };

  const activeTheme = GLOBAL_THEMES.find(t => t.id === globalThemeId) || GLOBAL_THEMES[0];
  const isLight = colorMode === 'light';
  const C = {
    panelBg: (a) => isLight ? hexToLightBg(activeTheme.color, 0.13, a) : hexToDarkBg(activeTheme.color, 0.12, a),
    hudBg: (a) => isLight ? hexToLightBg(activeTheme.color, 0.13, a) : hexToDarkBg(activeTheme.color, 0.08, a),
    popupBg: (a) => isLight ? hexToLightBg(activeTheme.color, 0.16, a) : hexToDarkBg(activeTheme.color, 0.18, a),
    settingsBg: (a) => isLight ? hexToLightBg(activeTheme.color, 0.16, a) : hexToDarkBg(activeTheme.color, 0.12, a),
    borderPanel: isLight ? 'border-black/10' : 'border-white/10',
    borderStrong: isLight ? 'border-black/15' : 'border-white/20',
    textPrimary: isLight ? 'text-gray-800' : 'text-slate-100',
    textSecondary: isLight ? 'text-gray-500' : 'text-white/50',
    textMuted: isLight ? 'text-gray-400' : 'text-white/40',
    btnInactive: isLight ? 'text-gray-500 hover:text-gray-700 hover:bg-black/5' : 'text-white/45 hover:text-white/85 hover:bg-white/5',
    monthHeaderBg: isLight ? 'bg-amber-100/90' : 'bg-neutral-800/80',

    edgeHover: isLight ? 'hover:bg-black/5' : 'hover:bg-white/5',
    divider: isLight ? 'border-black/10' : 'border-white/10',
    scrollThumb: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)',
    scrollThumbHover: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)',
    popupShadow: isLight ? '0 4px 20px rgba(0,0,0,0.13), 0 1px 6px rgba(0,0,0,0.07)' : 'none',
  };
  const autoScale = viewportWidth >= 2000 ? 1.15 : viewportWidth >= 1600 ? 1.08 : viewportWidth <= 1200 ? 0.95 : 1;
  const effectiveScale = autoScale * (uiScale / 100);
  const panelBoost = Math.max(0, (globalOpacity - 100) / 50);
  const surfaceTuning = panelSurfaceOpacity / 100;
  const panelAlpha = Math.min(1, (0.58 + panelBoost * 0.35) * surfaceTuning);
  const hudAlpha = isLight ? 0.9 : Math.min(1, (0.72 + panelBoost * 0.25) * surfaceTuning);
  const popupAlpha = isLight ? 0.97 : Math.min(1, (0.82 + panelBoost * 0.18) * surfaceTuning);
  const densityMode = isWideMode ? 'wide' : (isNarrowMode ? 'narrow' : 'normal');
  const densityLabel = densityMode === 'wide' ? '2x' : densityMode === 'narrow' ? '0.5x' : '1x';
  const hudCompact = true;

  const applyOpacitySlider = (nextValue) => {
    const numeric = Number(nextValue);
    if (!Number.isFinite(numeric)) return;
    if (numeric <= 100) {
      setGlobalOpacity(Math.abs(numeric - 100) <= 2 ? 100 : numeric);
      return;
    }
    const snapped = Math.round(numeric / 5) * 5;
    setGlobalOpacity(Math.min(150, Math.max(100, snapped)));
  };

  const restoreDefaultSettings = () => {
    setUiScale(DEFAULT_SETTINGS.uiScale);
    setPanelSurfaceOpacity(DEFAULT_SETTINGS.panelSurfaceOpacity);
    setGanttTitleFontSize(DEFAULT_SETTINGS.ganttTitleFontSize);
    setTimelineFontSize(DEFAULT_SETTINGS.timelineFontSize);
    setSegmentLabelFontSize(DEFAULT_SETTINGS.segmentLabelFontSize);
    setTodoItemFontSize(DEFAULT_SETTINGS.todoItemFontSize);
    setShowAnnualFieldNames(DEFAULT_SETTINGS.showAnnualFieldNames);
    setShowAnnualStatusText(DEFAULT_SETTINGS.showAnnualStatusText);
    setShowMonthlyFieldNames(DEFAULT_SETTINGS.showMonthlyFieldNames);
    setShowMonthlyStatusText(DEFAULT_SETTINGS.showMonthlyStatusText);
    setShowRemarks(DEFAULT_SETTINGS.showRemarks);
    setHudLabelMode(DEFAULT_SETTINGS.hudLabelMode);
    setHudDensity(DEFAULT_SETTINGS.hudDensity);
    setAnimationLevel(DEFAULT_SETTINGS.animationLevel);
    setRememberWindowSize(DEFAULT_SETTINGS.rememberWindowSize);
    setRememberWindowPosition(DEFAULT_SETTINGS.rememberWindowPosition);
    setStartupViewPreset(DEFAULT_SETTINGS.startupViewPreset);
    setShortcutConfig(DEFAULT_SETTINGS.shortcutConfig);
  };

  const exportData = async () => {
    if (!window.electronAPI?.exportPlanData) return;
    await window.electronAPI.exportPlanData({
      rows,
      timelineOffset,
      isWideMode,
      isNarrowMode,
      globalOpacity,
      uiScale,
      panelSurfaceOpacity,
      ganttTitleFontSize,
      timelineFontSize,
      segmentLabelFontSize,
      todoItemFontSize,
      showAnnualFieldNames,
      showAnnualStatusText,
      showMonthlyFieldNames,
      showMonthlyStatusText,
      showRemarks,
      rememberWindowSize,
      rememberWindowPosition,
      startupViewPreset,
      shortcutConfig,
      showAnnualView,
      showMonthlyView,
      showTodoList,
      paintColor,
      monthlyData,
      todoData,
      sortMode,
      creationOrderIds,
    });
  };

  const importData = async () => {
    if (!window.electronAPI?.importPlanData) return;
    const imported = await window.electronAPI.importPlanData();
    if (!imported) return;
    if (imported.rows) setRows(imported.rows);
    if (imported.timelineOffset != null) setTimelineOffset(imported.timelineOffset);
    if (imported.isWideMode != null) setIsWideMode(imported.isWideMode);
    if (imported.isNarrowMode != null) setIsNarrowMode(imported.isNarrowMode);
    if (imported.globalOpacity != null) setGlobalOpacity(imported.globalOpacity);
    if (imported.uiScale != null) setUiScale(imported.uiScale);
    if (imported.panelSurfaceOpacity != null) setPanelSurfaceOpacity(imported.panelSurfaceOpacity);
    if (imported.ganttTitleFontSize != null) setGanttTitleFontSize(imported.ganttTitleFontSize);
    if (imported.timelineFontSize != null) setTimelineFontSize(imported.timelineFontSize);
    if (imported.segmentLabelFontSize != null) setSegmentLabelFontSize(imported.segmentLabelFontSize);
    if (imported.todoItemFontSize != null) setTodoItemFontSize(imported.todoItemFontSize);
    if (imported.showAnnualFieldNames != null) setShowAnnualFieldNames(imported.showAnnualFieldNames);
    if (imported.showAnnualStatusText != null) setShowAnnualStatusText(imported.showAnnualStatusText);
    if (imported.showMonthlyFieldNames != null) setShowMonthlyFieldNames(imported.showMonthlyFieldNames);
    if (imported.showMonthlyStatusText != null) setShowMonthlyStatusText(imported.showMonthlyStatusText);
    if (imported.showRemarks != null) setShowRemarks(imported.showRemarks);
    if (imported.rememberWindowSize != null) setRememberWindowSize(imported.rememberWindowSize);
    if (imported.rememberWindowPosition != null) setRememberWindowPosition(imported.rememberWindowPosition);
    if (imported.startupViewPreset) setStartupViewPreset(imported.startupViewPreset);
    if (imported.shortcutConfig?.togglePin) setShortcutConfig({ togglePin: imported.shortcutConfig.togglePin });
    if (imported.showAnnualView != null) setShowAnnualView(imported.showAnnualView);
    if (imported.showMonthlyView != null) setShowMonthlyView(imported.showMonthlyView);
    if (imported.showTodoList != null) setShowTodoList(imported.showTodoList);
    if (imported.paintColor) setPaintColor(imported.paintColor);
    if (imported.monthlyData) setMonthlyData(imported.monthlyData);
    if (imported.todoData) setTodoData(imported.todoData);
    if (imported.sortMode) setSortMode(imported.sortMode);
    if (imported.creationOrderIds?.length) setCreationOrderIds(imported.creationOrderIds);
  };

  const cycleAnnualDensity = () => {
    setAnnualDensityOverride(null);
    setMonthlyDensityOverride(null);
    if (!isNarrowMode && !isWideMode) {
      setIsNarrowMode(true);
      return;
    }
    if (isNarrowMode) {
      setIsNarrowMode(false);
      setIsWideMode(true);
      return;
    }
    setIsWideMode(false);
  };

  const toggleAnnualView = () => {
    if (showAnnualView && !showMonthlyView && !showTodoList) return;
    setShowAnnualView(v => !v);
  };
  const toggleMonthlyView = () => {
    if (showMonthlyView && !showAnnualView && !showTodoList) return;
    setShowMonthlyView(v => !v);
  };
  const toggleTodoView = () => {
    if (showTodoList && !showAnnualView && !showMonthlyView) return;
    setShowTodoList(v => !v);
  };

  const closeAllPanels = () => { setShowPalette(false); setShowHelp(false); setShowOpacity(false); setShowTheme(false); setShowSettings(false); };

  const panelDir = 'bottom-full mb-2 origin-bottom';
  const buttonPadding = hudCompact ? 'px-2 py-1.5' : 'px-2.5 py-1.5';
  const showHudText = false;
  const makeHudButtonClass = (isActive) => `${buttonPadding} rounded-xl transition-all inline-flex items-center gap-1.5 ${isActive ? (isLight ? activeTheme.lightHighlight : activeTheme.highlight) : C.btnInactive}`;

  const hudContent = (
    <div className={`flex items-center ${hudCompact ? 'gap-1' : 'gap-1.5'} pointer-events-auto`}>
        <button onClick={() => { setActiveTool("pointer"); closeAllPanels(); }} className={makeHudButtonClass(activeTool === "pointer")}>
          <MousePointer2 className="w-4 h-4" />
          {showHudText && <span className="text-[11px] font-semibold">指针</span>}
        </button>
        <button onClick={() => { setActiveTool("cut"); closeAllPanels(); }} className={makeHudButtonClass(activeTool === "cut")}>
          <Scissors className="w-4 h-4" />
          {showHudText && <span className="text-[11px] font-semibold">切割</span>}
        </button>

        <div className={`relative flex items-center ${showPalette ? 'z-50' : 'z-10'}`}>
          <button onClick={() => { setShowPalette(!showPalette); setShowHelp(false); setShowOpacity(false); setShowTheme(false); setShowSettings(false); }} className={`${makeHudButtonClass(activeTool === "paint" || showPalette)} z-10`}>
            <PaintBucket className="w-4 h-4" color={activeTool === 'paint' ? paintColor : 'currentColor'} />
            {showHudText && <span className="text-[11px] font-semibold">颜色</span>}
          </button>
          <div className={`absolute left-0 ${panelDir} transition-all duration-200 ${showPalette ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className={`rounded-2xl border p-2 flex flex-wrap gap-1.5 w-[160px] ${C.borderStrong}`} style={{ backgroundColor: C.popupBg(popupAlpha), boxShadow: C.popupShadow }}>
              {presetColors.map(c => (
                <button key={c} onClick={() => { setPaintColor(c); setActiveTool("paint"); setShowPalette(false); }} className="w-5 h-5 rounded-full border border-white/10 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
              ))}
              <label className="w-5 h-5 rounded-full border border-white/30 hover:scale-110 transition-transform relative overflow-hidden cursor-pointer bg-gradient-to-br from-red-500 via-green-500 to-blue-500">
                <input type="color" value={paintColor} onChange={(e) => { setPaintColor(e.target.value); setActiveTool("paint"); setShowPalette(false); }} className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
            </div>
          </div>
        </div>

        <button onClick={() => { cycleAnnualDensity(); closeAllPanels(); }} className={`${makeHudButtonClass(isWideMode || isNarrowMode)} z-10 ml-0.5`} title={`年度密度 ${densityLabel}`}>
          <span className="text-[11px] font-semibold">{densityLabel}</span>
        </button>

        <button onClick={() => { sortTasksByStartDate(); closeAllPanels(); }}
          className={`${makeHudButtonClass(sortMode === 'time')} ml-1`} title={sortMode === 'time' ? '切回创建顺序' : '按起始日期排序'}>
          <CustomSortIcon className="w-4 h-4" />
          {showHudText && <span className="text-[11px] font-semibold">排序</span>}
        </button>

        <div className={`relative flex items-center ml-1 ${showTheme ? 'z-50' : 'z-10'}`}>
          <button onClick={() => { setShowTheme(!showTheme); setShowPalette(false); setShowHelp(false); setShowOpacity(false); setShowSettings(false); }} className={`${makeHudButtonClass(showTheme)} z-10`} title="全局主题色">
            <Palette className="w-4 h-4" />
            {showHudText && <span className="text-[11px] font-semibold">主题</span>}
          </button>
          <div className={`absolute left-1/2 -translate-x-1/2 ${panelDir} transition-all duration-200 ${showTheme ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className={`border rounded-2xl p-2 flex flex-col gap-2 w-[140px] ${C.borderStrong}`} style={{ backgroundColor: C.popupBg(popupAlpha), boxShadow: C.popupShadow }}>
              <div className="flex flex-wrap gap-1.5">
                {GLOBAL_THEMES.map(t => (
                  <button key={t.id} onClick={() => { setGlobalThemeId(t.id); setShowTheme(false); }} title={t.name} className={`w-5 h-5 rounded-full border transition-transform ${globalThemeId === t.id ? 'scale-110 border-white' : `${C.borderPanel} hover:scale-110`}`} style={{ backgroundColor: t.color }} />
                ))}
              </div>
              <button
                onClick={() => setColorMode(m => m === 'dark' ? 'light' : 'dark')}
                className={`flex items-center justify-center gap-1.5 w-full rounded-xl py-1 text-[10px] font-semibold transition-all border ${C.borderPanel} ${C.btnInactive}`}
                title={isLight ? '切换为深色模式' : '切换为便利贴亮色模式'}
              >
                {isLight ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                {isLight ? '深色' : '亮色'}
              </button>
            </div>
          </div>
        </div>

        <div className={`relative flex items-center ml-1 ${showOpacity ? 'z-50' : 'z-10'}`}>
          <button onClick={() => { setShowOpacity(!showOpacity); setShowPalette(false); setShowHelp(false); setShowTheme(false); setShowSettings(false); }} className={`${makeHudButtonClass(showOpacity)} z-10`} title="透明度">
            <SunDim className="w-4 h-4" />
            {showHudText && <span className="text-[11px] font-semibold">透明</span>}
          </button>
          <div className={`absolute left-0 ${panelDir} transition-all duration-200 ${showOpacity ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className={`border rounded-2xl p-2 w-[182px] space-y-2 ${C.borderStrong}`} style={{ backgroundColor: C.popupBg(popupAlpha), boxShadow: C.popupShadow }}>
              <SliderPanel
                label="透明度"
                value={globalOpacity}
                min={10}
                max={150}
                step={1}
                onChange={(e) => applyOpacitySlider(e.target.value)}
                markerAt={100}
                markerColor={activeTheme.color}
                progressColor={globalOpacity <= 100 ? 'linear-gradient(90deg, rgba(255,255,255,0.16), rgba(255,255,255,0.5))' : `linear-gradient(90deg, rgba(255,255,255,0.22), ${activeTheme.color})`}
                secondaryStart={100}
                isLight={isLight}
              />
              <div className={`text-[9px] leading-tight ${C.textMuted}`}>100% 以上单独增强面板实心度</div>
            </div>
          </div>
        </div>

        <div className="relative ml-1">
          <button onClick={() => { setIsPinned((prev) => !prev); closeAllPanels(); }} className={makeHudButtonClass(isPinned)} title={isPinned ? '解除固定窗口' : '固定窗口到桌面'}>
            {isPinned ? <CustomPinOff className="w-4 h-4" /> : <CustomPin className="w-4 h-4" />}
            {showHudText && <span className="text-[11px] font-semibold">{isPinned ? '解除固定' : '固定'}</span>}
          </button>
        </div>

        {updateInfo && (
          <button
            onClick={() => window.electronAPI?.openExternal?.(updateInfo.url)}
            className="ml-1 px-2 py-1 rounded-xl text-[10px] font-black text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-1 animate-pulse"
            title={`新版本 ${updateInfo.version} 可用`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {updateInfo.version}
          </button>
        )}

        <div className={`relative flex items-center ml-1 ${showSettings ? 'z-50' : 'z-10'}`}>
          <button onClick={() => { setShowSettings(!showSettings); setShowHelp(false); setShowPalette(false); setShowOpacity(false); setShowTheme(false); }} className={`${makeHudButtonClass(showSettings)} z-10 relative`} title="设置">
            <Settings2 className="w-4 h-4" />
          </button>
          <div className={`absolute right-0 ${panelDir} transition-all duration-200 ${showSettings ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div data-popup-panel className={`w-[196px] rounded-2xl border p-2 space-y-1 ${C.borderStrong}`} style={{ backgroundColor: C.settingsBg(popupAlpha), boxShadow: C.popupShadow }}>
              <div className="flex items-center justify-between">
                <div className={`text-[10px] font-black ${C.textPrimary}`}>设置</div>
                <button onClick={() => setShowSettings(false)} className={`rounded-lg p-0.5 ${C.textSecondary}`}><X className="w-3 h-3" /></button>
              </div>
              <div className={`rounded-xl border p-1.5 space-y-0.5 ${C.borderPanel}`}>
                <StepperRow label={FONT_LIMITS.ganttTitleFontSize.label} value={ganttTitleFontSize} min={FONT_LIMITS.ganttTitleFontSize.min} max={FONT_LIMITS.ganttTitleFontSize.max} step={FONT_LIMITS.ganttTitleFontSize.step} onChange={setGanttTitleFontSize} isLight={isLight} />
                <StepperRow label={FONT_LIMITS.timelineFontSize.label} value={timelineFontSize} min={FONT_LIMITS.timelineFontSize.min} max={FONT_LIMITS.timelineFontSize.max} step={FONT_LIMITS.timelineFontSize.step} onChange={setTimelineFontSize} isLight={isLight} />
                <StepperRow label={FONT_LIMITS.segmentLabelFontSize.label} value={segmentLabelFontSize} min={FONT_LIMITS.segmentLabelFontSize.min} max={FONT_LIMITS.segmentLabelFontSize.max} step={FONT_LIMITS.segmentLabelFontSize.step} onChange={setSegmentLabelFontSize} isLight={isLight} />
                <StepperRow label={FONT_LIMITS.todoItemFontSize.label} value={todoItemFontSize} min={FONT_LIMITS.todoItemFontSize.min} max={FONT_LIMITS.todoItemFontSize.max} step={FONT_LIMITS.todoItemFontSize.step} onChange={setTodoItemFontSize} isLight={isLight} />
                <div className="space-y-0.5 pt-0.5">
                  <ToggleRow label="年度阶段名" checked={showAnnualFieldNames} onChange={() => setShowAnnualFieldNames(v => !v)} isLight={isLight} />
                  <ToggleRow label="年度状态名" checked={showAnnualStatusText} onChange={() => setShowAnnualStatusText(v => !v)} isLight={isLight} />
                  <ToggleRow label="月度阶段名" checked={showMonthlyFieldNames} onChange={() => setShowMonthlyFieldNames(v => !v)} isLight={isLight} />
                  <ToggleRow label="月度状态名" checked={showMonthlyStatusText} onChange={() => setShowMonthlyStatusText(v => !v)} isLight={isLight} />
                  <ToggleRow label="备注" checked={showRemarks} onChange={() => setShowRemarks(v => !v)} isLight={isLight} />
                  <ToggleRow label="开机自启" checked={openAtLogin} onChange={() => { const next = !openAtLogin; setOpenAtLogin(next); window.electronAPI?.setLoginItem?.(next); }} isLight={isLight} />
                </div>
                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  <button onClick={restoreDefaultSettings} className={`rounded-xl border px-2 py-1 text-[10px] font-semibold ${C.borderPanel} ${C.btnInactive}`}>
                    重置
                  </button>
                  <button onClick={() => { setShowHelp(true); setShowSettings(false); }} className={`rounded-xl border px-2 py-1 text-[10px] font-semibold ${C.borderPanel} ${C.btnInactive}`}>
                    帮助与关于
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );

  return (
    <div className={`w-screen h-screen font-sans select-none overflow-visible relative ${C.textPrimary}`} style={{ fontSize: `${effectiveScale * 100}%` }} onContextMenu={(e) => e.preventDefault()} data-color-mode={colorMode}>
      <style>{globalStyles}</style>

      <div className="absolute left-0 right-0 flex flex-col" style={{ width: '100%', top: `${CONTAINER_TOP}px`, bottom: 0 }}>
        <div
          ref={ganttWindowRef}
          className={`backdrop-blur-2xl border rounded-xl overflow-hidden transition-all duration-500 relative flex flex-col min-h-0 ${C.borderPanel}`}
          style={{ backgroundColor: C.panelBg(panelAlpha) }}
        >
          {!isPinned && typeof window !== 'undefined' && window.electronAPI && (
            <>
              <div className={`absolute left-0 top-0 bottom-0 w-[8px] cursor-ew-resize z-[200] ${C.edgeHover} rounded-l-xl`} onPointerDown={(e) => handleWindowEdgePointerDown(e, 'w')} style={{ WebkitAppRegion: 'no-drag' }} />
              <div className={`absolute right-0 top-0 bottom-0 w-[8px] cursor-ew-resize z-[200] ${C.edgeHover} rounded-r-xl`} onPointerDown={(e) => handleWindowEdgePointerDown(e, 'e')} style={{ WebkitAppRegion: 'no-drag' }} />
              <div className={`absolute left-0 right-0 bottom-0 h-[8px] cursor-ns-resize z-[200] ${C.edgeHover} rounded-b-xl`} onPointerDown={(e) => handleWindowEdgePointerDown(e, 's')} style={{ WebkitAppRegion: 'no-drag' }} />
              <div className={`absolute bottom-0 right-0 w-[8px] h-[8px] cursor-se-resize z-[200] ${C.edgeHover} rounded-br-xl`} onPointerDown={(e) => handleWindowEdgePointerDown(e, 'se')} style={{ WebkitAppRegion: 'no-drag' }} />
              <div className={`absolute bottom-0 left-0 w-[8px] h-[8px] cursor-sw-resize z-[200] ${C.edgeHover} rounded-bl-xl`} onPointerDown={(e) => handleWindowEdgePointerDown(e, 'sw')} style={{ WebkitAppRegion: 'no-drag' }} />
            </>
          )}
          <div className="rounded-xl overflow-hidden relative flex flex-col min-h-0 flex-1">
            <div
              className="relative z-[150] h-6 shrink-0"
              style={{ WebkitAppRegion: 'drag', backgroundColor: 'rgba(255,255,255,0.001)' }}
            />
            <motion.div
              layoutScroll
              className={`gantt-scroll-area px-6 pt-0 relative flex-1 min-h-0 flex flex-col gap-0 overflow-y-auto overflow-x-hidden overscroll-contain ${isPinned ? 'pointer-events-none' : ''}`}
              style={{ paddingBottom: isPinned ? 14 : hudHeight + 14 }}
            >
              {showAnnualView && (
                <GanttView
                  rows={rowsWithProgress}
                  setRows={setRows}
                  updateSegment={updateSegment}
                  activeTool={activeTool}
                  setActiveTool={setActiveTool}
                  paintColor={paintColor}
                  onCut={handleCutSegment}
                  onAdd={addRow}
                  onDelete={deleteRow}
                  timelineOffset={timelineOffset}
                  setTimelineOffset={setTimelineOffset}
                  currentTimelinePos={currentTimelinePos}
                  hoveredSegRef={hoveredSegRef}
                  commitHistory={commitHistory}
                  density={effectiveAnnualDensity}
                  onDensityChange={setAnnualDensityOverride}
                  showFieldNames={showAnnualFieldNames}
                  showStatusText={showAnnualStatusText}
                  showRemarks={showRemarks}
                  ganttTitleFontSize={ganttTitleFontSize}
                  timelineFontSize={timelineFontSize}
                  segmentLabelFontSize={segmentLabelFontSize}
                  activeTheme={activeTheme}
                  colorMode={colorMode}
                />
              )}
              {showMonthlyView && (
                <motion.div layout initial={{ height: 0, opacity: 0, overflow: 'hidden' }} animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }} exit={{ height: 0, opacity: 0, overflow: 'hidden' }} transition={{ layout: { type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }} className={showAnnualView ? `border-t pt-1 mt-1 ${C.divider}` : "pt-2"}>
                  <MonthlyGanttView
                    rows={rows}
                    setRows={setRows}
                    monthlyData={monthlyData}
                    setMonthlyData={setMonthlyData}
                    monthlyOffset={monthlyOffset}
                    setMonthlyOffset={setMonthlyOffset}
                    monthlyDayOffset={monthlyDayOffset}
                    setMonthlyDayOffset={setMonthlyDayOffset}
                    now={now}
                    baseYear={baseYear}
                    sortMode={sortMode}
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    paintColor={paintColor}
                    hoveredMonthlyTaskRef={hoveredMonthlyTaskRef}
                    commitHistory={commitHistory}
                    density={effectiveMonthlyDensity}
                    onDensityChange={setMonthlyDensityOverride}
                    showFieldNames={showMonthlyFieldNames}
                    showStatusText={showMonthlyStatusText}
                    showRemarks={showRemarks}
                    ganttTitleFontSize={ganttTitleFontSize}
                    timelineFontSize={timelineFontSize}
                    segmentLabelFontSize={segmentLabelFontSize}
                    activeTheme={activeTheme}
                    colorMode={colorMode}
                  />
                </motion.div>
              )}
              {showTodoList && (
                <motion.div layout data-todo-area initial={{ height: 0, opacity: 0, overflow: 'hidden' }} animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }} exit={{ height: 0, opacity: 0, overflow: 'hidden' }} transition={{ layout: { type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }} className={`border-t pt-4 mt-2 ${C.divider}`}>
                  <TodoListView now={now} todoData={todoData} setTodoData={setTodoData} activeTheme={activeTheme} commitTodoHistory={commitTodoHistory} todoItemFontSize={todoItemFontSize} colorMode={colorMode} />
                </motion.div>
              )}
            </motion.div>
            {!isPinned && (
            <div ref={hudRef} data-hud-root className="absolute inset-x-0 bottom-0 z-[240] px-3 pb-2 pt-1 pointer-events-none">
              <div className={`flex items-center justify-between rounded-2xl border p-1.5 pointer-events-auto ${isLight ? '' : 'backdrop-blur-2xl'} ${C.borderPanel}`} style={{ backgroundColor: C.hudBg(hudAlpha) }}>
                {hudContent}
                <div className="flex items-center gap-2">
                  <button onClick={toggleAnnualView} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all whitespace-nowrap ${showAnnualView ? (isLight ? activeTheme.lightHighlight : activeTheme.highlight) : C.btnInactive}`} title="年度视图">{currentAnnualLabel}</button>
                  <button onClick={toggleMonthlyView} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all whitespace-nowrap ${showMonthlyView ? (isLight ? activeTheme.lightHighlight : activeTheme.highlight) : C.btnInactive}`} title="月度视图">{currentMonthlyLabel}</button>
                  <button onClick={toggleTodoView} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all whitespace-nowrap ${showTodoList ? (isLight ? activeTheme.lightHighlight : activeTheme.highlight) : C.btnInactive}`} title="待办列表">{currentTodoLabel}</button>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* 帮助与关于 覆盖层 */}
          {showHelp && (
            <div className="absolute inset-0 z-[300] flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.55)' }} onClick={() => setShowHelp(false)}>
              <div
                className={`relative rounded-3xl border w-[480px] max-w-[90%] h-[75%] flex flex-col ${C.borderStrong} ${C.textSecondary} shadow-2xl`}
                style={{ backgroundColor: C.popupBg(Math.min(popupAlpha + 0.05, 1)), backdropFilter: 'blur(20px)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 固定头部 */}
                <div className="p-6 pb-4 shrink-0 z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <img src={appIcon} alt="Little Plan" className="w-14 h-14 object-contain drop-shadow-md" />
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h2 className={`text-lg font-bold tracking-tight ${C.textPrimary}`}>Little Plan</h2>
                          {appMeta && <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold" style={{ backgroundColor: activeTheme.tint, color: activeTheme.color }}>v{appMeta.version}</span>}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${C.textMuted}`}>By chizhu1208@163.com</div>
                      </div>
                    </div>
                    <button onClick={() => setShowHelp(false)} className={`p-1.5 rounded-xl ${C.textSecondary} hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}><X className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* 滚动内容区 */}
                <div className="flex-1 overflow-y-auto px-6 pt-5 pb-12 rounded-b-3xl [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)' }}>
                    {(() => {
                      const Kbd = ({ children }) => (
                        <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-[4px] text-[9px] font-mono border ${isLight ? 'bg-gray-100 border-gray-200 text-gray-600' : 'bg-white/10 border-white/10 text-white/70'} mx-[1px] shadow-sm`}>
                          {children}
                        </span>
                      );
                      return (
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                          {/* 左列 */}
                          <div className="space-y-6">
                            <section>
                              <div className={`flex items-center gap-1.5 mb-3 pb-1.5 border-b ${C.borderPanel}`}>
                                <MousePointer2 className="w-3.5 h-3.5" style={{ color: activeTheme.color }} />
                                <h3 className={`text-[12px] font-bold ${C.textPrimary}`}>指针工具</h3>
                              </div>
                              <ul className={`space-y-2.5 text-[11px] ${C.textSecondary}`}>
                                <li className="flex justify-between items-center"><span>平移时间</span> <span className={C.textMuted}>左右拖拽月份/年份</span></li>
                                <li className="flex justify-between items-center"><span>调整任务</span> <span className={C.textMuted}>拖拽条的中间或首尾</span></li>
                                <li className="flex justify-between items-center"><span>编辑名称</span> <span className={C.textMuted}>点击 Bar 上的文字</span></li>
                                <li className="flex justify-between items-center"><span>完成任务</span> <span className={C.textMuted}>长按甘特 Bar 2 秒</span></li>
                                <li className="flex justify-between items-center"><span>取消完成</span> <span className={C.textMuted}>将已完成条向右拖动</span></li>
                                <li className="flex justify-between items-center"><span>删除任务</span> <div><Kbd>Del</Kbd></div></li>
                                <li className="flex justify-between items-center"><span>撤销操作</span> <div><Kbd>⌘</Kbd><Kbd>Z</Kbd></div></li>
                              </ul>
                            </section>

                            <section>
                              <div className={`flex items-center gap-1.5 mb-3 pb-1.5 border-b ${C.borderPanel}`}>
                                <Scissors className="w-3.5 h-3.5" style={{ color: activeTheme.color }} />
                                <h3 className={`text-[12px] font-bold ${C.textPrimary}`}>切割工具</h3>
                              </div>
                              <ul className={`space-y-2.5 text-[11px] ${C.textSecondary}`}>
                                <li className="flex justify-between items-center"><span>切割任务</span> <span className={C.textMuted}>选中工具后点击任务条</span></li>
                              </ul>
                            </section>

                            <section>
                              <div className={`flex items-center gap-1.5 mb-3 pb-1.5 border-b ${C.borderPanel}`}>
                                <Palette className="w-3.5 h-3.5" style={{ color: activeTheme.color }} />
                                <h3 className={`text-[12px] font-bold ${C.textPrimary}`}>填充颜色</h3>
                              </div>
                              <ul className={`space-y-2.5 text-[11px] ${C.textSecondary}`}>
                                <li className="flex justify-between items-center"><span>改变颜色</span> <span className={C.textMuted}>选色后点击任务条</span></li>
                              </ul>
                            </section>

                            <section>
                              <div className={`flex items-center gap-1.5 mb-3 pb-1.5 border-b ${C.borderPanel}`}>
                                <div className="w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded" style={{ color: activeTheme.color, border: `1px solid ${activeTheme.color}` }}>1x</div>
                                <h3 className={`text-[12px] font-bold ${C.textPrimary}`}>显示密度</h3>
                              </div>
                              <ul className={`space-y-2.5 text-[11px] ${C.textSecondary}`}>
                                <li className="flex justify-between items-center"><span>切换密度</span> <span className={C.textMuted}>点击 1x / 2x / 0.5x</span></li>
                              </ul>
                            </section>

                            <section>
                              <div className={`flex items-center gap-1.5 mb-3 pb-1.5 border-b ${C.borderPanel}`}>
                                <CustomSortIcon className="w-3.5 h-3.5" style={{ color: activeTheme.color }} />
                                <h3 className={`text-[12px] font-bold ${C.textPrimary}`}>任务排序</h3>
                              </div>
                              <ul className={`space-y-2.5 text-[11px] ${C.textSecondary}`}>
                                <li className="flex justify-between items-center"><span>切换排序</span> <span className={C.textMuted}>点击切换时间/创建顺序</span></li>
                              </ul>
                            </section>
                          </div>

                          {/* 右列 */}
                          <div className="space-y-6">
                            <section>
                              <div className={`flex items-center gap-1.5 mb-3 pb-1.5 border-b ${C.borderPanel}`}>
                                <SunDim className="w-3.5 h-3.5" style={{ color: activeTheme.color }} />
                                <h3 className={`text-[12px] font-bold ${C.textPrimary}`}>全局主题</h3>
                              </div>
                              <ul className={`space-y-2.5 text-[11px] ${C.textSecondary}`}>
                                <li className="flex justify-between items-center"><span>切换主题</span> <span className={C.textMuted}>展开面板选择全局主题色</span></li>
                                <li className="flex justify-between items-center"><span>亮暗模式</span> <span className={C.textMuted}>面板内切换亮色/暗色</span></li>
                              </ul>
                            </section>

                            <section>
                              <div className={`flex items-center gap-1.5 mb-3 pb-1.5 border-b ${C.borderPanel}`}>
                                <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: activeTheme.color }} />
                                <h3 className={`text-[12px] font-bold ${C.textPrimary}`}>界面透明度</h3>
                              </div>
                              <ul className={`space-y-2.5 text-[11px] ${C.textSecondary}`}>
                                <li className="flex justify-between items-center"><span>调节透明度</span> <span className={C.textMuted}>展开面板拖动滑块</span></li>
                              </ul>
                            </section>

                            <section>
                              <div className={`flex items-center gap-1.5 mb-3 pb-1.5 border-b ${C.borderPanel}`}>
                                <CustomPin className="w-3.5 h-3.5" style={{ color: activeTheme.color }} />
                                <h3 className={`text-[12px] font-bold ${C.textPrimary}`}>定住窗口</h3>
                              </div>
                              <ul className={`space-y-2.5 text-[11px] ${C.textSecondary}`}>
                                <li className="flex justify-between items-center"><span>桌面挂件</span> <div><Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>T</Kbd></div></li>
                              </ul>
                            </section>

                            <section>
                              <div className={`flex items-center gap-1.5 mb-3 pb-1.5 border-b ${C.borderPanel}`}>
                                <Settings2 className="w-3.5 h-3.5" style={{ color: activeTheme.color }} />
                                <h3 className={`text-[12px] font-bold ${C.textPrimary}`}>系统设置</h3>
                              </div>
                              <ul className={`space-y-2.5 text-[11px] ${C.textSecondary}`}>
                                <li className="flex justify-between items-center"><span>导出/导入</span> <span className={C.textMuted}>设置面板 → 导出/导入</span></li>
                                <li className="flex justify-between items-center"><span>显示开关</span> <span className={C.textMuted}>设置面板 → 切换各项显示</span></li>
                              </ul>
                            </section>

                            <section>
                              <div className={`flex items-center gap-1.5 mb-3 pb-1.5 border-b ${C.borderPanel}`}>
                                <ListTodo className="w-3.5 h-3.5" style={{ color: activeTheme.color }} />
                                <h3 className={`text-[12px] font-bold ${C.textPrimary}`}>待办事项</h3>
                              </div>
                              <ul className={`space-y-2.5 text-[11px] ${C.textSecondary}`}>
                                <li className="flex justify-between items-center"><span>新建下一条</span> <div><Kbd>↵</Kbd></div></li>
                                <li className="flex justify-between items-center"><span>完成 ToDo</span> <div><Kbd>⇧</Kbd><Kbd>↵</Kbd></div></li>
                                <li className="flex justify-between items-center"><span>移到明天</span> <div><Kbd>Tab</Kbd></div></li>
                                <li className="flex justify-between items-center"><span>移到昨天</span> <div><Kbd>⇧</Kbd><Kbd>Tab</Kbd></div></li>
                                <li className="flex justify-between items-center"><span>删除空行</span> <div><Kbd>⌫</Kbd></div></li>
                              </ul>
                            </section>

                            <section>
                              <div className={`flex items-center gap-1.5 mb-3 pb-1.5 border-b ${C.borderPanel}`}>
                                <div className="flex items-center gap-0.5">
                                  {['年','月','日'].map((label, i) => (
                                    <span key={i} className="rounded-full px-1.5 py-0.5 text-[8px] font-semibold" style={{ backgroundColor: i === 0 ? activeTheme.tint : 'transparent', color: activeTheme.color, border: `1px solid ${i === 0 ? 'transparent' : activeTheme.color}`, opacity: i === 0 ? 1 : 0.45 }}>{label}</span>
                                  ))}
                                </div>
                                <h3 className={`text-[12px] font-bold ${C.textPrimary}`}>视图切换</h3>
                              </div>
                              <ul className={`space-y-2.5 text-[11px] ${C.textSecondary}`}>
                                <li className="flex justify-between items-center"><span>切换视图</span> <span className={C.textMuted}>右下角 年/月/待办 按钮</span></li>
                              </ul>
                            </section>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 甘特图引擎
// ==========================================
const GanttView = ({ rows, setRows, updateSegment, activeTool, setActiveTool, paintColor, onCut, onAdd, onDelete, timelineOffset, setTimelineOffset, currentTimelinePos, hoveredSegRef, commitHistory, density, onDensityChange, showFieldNames, showStatusText, showRemarks, ganttTitleFontSize, timelineFontSize, segmentLabelFontSize, activeTheme, colorMode }) => {
  const trackRef = useRef(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const isWideMode = density === 'wide';
  const isNarrowMode = density === 'narrow';
  const isLight = colorMode === 'light';
  const GC = {
    headerBorder: isLight ? 'border-black/15' : 'border-white/20',
    titleText: isLight ? 'text-gray-700' : 'text-white/70',
    monthHeaderBg: '',
    headerPillStyle: isLight ? { backgroundColor: hexToLightBg(activeTheme.color, 0.30, 0.9) } : { backgroundColor: hexToDarkBg(activeTheme.color, 0.25, 0.8) },
    monthLabelText: isLight ? 'text-gray-600' : 'text-white/70',
    rowBorder: isLight ? 'border-black/8' : 'border-white/10',
    rowTitle: isLight ? 'text-gray-700' : 'text-white/60',
    segBorder: isLight ? 'border-black/5' : 'border-white/5',
    barHover: isLight ? 'hover:outline-black/20' : 'hover:outline-white/30',
  };
  const handleBlankCanvasPointerDown = useCallback((e) => {
    if (activeTool !== 'cut') return;
    const interactive = e.target.closest('[data-seg-id], input, textarea, button, [data-popup-panel], [data-hud-root]');
    if (interactive) return;
    setActiveTool("pointer");
  }, [activeTool, setActiveTool]);

  const visibleMonths = useMemo(() => {
    const startMonthInt = Math.floor(timelineOffset);
    return Array.from({ length: 14 }).map((_, i) => {
      const totalMonths = startMonthInt + i - 1;
      const y = baseYear + Math.floor(totalMonths / 12);
      const m = (totalMonths % 12 + 12) % 12;
      const leftPct = ((totalMonths - timelineOffset) / 12) * 100;
      return { year: y, month: m + 1, label: `${m + 1}月`, index: totalMonths, leftPct };
    });
  }, [timelineOffset]);

  const yearSpans = useMemo(() => {
    const blocks = [];
    let currentYear = null;
    let startPct = 0;
    visibleMonths.forEach((m, i) => {
      if (m.year !== currentYear) {
        if (currentYear !== null) blocks.push({ year: currentYear, startPct, endPct: m.leftPct });
        currentYear = m.year;
        startPct = m.leftPct;
      }
      if (i === visibleMonths.length - 1) {
        blocks.push({ year: currentYear, startPct, endPct: m.leftPct + (1 / 12) * 100 });
      }
    });
    return blocks;
  }, [visibleMonths]);

  const todayLeftPercent = ((currentTimelinePos - timelineOffset) / 12) * 100;
  const rowHeight = isWideMode ? ROW_HEIGHT_WIDE : (isNarrowMode ? ROW_HEIGHT_COMPACT : ROW_HEIGHT_NARROW);

  const handleHeaderPointerDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const initialOffset = timelineOffset;
    const trackWidth = trackRef.current.getBoundingClientRect().width;
    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const deltaMonths = -(dx / trackWidth) * 12;
      let targetOffset = initialOffset + deltaMonths;
      const snappedOffset = Math.round(targetOffset);
      if (Math.abs(targetOffset - snappedOffset) < 0.2) targetOffset = snappedOffset;
      setTimelineOffset(targetOffset);
    };
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleBarPointerDown = (e, row, seg) => {
    e.stopPropagation();
    if (e.target.tagName.toLowerCase() === 'input') return;

    if (activeTool === 'cut') {
      if (e.button === 0 && trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        onCut(row.id, seg.id, timelineOffset + (x / rect.width) * 12);
      }
      return;
    }
    if (activeTool === 'paint') {
      if (e.button === 0) { commitHistory(); updateSegment(row.id, seg.id, { color: hexToRgba(paintColor, 0.4) }); }
      return;
    }
    if (e.button !== 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftEdge = x < 12;
    const isRightEdge = x > rect.width - 12;
    let action = 'move';
    if (isLeftEdge) action = 'start';
    if (isRightEdge) action = 'end';
    commitHistory();

    const startX = e.clientX;
    const initialStart = seg.start;
    const initialEnd = seg.end;
    const sortedSegs = [...row.segments].sort((a, b) => a.start - b.start);
    const segIdx = sortedSegs.findIndex(s => s.id === seg.id);
    const prevSeg = segIdx > 0 ? sortedSegs[segIdx - 1] : null;
    const nextSeg = segIdx < sortedSegs.length - 1 ? sortedSegs[segIdx + 1] : null;
    const minBound = prevSeg ? prevSeg.end : -100;
    const maxBound = nextSeg ? nextSeg.start : 100;
    const SNAP = 0.15;

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const monthWidth = trackRef.current.getBoundingClientRect().width / 12;
      const timeDelta = dx / monthWidth;
      let tS = initialStart, tE = initialEnd;
      const dur = initialEnd - initialStart;
      if (action === 'move') {
        tS += timeDelta; tE += timeDelta;
        const sS = Math.round(tS), sE = Math.round(tE);
        if (Math.abs(tS - sS) < SNAP) { tS = sS; tE = tS + dur; }
        else if (Math.abs(tE - sE) < SNAP) { tE = sE; tS = tE - dur; }
        if (tS < minBound) { tS = minBound; tE = tS + dur; }
        if (tE > maxBound) { tE = maxBound; tS = tE - dur; }
      } else if (action === 'start') {
        tS += timeDelta;
        const sS = Math.round(tS);
        if (Math.abs(tS - sS) < SNAP) tS = sS;
        if (tS < minBound) tS = minBound;
        if (tS > tE - 0.2) tS = tE - 0.2;
      } else if (action === 'end') {
        tE += timeDelta;
        const sE = Math.round(tE);
        if (Math.abs(tE - sE) < SNAP) tE = sE;
        if (tE > maxBound) tE = maxBound;
        if (tE < tS + 0.2) tE = tS + 0.2;
      }
      // Only clear acknowledgment when dragging the bar rightward (delaying the task)
      const movingRight = timeDelta > 0 && (action === 'move' || action === 'end');
      updateSegment(row.id, seg.id, { start: tS, end: tE, ...(movingRight && { isAcknowledged: false }) });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <div data-gantt-canvas className="w-full flex flex-col relative" style={{ cursor: activeTool === 'cut' ? 'crosshair' : activeTool === 'paint' ? PAINT_BUCKET_CURSOR : 'default' }} onPointerDownCapture={handleBlankCanvasPointerDown}>
      <div
        className={`flex gap-4 mb-0.5 border-b pb-0.5 relative z-20 cursor-move group/header ${GC.headerBorder}`}
        onPointerDown={handleHeaderPointerDown}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <div className="w-[140px] shrink-0 flex flex-col">
          <div className="h-[18px] flex items-center gap-0.5">
            {isHeaderHovered && onDensityChange && (
              <>
                <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDensityChange('narrow'); }} className={`h-full min-w-[28px] px-1.5 rounded-[4px] text-[10px] font-semibold transition-all ${density === 'narrow' ? (isLight ? activeTheme.lightHighlight : activeTheme.highlight) : `bg-black/5 ${GC.monthLabelText} hover:bg-black/10`}`}>0.5x</button>
                <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDensityChange('normal'); }} className={`h-full min-w-[24px] px-1.5 rounded-[4px] text-[10px] font-semibold transition-all ${density === 'normal' ? (isLight ? activeTheme.lightHighlight : activeTheme.highlight) : `bg-black/5 ${GC.monthLabelText} hover:bg-black/10`}`}>1x</button>
                <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDensityChange('wide'); }} className={`h-full min-w-[24px] px-1.5 rounded-[4px] text-[10px] font-semibold transition-all ${density === 'wide' ? (isLight ? activeTheme.lightHighlight : activeTheme.highlight) : `bg-black/5 ${GC.monthLabelText} hover:bg-black/10`}`}>2x</button>
              </>
            )}
          </div>
          <div className="h-[20px] flex items-end">
            <span className={`uppercase tracking-wider pointer-events-none ${GC.monthLabelText} opacity-50`} style={{ fontSize: `${timelineFontSize}px` }}>时间轴</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col relative" ref={trackRef}>
          <div className="relative w-full overflow-hidden h-[18px]">
            <div className="flex w-full overflow-hidden h-[18px]">
              {yearSpans.map((span, i) => {
                const left = Math.max(0, span.startPct);
                const right = Math.min(100, span.endPct);
                const width = right - left;
                if (width <= 0) return null;
                return (
                  <div key={i} className="absolute top-0 bottom-0 p-[1px] border-l border-white/5" style={{ left: `${left}%`, width: `${width}%` }}>
                    <div className={`${GC.monthHeaderBg} w-full h-full rounded-[4px] flex items-center px-2 overflow-hidden`} style={GC.headerPillStyle}>
                      <span className={`font-black whitespace-nowrap ${GC.monthLabelText}`} style={{ fontSize: `${timelineFontSize}px` }}>{span.year}年</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative w-full h-[20px] flex items-center overflow-hidden pointer-events-none">
            {visibleMonths.map((m) => (
              <div key={m.index} className={`absolute font-bold pl-1 ${GC.monthLabelText}`} style={{ left: `${m.leftPct}%`, fontSize: `${timelineFontSize}px` }}>{m.label}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full relative flex flex-col">
        <div className="absolute top-0 bottom-0 left-0 pointer-events-none z-10" style={{
          right: '-24px',
          maskImage: 'linear-gradient(to right, transparent 0px, transparent 140px, black 156px, black calc(100% - 24px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0px, transparent 140px, black 156px, black calc(100% - 24px), transparent 100%)'
        }}>
          <div className="absolute -top-[30px] -bottom-[30px] left-[156px] pointer-events-none overflow-visible" style={{ right: '24px' }}>
            {rows.map((row, rowIdx) => (
              <motion.div
                key={row.id}
                layout
                transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute left-0 right-0 pointer-events-none"
                style={{ height: `${rowHeight}px`, top: `${30 + rowIdx * rowHeight}px` }}
              >
                {row.segments.map(seg => {
                  const leftPercent = ((seg.start - timelineOffset) / 12) * 100;
                  const widthPercent = ((seg.end - seg.start) / 12) * 100;
                  if (leftPercent + widthPercent <= -100 || leftPercent >= 100) return null;
                  return (
                    <SegmentBar key={seg.id} row={row} seg={seg} leftPercent={leftPercent} widthPercent={widthPercent}
                      activeTool={activeTool} paintColor={paintColor} hoveredSegRef={hoveredSegRef}
                      onPointerDown={(e) => handleBarPointerDown(e, row, seg)}
                      updateSegment={updateSegment} commitHistory={commitHistory} isWideMode={isWideMode} isNarrowMode={isNarrowMode} rowHeight={rowHeight} showFieldNames={showFieldNames} showStatusText={showStatusText} showRemarks={showRemarks} segmentLabelFontSize={segmentLabelFontSize} activeTheme={activeTheme} isLight={isLight} />
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>

        {rows.map(row => (
          <motion.div
            key={row.id}
            layout
            transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`flex gap-4 items-stretch group/row relative border-b transition-colors duration-300 box-border ${isLight ? 'border-black/5 hover:bg-black/[0.02]' : 'border-white/5 hover:bg-white/[0.02]'}`}
            style={{ height: `${rowHeight}px` }}
          >
            <div className="w-[140px] shrink-0 pl-1 pr-2 flex items-center justify-between group/rowtitle relative z-20">
              {isNarrowMode ? (
                <input
                  type="text"
                  value={row.title}
                  onFocus={() => commitHistory()}
                  onChange={(e) => setRows(prev => prev.map(r => r.id === row.id ? { ...r, title: e.target.value } : r))}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                  className={`flex-1 min-w-0 w-0 bg-transparent font-bold focus:outline-none m-0 pointer-events-auto ${isLight ? 'text-gray-700 focus:text-gray-900' : 'text-white/80 focus:text-white'}`}
                  style={{ padding: 0, fontSize: `${Math.max(8, ganttTitleFontSize - 1)}px`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                />
              ) : (
                <textarea value={row.title} onFocus={() => commitHistory()}
                  onChange={(e) => {
                    const newVal = e.target.value.replace(/\n/g, '');
                    const el = e.target;
                    const saved = el.value;
                    el.value = newVal;
                    const overflows = el.scrollHeight > el.clientHeight + 2;
                    el.value = saved;
                    if (!overflows) {
                      setRows(prev => prev.map(r => r.id === row.id ? { ...r, title: newVal } : r));
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                  className={`flex-1 min-w-0 bg-transparent font-bold focus:outline-none transition-all m-0 pointer-events-auto ${isLight ? 'text-gray-700 focus:text-gray-900' : 'text-white/80 focus:text-white'}`}
                  style={{ resize: 'none', overflow: 'hidden', lineHeight: `${Math.round(ganttTitleFontSize * 1.25)}px`, fieldSizing: 'content', maxHeight: `${Math.round(ganttTitleFontSize * 2.4)}px`, wordBreak: 'break-all', padding: 0, fontSize: `${ganttTitleFontSize}px` }} />
              )}
              {row.segments.some(s => s.isAcknowledged) && (
                <Flag className="w-3.5 h-3.5 shrink-0 text-rose-500 fill-rose-500 pointer-events-none" />
              )}
              <button onClick={() => onDelete(row.id)} className={`opacity-0 group-hover/rowtitle:opacity-100 shrink-0 transition-opacity p-1 pointer-events-auto hover:text-rose-400 ${isLight ? 'text-gray-400' : 'text-white/30'}`} title="删除任务">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 relative h-full pointer-events-none overflow-hidden">
              {visibleMonths.map((m) => (
                <div key={m.index} className={`absolute top-0 bottom-0 border-l ${isLight ? 'border-black/5' : 'border-white/5'}`} style={{ left: `${m.leftPct}%` }} />
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div layout transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="flex items-center relative z-10 opacity-30 hover:opacity-100 transition-opacity mt-1" style={{ height: rowHeight / 2 }}>
          <div className="w-[140px] shrink-0 pl-1">
            <button onClick={onAdd} className={`flex items-center justify-center p-0 ${isLight ? 'text-gray-500' : 'text-white'}`} title="增加行">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        <motion.div layout transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="absolute top-0 bottom-0 left-[156px] right-0 pointer-events-none z-[100] overflow-visible">
          {todayLeftPercent >= 0 && todayLeftPercent <= 100 && (
            <div className={`absolute top-0 bottom-0 w-[1px] ${activeTheme.todayLine}`} style={{ left: `${todayLeftPercent}%` }}>
              <div className={`absolute top-0 left-[0.5px] -translate-x-1/2 w-0 h-0 border-x-[3.5px] border-x-transparent border-t-[5px] ${activeTheme.todayArrow}`} />
            </div>
          )}
          {todayLeftPercent < 0 && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 z-[101] cursor-pointer pointer-events-auto hover:opacity-100 animate-blink-soft"
              onClick={() => setTimelineOffset(0)}
              title="回到今天"
            >
              <div className="w-0 h-0 border-y-[8px] border-y-transparent border-r-[10px]" style={{ borderRightColor: activeTheme.todayColor }} />
            </div>
          )}
          {todayLeftPercent > 100 && (
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 z-[101] cursor-pointer pointer-events-auto hover:opacity-100 animate-blink-soft"
              onClick={() => setTimelineOffset(0)}
              title="回到今天"
            >
              <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[10px]" style={{ borderLeftColor: activeTheme.todayColor }} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// ==========================================
// Segment Bar
// ==========================================
const SegmentBar = ({ row, seg, leftPercent, widthPercent, activeTool, paintColor, hoveredSegRef, onPointerDown, updateSegment, commitHistory, isWideMode, isNarrowMode, rowHeight, showFieldNames, showStatusText, showRemarks, segmentLabelFontSize, activeTheme, isLight }) => {
  const [localHoverX, setLocalHoverX] = useState(null);
  const [isHoveringBar, setIsHoveringBar] = useState(false);
  const [isHoveringName, setIsHoveringName] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const nameInputRef = useRef(null);
  const hoverShowsStatus = isHoveringBar && !isHoveringName && !isNameFocused;
  const displayedText = getHoverTextValue({
    showFieldNames,
    showStatusText,
    hoverShowsStatus,
    name: seg.name,
    status: getProgressText(Math.round(seg.progress)),
  });
  const showingNameInput = isEditing;

  useEffect(() => {
    if (isEditing && nameInputRef.current) nameInputRef.current.focus();
  }, [isEditing]);

  const adjustAlpha = (color, alpha) => color.replace(/[\d.]+\)$/, `${alpha})`);
  const barBgColor = seg.isAcknowledged ? 'rgba(16, 185, 129, 0.05)' : (isLight ? adjustAlpha(seg.color, 0.18) : seg.color);
  const progressFillColor = seg.isAcknowledged ? 'rgba(16, 185, 129, 0.5)' : (seg.progressColor || hexToRgba(activeTheme.color, isLight ? 1.0 : 0.6));


  return (
    <div
      data-row-id={row.id} data-seg-id={seg.id}
      className="absolute top-0 bottom-0 pointer-events-auto flex group group/seg"
      style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
      onPointerDown={onPointerDown}
      onMouseEnter={() => { hoveredSegRef.current = { rowId: row.id, segId: seg.id }; setIsHoveringBar(true); }}
      onMouseLeave={() => { hoveredSegRef.current = null; setLocalHoverX(null); setIsHoveringBar(false); setIsHoveringName(false); }}
      onPointerMove={(e) => { if (activeTool === 'cut') { const rect = e.currentTarget.getBoundingClientRect(); setLocalHoverX(e.clientX - rect.left); } }}
    >
      <div className={`absolute inset-0 transition-colors duration-300 rounded-[4px] overflow-hidden border border-white/5 ${activeTool === 'pointer' ? 'hover:outline hover:outline-1 hover:outline-white/30 z-20 hover:z-30' : ''}`} style={{ backgroundColor: barBgColor }}>
        <div
          className="h-full relative transition-all flex items-center justify-center"
          style={{ width: `${seg.progress}%`, backgroundColor: progressFillColor, transitionDuration: '100ms', cursor: activeTool === 'paint' ? PAINT_BUCKET_CURSOR : undefined }}
          onPointerDown={activeTool === 'paint' && seg.progress > 0 ? (e) => { e.stopPropagation(); commitHistory(); updateSegment(row.id, seg.id, { progressColor: hexToRgba(paintColor, 0.6) }); } : undefined}
        />
      </div>

      {seg.progress === 100 && !seg.isAcknowledged && activeTool !== 'paint' && (
        <LongPressAck
          onConfirm={() => { commitHistory(); updateSegment(row.id, seg.id, { isAcknowledged: true }); }}
          holdDuration={2000}
          themeColor={activeTheme.color}
          isLight={isLight}
        />
      )}

      {activeTool === 'cut' && localHoverX !== null && (
        <div className="absolute top-0 bottom-0 w-[1px] bg-rose-500 z-50 pointer-events-none" style={{ left: localHoverX }}>
          <Scissors className="w-3 h-3 text-rose-500 absolute -top-3 -translate-x-1/2 rotate-90" />
        </div>
      )}

      {/* 标题 + 状态文字 */}
      {showingNameInput ? (
        <div className="pointer-events-auto"
          style={{ position: 'absolute', left: isNarrowMode ? 4 : 8, top: isWideMode ? 4 : 0, bottom: isWideMode ? 'auto' : 0, display: 'flex', alignItems: 'center', zIndex: 30 }}
          onMouseEnter={() => setIsHoveringName(true)} onMouseLeave={() => setIsHoveringName(false)}>
          <input ref={nameInputRef} type="text" value={seg.name}
            onFocus={() => { commitHistory(); setIsNameFocused(true); }}
            onBlur={() => { setIsNameFocused(false); setIsEditing(false); }}
            onChange={(e) => updateSegment(row.id, seg.id, { name: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className="bg-transparent font-black text-white focus:outline-none pointer-events-auto"
            style={{ width: `${Math.max(2, getVisualLength(seg.name) + 0.5)}ch`, fontSize: `${segmentLabelFontSize}px`, padding: 0, margin: 0, lineHeight: isWideMode ? `${rowHeight}px` : 'normal', height: isWideMode ? 'auto' : 'auto', caretColor: isLight ? '#000' : '#fff' }} />
        </div>
      ) : displayedText ? (
        <div
          className="cursor-text pointer-events-auto"
          style={{ position: 'absolute', left: isNarrowMode ? 4 : 8, top: isWideMode ? 4 : 0, zIndex: 30 }}
          onMouseEnter={() => setIsHoveringName(true)}
          onMouseLeave={() => setIsHoveringName(false)}
          onClick={(e) => { e.stopPropagation(); commitHistory(); setIsEditing(true); }}
        >
          <span className="font-black text-white whitespace-nowrap" style={{ fontSize: `${segmentLabelFontSize}px`, lineHeight: `${rowHeight}px`, display: 'block' }}>
            {displayedText}
          </span>
        </div>
      ) : null}

      {/* 宽模式备注：居中偏下 */}
      {isWideMode && showRemarks && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[6px] z-30 pointer-events-auto cursor-text">
          <input type="text" value={seg.remark || ''} onFocus={() => commitHistory()}
            onChange={(e) => updateSegment(row.id, seg.id, { remark: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            placeholder={isHoveringBar ? "点击添加备注..." : ""}
            className={`bg-transparent text-white/70 font-normal text-center focus:outline-none p-0 m-0 leading-none h-auto pointer-events-auto transition-all ${!seg.remark && !isHoveringBar ? 'opacity-0' : 'opacity-100 placeholder:text-white/30'}`}
            style={{ width: `${Math.max(12, getVisualLength(seg.remark || '') + 1)}ch`, fontSize: `${Math.max(8, segmentLabelFontSize - 1)}px` }} />
        </div>
      )}

      {activeTool === 'pointer' && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/30 z-30" />
          <div className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/30 z-30" />
        </>
      )}
    </div>
  );
};

// ==========================================
// 月度甘特图
// ==========================================
const ROW_HEIGHT_MONTHLY = 32;
const ROW_HEIGHT_MONTHLY_NARROW = 16;
const ROW_HEIGHT_MONTHLY_WIDE = 80;
const getMonthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;
const monthSpansYear = (year, month, rows) => {
  const monthStart = (year - baseYear) * 12 + (month - 1);
  const monthEnd = monthStart + 1;
  return rows.filter(row => row.segments.some(seg => seg.start < monthEnd && seg.end > monthStart));
};

const rowsForMonth = (year, month, rows) => {
  return monthSpansYear(year, month, rows);
};

const getRowBackgroundDays = (row, year, month) => {
  const monthStart = (year - baseYear) * 12 + (month - 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const minStart = Math.min(...row.segments.map(s => s.start));
  const maxEnd = Math.max(...row.segments.map(s => s.end));
  const startDay = 1 + (minStart - monthStart) * daysInMonth;
  const endDay = (maxEnd - monthStart) * daysInMonth;
  return { startDay, endDay };
};

const MonthlyBarInput = ({ task, rowId, isGrouped, updateTask, prog, isAck, showFieldNames, showStatusText, segmentLabelFontSize, isBarHovered, isWideMode, showRemarks, commitHistory, stickyLeftPct, isLight }) => {
  const [editing, setEditing] = useState(false);
  const [isTextHovered, setIsTextHovered] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);
  const hoverShowsStatus = isBarHovered && !isTextHovered;
  const displayedText = getHoverTextValue({
    showFieldNames,
    showStatusText,
    hoverShowsStatus,
    name: task.name || '新任务',
    status: getProgressText(Math.round(prog)),
  });
  const textLeft = stickyLeftPct > 0 ? `calc(${stickyLeftPct}% + 4px)` : '4px';
  if (editing) {
    return (
      <div className={`absolute z-30 pointer-events-auto ${isWideMode ? 'top-[4px]' : 'top-0 bottom-0 flex items-center'}`} style={{ minWidth: 60, left: textLeft }}>
        <input ref={inputRef} type="text" value={task.name || ''}
          onFocus={() => commitHistory?.()}
          onBlur={() => setEditing(false)}
          onChange={e => updateTask(rowId, task.id, { name: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
          className="bg-transparent px-1 text-white font-black focus:outline-none w-full"
          style={{ fontSize: `${segmentLabelFontSize}px`, width: `${Math.max(2, getVisualLength(task.name || '') + 0.5)}ch`, caretColor: isLight ? '#000' : '#fff' }}
          onClick={e => e.stopPropagation()} />
      </div>
    );
  }
  return (
    <>
      {/* 阶段名/状态文字：与年度一致，2x 左上角 */}
      <div
        className={`absolute z-20 pointer-events-auto cursor-text ${isWideMode ? 'top-[4px]' : 'top-0 bottom-0 flex items-center'}`}
        style={{ minWidth: 40, left: textLeft }}
        onMouseEnter={() => setIsTextHovered(true)}
        onMouseLeave={() => setIsTextHovered(false)}
        onClick={e => {
          e.stopPropagation();
          if (prog === 100 && !isAck) return;
          commitHistory?.();
          setEditing(true);
        }}
      >
        {displayedText ? (
          <span className="font-black text-white leading-none whitespace-nowrap truncate max-w-[120px]" style={{ fontSize: `${segmentLabelFontSize}px` }}>
            {displayedText}
          </span>
        ) : null}
      </div>
      {/* 2x 时底部备注：与年度一致 */}
      {isWideMode && showRemarks && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[6px] z-30 pointer-events-auto cursor-text">
          <input
            type="text"
            value={task.remark || ''}
            onFocus={() => commitHistory?.()}
            onChange={e => updateTask(rowId, task.id, { remark: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
            placeholder={isBarHovered ? "点击添加备注..." : ""}
            className={`bg-transparent text-white/70 font-normal text-center focus:outline-none p-0 m-0 leading-none h-auto pointer-events-auto transition-all ${!task.remark && !isBarHovered ? 'opacity-0' : 'opacity-100 placeholder:text-white/30'}`}
            style={{ width: `${Math.max(12, getVisualLength(task.remark || '') + 1)}ch`, fontSize: `${Math.max(8, segmentLabelFontSize - 1)}px` }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

const MonthlyGanttView = ({ rows, setRows, monthlyData, setMonthlyData, monthlyOffset, setMonthlyOffset, monthlyDayOffset, setMonthlyDayOffset, now, baseYear, sortMode, activeTool, setActiveTool, paintColor, hoveredMonthlyTaskRef, commitHistory, density, onDensityChange, showFieldNames, showStatusText, showRemarks, ganttTitleFontSize, timelineFontSize, segmentLabelFontSize, activeTheme, colorMode }) => {
  const trackRef = useRef(null);
  const [hoveredMonthlyBar, setHoveredMonthlyBar] = useState(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const isWideMode = density === 'wide';
  const isNarrowMode = density === 'narrow';
  const isLight = colorMode === 'light';
  const MC = {
    headerBorder: isLight ? 'border-black/15' : 'border-white/20',
    monthHeaderBg: '',
    headerPillStyle: isLight ? { backgroundColor: hexToLightBg(activeTheme.color, 0.30, 0.9) } : { backgroundColor: hexToDarkBg(activeTheme.color, 0.25, 0.8) },
    labelText: isLight ? 'text-gray-600' : 'text-white/70',
    dayText: isLight ? 'text-gray-500' : 'text-white/50',
    rowBorder: isLight ? 'border-black/5' : 'border-white/5',
    rowHover: isLight ? 'hover:bg-black/[0.02]' : 'hover:bg-white/[0.02]',
  };
  const MONTHLY_TRACK_DAYS = 31;
  const handleBlankCanvasPointerDown = useCallback((e) => {
    if (activeTool !== 'cut') return;
    const interactive = e.target.closest('[data-monthly-task], input, textarea, button, [data-popup-panel], [data-hud-root]');
    if (interactive) return;
    setActiveTool("pointer");
  }, [activeTool, setActiveTool]);

  // 以 (anchorYear, anchorMonth) 的 1 号为 dayIndex 0；dayIndex 可为负或超过当月天数
  const dayIndexToCalendar = (anchorYear, anchorMonth, dayIndex) => {
    const d = new Date(anchorYear, anchorMonth - 1, 1 + dayIndex);
    return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
  };

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const totalMonths = (year - baseYear) * 12 + (month - 1) + monthlyOffset;
  const displayYear = baseYear + Math.floor(totalMonths / 12);
  const displayMonth = ((totalMonths % 12) + 12) % 12 + 1;
  const monthKey = getMonthKey(displayYear, displayMonth);
  const daysInMonth = new Date(displayYear, displayMonth, 0).getDate();
  const spanRows = useMemo(() => {
    const viewStartDayIndex = Math.floor(monthlyDayOffset);
    const viewEndDayIndex = viewStartDayIndex + MONTHLY_TRACK_DAYS;
    const viewStartDate = new Date(displayYear, displayMonth - 1, 1 + viewStartDayIndex);
    const viewEndDate = new Date(displayYear, displayMonth - 1, 1 + viewEndDayIndex);
    const viewStartMonths = (viewStartDate.getFullYear() - baseYear) * 12 + viewStartDate.getMonth();
    const viewEndMonths = (viewEndDate.getFullYear() - baseYear) * 12 + viewEndDate.getMonth() + 1;

    return rows.filter(row => {
      if (!row.segments.some(seg => seg.start < viewEndMonths && seg.end > viewStartMonths)) return false;
      const bgDays = getRowBackgroundDays(row, displayYear, displayMonth);
      if (!bgDays) return false;
      const barStartDayIdx = bgDays.startDay - 1;
      const barEndDayIdx = bgDays.startDay - 1 + (bgDays.endDay - bgDays.startDay + 1);
      return barStartDayIdx < viewEndDayIndex && barEndDayIdx > viewStartDayIndex;
    });
  }, [displayYear, displayMonth, monthlyDayOffset, rows]);

  const visibleMonthKeys = useMemo(() => {
    const startIdx = Math.floor(monthlyDayOffset);
    const endIdx = startIdx + MONTHLY_TRACK_DAYS;
    const startDate = new Date(displayYear, displayMonth - 1, 1 + startIdx);
    const endDate = new Date(displayYear, displayMonth - 1, 1 + endIdx);
    const keys = [];
    let d = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
    const endBound = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);
    while (d <= endBound) {
      keys.push({ key: getMonthKey(d.getFullYear(), d.getMonth() + 1), year: d.getFullYear(), month: d.getMonth() + 1 });
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
    return keys;
  }, [displayYear, displayMonth, monthlyDayOffset]);

  const taskDayIndexFromAnchor = useCallback((taskDay, taskYear, taskMonth) => {
    const anchorDate = new Date(displayYear, displayMonth - 1, 1);
    const taskDate = new Date(taskYear, taskMonth - 1, 1);
    const monthDiffDays = (taskDate - anchorDate) / (24 * 60 * 60 * 1000);
    return monthDiffDays + (taskDay - 1);
  }, [displayYear, displayMonth]);

  const ensureGroups = () => {
    const groups = {};
    spanRows.forEach(r => {
      groups[r.id] = { title: r.title, tasks: [] };
      visibleMonthKeys.forEach(mk => {
        const mData = monthlyData[mk.key] || { groups: {} };
        const g = mData.groups[r.id];
        if (g && g.tasks?.length) {
          g.tasks.forEach(t => groups[r.id].tasks.push({ ...t, _year: mk.year, _month: mk.month }));
        }
      });
      if (groups[r.id].tasks.length === 0) groups[r.id].tasks = [];
    });
    return groups;
  };
  const groups = ensureGroups();
  const ungroupedTasks = useMemo(() => {
    const list = visibleMonthKeys.flatMap(mk => {
      const mData = monthlyData[mk.key] || { ungroupedTasks: [] };
      return (mData.ungroupedTasks || []).map(t => ({ ...t, _year: mk.year, _month: mk.month }));
    });
    return sortMode === 'time' ? [...list].sort((a, b) => {
      const aIdx = taskDayIndexFromAnchor(a.start, a._year, a._month);
      const bIdx = taskDayIndexFromAnchor(b.start, b._year, b._month);
      return aIdx - bIdx;
    }) : list;
  }, [visibleMonthKeys, monthlyData, sortMode, taskDayIndexFromAnchor]);

  const visibleDays = useMemo(() => {
    const start = Math.floor(monthlyDayOffset);
    return Array.from({ length: MONTHLY_TRACK_DAYS }).map((_, i) => {
      const dayIndex = start + i;
      const cal = dayIndexToCalendar(displayYear, displayMonth, dayIndex);
      const leftPct = ((dayIndex - monthlyDayOffset) / MONTHLY_TRACK_DAYS) * 100;
      return { dayIndex, day: cal.d, label: String(cal.d), leftPct, y: cal.y, m: cal.m };
    });
  }, [displayYear, displayMonth, monthlyDayOffset]);

  const monthSpans = useMemo(() => {
    const blocks = [];
    let currentMonthKey = null;
    let startPct = 0;
    visibleDays.forEach((v, i) => {
      const key = `${v.y}-${v.m}`;
      if (key !== currentMonthKey) {
        if (currentMonthKey !== null) blocks.push({ year: visibleDays[i - 1].y, month: visibleDays[i - 1].m, startPct, endPct: v.leftPct });
        currentMonthKey = key;
        startPct = v.leftPct;
      }
      if (i === visibleDays.length - 1) {
        blocks.push({ year: v.y, month: v.m, startPct, endPct: v.leftPct + (1 / MONTHLY_TRACK_DAYS) * 100 });
      }
    });
    return blocks;
  }, [visibleDays]);

  const updateMonthData = (updater, targetMonthKey) => {
    const key = targetMonthKey ?? monthKey;
    setMonthlyData(prev => {
      const cur = prev[key] || { groups: {}, ungroupedTasks: [] };
      const next = updater(cur);
      return { ...prev, [key]: next };
    });
  };

  const todayDay = now.getFullYear() === displayYear && now.getMonth() + 1 === displayMonth ? now.getDate() : null;
  const todayMonthKey = getMonthKey(now.getFullYear(), now.getMonth() + 1);
  const todayDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const addSubTask = (annualRowId) => {
    const row = spanRows.find(r => r.id === annualRowId);
    const hourFrac = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
    const startDay = now.getDate() + hourFrac;
    const endDay = Math.min(todayDaysInMonth + 1, startDay + 6);
    updateMonthData(d => {
      const g = d.groups[annualRowId] || { title: row?.title || '', tasks: [] };
      const tasks = [...g.tasks, { id: Date.now().toString(), name: '新任务', start: startDay, end: endDay, color: DEFAULT_BAR_COLOR }];
      return { ...d, groups: { ...d.groups, [annualRowId]: { ...g, tasks } } };
    }, todayMonthKey);
  };
  const addUngroupedTask = () => {
    const hourFrac = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
    const startDay = now.getDate() + hourFrac;
    const endDay = Math.min(todayDaysInMonth + 1, startDay + 6);
    updateMonthData(d => ({
      ...d,
      ungroupedTasks: [...(d.ungroupedTasks || []), { id: Date.now().toString(), name: '其他任务', start: startDay, end: endDay, color: DEFAULT_BAR_COLOR }]
    }), todayMonthKey);
  };
  const updateTask = (groupId, taskId, updates, taskMonthKey) => {
    const targetKey = taskMonthKey ?? monthKey;
    if (groupId) {
      updateMonthData(d => {
        const g = d.groups[groupId];
        if (!g) return d;
        const tasks = g.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        return { ...d, groups: { ...d.groups, [groupId]: { ...g, tasks } } };
      }, targetKey);
    } else {
      updateMonthData(d => ({
        ...d,
        ungroupedTasks: (d.ungroupedTasks || []).map(t => t.id === taskId ? { ...t, ...updates } : t)
      }), targetKey);
    }
  };
  const deleteTask = (groupId, taskId, taskMonthKey) => {
    const targetKey = taskMonthKey ?? monthKey;
    if (groupId) {
      updateMonthData(d => {
        const g = d.groups[groupId];
        if (!g) return d;
        const tasks = g.tasks.filter(t => t.id !== taskId);
        return { ...d, groups: { ...d.groups, [groupId]: { ...g, tasks } } };
      }, targetKey);
    } else {
      updateMonthData(d => ({ ...d, ungroupedTasks: (d.ungroupedTasks || []).filter(t => t.id !== taskId) }), targetKey);
    }
  };

  const rowH = isWideMode ? ROW_HEIGHT_MONTHLY_WIDE : (isNarrowMode ? ROW_HEIGHT_MONTHLY_NARROW : ROW_HEIGHT_MONTHLY);
  const effectiveTitleFontSize = isNarrowMode ? Math.max(8, ganttTitleFontSize - 2) : ganttTitleFontSize;

  const handleCutMonthlyTask = useCallback((rowId, taskId, isGrouped, cutDay, taskMonthKey) => {
    const MIN_GAP = 1 / 24;
    if (cutDay <= MIN_GAP || cutDay >= daysInMonth - MIN_GAP) return;
    commitHistory?.();
    const task = isGrouped ? (groups[rowId]?.tasks || []).find(t => t.id === taskId) : ungroupedTasks.find(t => t.id === taskId);
    if (!task || cutDay <= task.start + MIN_GAP || cutDay >= task.end - MIN_GAP) return;
    const targetKey = taskMonthKey ?? (task._year != null ? getMonthKey(task._year, task._month) : monthKey);
    const cutDayRounded = Math.round(cutDay * 24) / 24;
    const newTask = { ...task, id: Date.now().toString(), name: '新任务', start: cutDayRounded, end: task.end, isAcknowledged: false };
    if (isGrouped) {
      updateMonthData(d => {
        const g = d.groups[rowId];
        if (!g) return d;
        const idx = g.tasks.findIndex(t => t.id === taskId);
        if (idx === -1) return d;
        const tasks = [...g.tasks];
        tasks[idx] = { ...task, end: cutDayRounded, isAcknowledged: false };
        tasks.splice(idx + 1, 0, newTask);
        return { ...d, groups: { ...d.groups, [rowId]: { ...g, tasks } } };
      }, targetKey);
    } else {
      updateMonthData(d => {
        const tasks = [...(d.ungroupedTasks || [])];
        const idx = tasks.findIndex(t => t.id === taskId);
        if (idx === -1) return d;
        tasks[idx] = { ...task, end: cutDayRounded, isAcknowledged: false };
        tasks.splice(idx + 1, 0, newTask);
        return { ...d, ungroupedTasks: tasks };
      }, targetKey);
    }
  }, [daysInMonth, updateMonthData, groups, ungroupedTasks, commitHistory, monthKey]);

  const handleMonthlyBarPointerDown = useCallback((e, rowId, task, isGrouped) => {
    e.stopPropagation();
    if (e.target.tagName?.toLowerCase() === 'input') return;
    if (e.button !== 0) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const trackX = e.clientX - rect.left;
    if (activeTool === 'cut') {
      const cutDay = monthlyDayOffset + (trackX / rect.width) * MONTHLY_TRACK_DAYS;
      const taskMonthKey = task._year != null ? getMonthKey(task._year, task._month) : monthKey;
      handleCutMonthlyTask(rowId, task.id, isGrouped, cutDay, taskMonthKey);
      return;
    }
    const barRect = e.currentTarget.getBoundingClientRect();
    const xInBar = e.clientX - barRect.left;
    const isLeftEdge = xInBar < 12;
    const isRightEdge = xInBar > barRect.width - 12;
    let action = 'move';
    if (isLeftEdge) action = 'start';
    if (isRightEdge) action = 'end';

    const startX = e.clientX;
    const initialStart = task.start;
    const initialEnd = task.end;
    const dur = initialEnd - initialStart;
    const SNAP = 1 / 24;
    let lastS = initialStart;
    let lastE = initialEnd;

    const onMove = (moveE) => {
      const dx = moveE.clientX - startX;
      const dayWidth = rect.width / MONTHLY_TRACK_DAYS;
      const timeDelta = dx / dayWidth;
      let tS = initialStart + timeDelta;
      let tE = initialEnd + timeDelta;
      if (action === 'move') {
        tE = tS + dur;
        const sS = Math.round(tS);
        if (Math.abs(tS - sS) < SNAP) { tS = sS; tE = tS + dur; }
        tS = Math.round(tS * 24) / 24;
        tE = Math.round(tE * 24) / 24;
      } else if (action === 'start') {
        tS = initialStart + timeDelta;
        const sS = Math.round(tS);
        if (Math.abs(tS - sS) < SNAP) tS = sS;
        tS = Math.min(initialEnd - SNAP, Math.round(tS * 24) / 24);
        tE = initialEnd;
      } else {
        tE = initialEnd + timeDelta;
        const sE = Math.round(tE);
        if (Math.abs(tE - sE) < SNAP) tE = sE;
        tE = Math.max(initialStart + SNAP, Math.round(tE * 24) / 24);
        tS = initialStart;
      }
      if (tS < tE) {
        lastS = tS;
        lastE = tE;
        const hourFrac = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
        const taskYear = task._year ?? displayYear;
        const taskMonth = task._month ?? displayMonth;
        const tEndAbs = taskDayIndexFromAnchor(tE, taskYear, taskMonth);
        const todayAbs = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(displayYear, displayMonth - 1, 1).getTime()) / (24 * 60 * 60 * 1000)) + hourFrac;
        const pastLine = tEndAbs > todayAbs;
        const patch = { start: tS, end: tE };
        if (pastLine) patch.isAcknowledged = false;
        const taskMonthKey = task._year != null ? getMonthKey(task._year, task._month) : undefined;
        if (isGrouped) updateTask(rowId, task.id, patch, taskMonthKey);
        else updateTask(null, task.id, patch, taskMonthKey);
      }
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);

      const taskYear = task._year ?? displayYear;
      const taskMonth = task._month ?? displayMonth;
      const currentMonthKey = getMonthKey(taskYear, taskMonth);
      const actualStartDate = new Date(taskYear, taskMonth - 1, Math.floor(lastS));
      const newYear = actualStartDate.getFullYear();
      const newMonth = actualStartDate.getMonth() + 1;
      const newMonthKey = getMonthKey(newYear, newMonth);

      if (newMonthKey !== currentMonthKey) {
        const newMonthFirst = new Date(newYear, newMonth - 1, 1);
        const oldMonthFirst = new Date(taskYear, taskMonth - 1, 1);
        const dayShift = (oldMonthFirst - newMonthFirst) / (24 * 60 * 60 * 1000);
        const newStart = lastS + dayShift;
        const newEnd = lastE + dayShift;
        const taskData = { ...task, start: newStart, end: newEnd };
        delete taskData._year;
        delete taskData._month;
        deleteTask(isGrouped ? rowId : null, task.id, currentMonthKey);
        if (isGrouped) {
          const row = spanRows.find(r => r.id === rowId);
          const groupTitle = row?.title ?? '';
          updateMonthData(d => {
            const g = d.groups[rowId] || { title: groupTitle, tasks: [] };
            return { ...d, groups: { ...d.groups, [rowId]: { ...g, tasks: [...g.tasks, taskData] } } };
          }, newMonthKey);
        } else {
          updateMonthData(d => ({
            ...d, ungroupedTasks: [...(d.ungroupedTasks || []), taskData]
          }), newMonthKey);
        }
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [displayYear, displayMonth, spanRows, updateTask, now, taskDayIndexFromAnchor, deleteTask, updateMonthData]);

  const handleHeaderPointerDown = (e) => {
    if (e.target.tagName.toLowerCase() === 'input') return;
    e.preventDefault();
    const target = e.currentTarget;
    const pointerId = e.pointerId;
    target.setPointerCapture?.(pointerId);
    const startX = e.clientX;
    const initialMonthlyOffset = monthlyOffset;
    const initialDayOffset = monthlyDayOffset;
    const trackWidth = trackRef.current?.getBoundingClientRect()?.width || 1;

    const initialAbsDays = (() => {
      const totalMonths = (now.getFullYear() - baseYear) * 12 + now.getMonth() + initialMonthlyOffset;
      const y = baseYear + Math.floor(totalMonths / 12);
      const m = ((totalMonths % 12) + 12) % 12;
      const firstDay = new Date(y, m, 1);
      return firstDay.getTime() / (24 * 60 * 60 * 1000) + initialDayOffset;
    })();

    const onMove = (moveE) => {
      const dx = moveE.clientX - startX;
      const deltaDays = -(dx / trackWidth) * MONTHLY_TRACK_DAYS;
      const newAbsDays = initialAbsDays + deltaDays;

      const refMs = newAbsDays * 24 * 60 * 60 * 1000;
      const refDate = new Date(refMs);
      const targetYear = refDate.getFullYear();
      const targetMonth = refDate.getMonth();
      const dayInMonth = refDate.getDate() - 1;

      const totalMonthsNow = (now.getFullYear() - baseYear) * 12 + now.getMonth();
      const totalMonthsTarget = (targetYear - baseYear) * 12 + targetMonth;
      setMonthlyOffset(totalMonthsTarget - totalMonthsNow);
      setMonthlyDayOffset(dayInMonth);
    };

    const onUp = () => {
      target.releasePointerCapture?.(pointerId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const todayDayIndex = useMemo(() => {
    const anchorStart = new Date(displayYear, displayMonth - 1, 1).getTime();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return Math.round((todayStart - anchorStart) / (24 * 60 * 60 * 1000));
  }, [displayYear, displayMonth, now]);
  const todayColLeft = `${((todayDayIndex - monthlyDayOffset) / MONTHLY_TRACK_DAYS) * 100}%`;
  const todayColWidth = `${(1 / MONTHLY_TRACK_DAYS) * 100}%`;

  return (
    <div data-gantt-canvas className="w-full flex flex-col relative" style={{ cursor: activeTool === 'cut' ? 'crosshair' : activeTool === 'paint' ? PAINT_BUCKET_CURSOR : 'default' }} onPointerDownCapture={handleBlankCanvasPointerDown}>
      <div
        className={`flex gap-4 mb-1 border-b pb-1 cursor-move group/header ${MC.headerBorder}`}
        onPointerDown={handleHeaderPointerDown}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <div className="w-[140px] shrink-0 flex flex-col justify-end gap-0">
          <div className="h-[18px] flex items-center gap-0.5">
            {isHeaderHovered && onDensityChange && (
              <>
                <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDensityChange('narrow'); }} className={`h-full min-w-[28px] px-1.5 rounded-[4px] text-[10px] font-semibold transition-all ${density === 'narrow' ? (isLight ? activeTheme.lightHighlight : activeTheme.highlight) : `bg-black/5 ${MC.labelText} hover:bg-black/10`}`}>0.5x</button>
                <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDensityChange('normal'); }} className={`h-full min-w-[24px] px-1.5 rounded-[4px] text-[10px] font-semibold transition-all ${density === 'normal' ? (isLight ? activeTheme.lightHighlight : activeTheme.highlight) : `bg-black/5 ${MC.labelText} hover:bg-black/10`}`}>1x</button>
                <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDensityChange('wide'); }} className={`h-full min-w-[24px] px-1.5 rounded-[4px] text-[10px] font-semibold transition-all ${density === 'wide' ? (isLight ? activeTheme.lightHighlight : activeTheme.highlight) : `bg-black/5 ${MC.labelText} hover:bg-black/10`}`}>2x</button>
              </>
            )}
          </div>
          <div className="h-[20px] flex items-center gap-0">
          <input
            key={`yr-${displayYear}-${displayMonth}`}
            type="text"
            defaultValue={displayYear}
            onBlur={(e) => {
              const y = parseInt(String(e.target.value).replace(/\D/g, ''), 10);
              if (!isNaN(y) && y >= 1900 && y <= 2100) {
                const totalMonthsNow = (now.getFullYear() - baseYear) * 12 + (now.getMonth() + 1) - 1;
                const totalMonthsTarget = (y - baseYear) * 12;
                setMonthlyOffset(totalMonthsTarget - totalMonthsNow);
                setMonthlyDayOffset(0);
              } else {
                e.target.value = String(displayYear);
              }
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className={`w-12 bg-transparent font-black focus:outline-none px-1 ${MC.labelText}`}
            style={{ WebkitAppRegion: 'no-drag', fontSize: `${timelineFontSize}px` }}
          />
          <span className={`font-black ${MC.labelText}`} style={{ fontSize: `${timelineFontSize}px` }}>年</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col relative" ref={trackRef}>
          <div className="relative w-full overflow-hidden h-[18px]">
            <div className="flex w-full overflow-hidden h-[18px]">
              {monthSpans.map((span, i) => {
                const left = Math.max(0, span.startPct);
                const right = Math.min(100, span.endPct);
                const width = right - left;
                if (width <= 0) return null;
                return (
                  <div key={i} className="absolute top-0 bottom-0 p-[1px] border-l border-white/5" style={{ left: `${left}%`, width: `${width}%` }}>
                    <div className={`${MC.monthHeaderBg} w-full h-full rounded-[4px] flex items-center px-2 overflow-hidden`} style={MC.headerPillStyle}>
                      <span className={`font-black whitespace-nowrap ${MC.labelText}`} style={{ fontSize: `${timelineFontSize}px` }}>{span.month}月</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative w-full h-[20px] flex items-center overflow-hidden pointer-events-none min-w-0">
            {visibleDays.map((d, i) => (
              <div key={`${d.y}-${d.m}-${d.dayIndex}`} className={`absolute font-bold pl-0.5 truncate overflow-hidden z-10 ${d.y === now.getFullYear() && d.m === now.getMonth() + 1 && d.day === now.getDate() ? 'text-amber-400' : MC.dayText}`} style={{ left: `${d.leftPct}%`, width: `${100 / MONTHLY_TRACK_DAYS}%`, fontSize: `${timelineFontSize}px` }}>{d.label}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full relative flex flex-col">
        {/* Mask layer: background bar + subtask bars (same as annual view 838-866) */}
        <div className="absolute top-0 bottom-0 left-0 pointer-events-none z-10" style={{
          right: '-24px',
          maskImage: 'linear-gradient(to right, transparent 0px, transparent 140px, black 156px, black calc(100% - 24px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0px, transparent 140px, black 156px, black calc(100% - 24px), transparent 100%)'
        }}>
          <div className="absolute top-0 bottom-0 left-[156px] pointer-events-auto overflow-visible" style={{ right: '24px' }}>
            {(() => {
              let cumulativeTop = 0;
              return (
                <>
                  {spanRows.map(row => {
                    const g = groups[row.id] || { title: row.title, tasks: [] };
                    const taskRows = sortMode === 'time' ? [...(g.tasks || [])].sort((a, b) => {
                      const aIdx = taskDayIndexFromAnchor(a.start, a._year, a._month);
                      const bIdx = taskDayIndexFromAnchor(b.start, b._year, b._month);
                      return aIdx - bIdx;
                    }) : (g.tasks || []);
                    const rowHeight = Math.max(1, taskRows.length) * rowH;
                    const top = cumulativeTop;
                    cumulativeTop += rowHeight;
                    const bgDays = getRowBackgroundDays(row, displayYear, displayMonth);
                    const monthStart = (displayYear - baseYear) * 12 + (displayMonth - 1);
                    const monthEnd = monthStart + 1;
                    const viewStartDate = new Date(displayYear, displayMonth - 1, 1 + Math.floor(monthlyDayOffset));
                    const viewEndDate = new Date(displayYear, displayMonth - 1, 1 + Math.floor(monthlyDayOffset) + MONTHLY_TRACK_DAYS);
                    const viewStartMonths = (viewStartDate.getFullYear() - baseYear) * 12 + viewStartDate.getMonth();
                    const viewEndMonths = (viewEndDate.getFullYear() - baseYear) * 12 + viewEndDate.getMonth() + 1;
                    const overlapSeg = row.segments.find(s => s.start < monthEnd && s.end > monthStart);
                    const bgColorRaw = overlapSeg?.color || row.segments[0]?.color || DEFAULT_BAR_COLOR;
                    const bgColor = isLight ? bgColorRaw.replace(/[\d.]+\)$/, '0.18)') : bgColorRaw;
                    return (
                      <motion.div key={row.id} layout transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="absolute left-0 right-0" style={{ top, height: rowHeight, minHeight: rowHeight }}>
                        {bgDays && (
                          <div className="absolute top-0 bottom-0 rounded-[4px] border border-white/5 z-[1] box-border" style={{
                            left: `${((bgDays.startDay - 1 - monthlyDayOffset) / MONTHLY_TRACK_DAYS) * 100}%`,
                            width: `${((bgDays.endDay - bgDays.startDay + 1) / MONTHLY_TRACK_DAYS) * 100}%`,
                            backgroundColor: bgColor,
                            pointerEvents: activeTool === 'paint' ? 'auto' : 'none',
                            cursor: activeTool === 'paint' ? PAINT_BUCKET_CURSOR : 'default'
                          }}
                          onClick={() => {
                            if (activeTool === 'paint') {
                              commitHistory();
                              const newColor = hexToRgba(paintColor, 0.4);
                              setRows(prev => prev.map(r => {
                                if (r.id !== row.id) return r;
                                return { ...r, segments: r.segments.map(seg => {
                                  if (seg.start < viewEndMonths && seg.end > viewStartMonths) return { ...seg, color: newColor };
                                  return seg;
                                })};
                              }));
                            }
                          }} />
                        )}
                        {taskRows.map(t => {
                          const tYear = t._year ?? displayYear;
                          const tMonth = t._month ?? displayMonth;
                          const tStartIdx = taskDayIndexFromAnchor(t.start, tYear, tMonth);
                          const tEndIdx = taskDayIndexFromAnchor(t.end, tYear, tMonth);
                          const hourFrac = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
                          const currentPos = todayDayIndex + hourFrac;
                          const barLeft = tStartIdx, barRight = tEndIdx;
                          const prog = currentPos == null ? 0 : currentPos < barLeft ? 0 : currentPos >= barRight ? 100 : ((currentPos - barLeft) / (barRight - barLeft)) * 100;
                          const isAck = t.isAcknowledged || false;
                          const barBg = isAck ? 'rgba(16, 185, 129, 0.05)' : (isLight ? t.color.replace(/[\d.]+\)$/, '0.18)') : t.color);
                          const progColor = isAck ? 'rgba(16, 185, 129, 0.5)' : (t.progressColor || hexToRgba(activeTheme.color, isLight ? 1.0 : 0.6));
                          const taskMonthKey = t._year != null ? getMonthKey(t._year, t._month) : monthKey;
                          return (
                            <motion.div key={t.id} layout transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="absolute left-0 right-0 group/bar z-[5]" style={{ top: taskRows.indexOf(t) * rowH, height: rowH }}
                              onMouseEnter={() => {
                                if (hoveredMonthlyTaskRef) hoveredMonthlyTaskRef.current = { groupId: row.id, taskId: t.id, monthKey: taskMonthKey };
                                setHoveredMonthlyBar({ groupId: row.id, taskId: t.id });
                              }}
                              onMouseLeave={() => {
                                if (hoveredMonthlyTaskRef) hoveredMonthlyTaskRef.current = null;
                                setHoveredMonthlyBar(null);
                              }}>
                              <div
                                data-monthly-task
                                className={`absolute inset-y-0 rounded-[4px] overflow-visible border border-white/5 ${activeTool === 'cut' ? 'cursor-crosshair' : activeTool === 'paint' ? '' : 'cursor-grab active:cursor-grabbing hover:outline hover:outline-1 hover:outline-white/30'}`}
                                style={{
                                  left: `${((tStartIdx - monthlyDayOffset) / MONTHLY_TRACK_DAYS) * 100}%`,
                                  width: `${((tEndIdx - tStartIdx) / MONTHLY_TRACK_DAYS) * 100}%`,
                                  backgroundColor: barBg,
                                  ...(activeTool === 'paint' ? { cursor: PAINT_BUCKET_CURSOR } : {})
                                }}
                                onPointerDown={e => {
                                  if (activeTool === 'paint') {
                                    e.stopPropagation();
                                    commitHistory();
                                    const newColor = hexToRgba(paintColor, 0.4);
                                    updateTask(row.id, t.id, { color: newColor }, taskMonthKey);
                                    return;
                                  }
                                  handleMonthlyBarPointerDown(e, row.id, t, true);
                                }}
                              >
                                <div className="absolute inset-0 rounded-[4px] overflow-hidden">
                                  <div
                                    className="absolute inset-0 transition-all"
                                    style={{ width: `${prog}%`, backgroundColor: progColor, cursor: activeTool === 'paint' ? PAINT_BUCKET_CURSOR : undefined }}
                                    onPointerDown={activeTool === 'paint' && prog > 0 ? (e) => { e.stopPropagation(); commitHistory(); updateTask(row.id, t.id, { progressColor: hexToRgba(paintColor, 0.6) }, taskMonthKey); } : undefined}
                                  />
                                </div>
                                <div className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/20 opacity-0 group-hover/bar:opacity-100 z-20" style={{ WebkitAppRegion: 'no-drag' }} />
                                <div className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/20 opacity-0 group-hover/bar:opacity-100 z-20" style={{ WebkitAppRegion: 'no-drag' }} />
                                {prog === 100 && !isAck && activeTool !== 'paint' && (
                                  <LongPressAck
                                    onConfirm={() => { commitHistory(); updateTask(row.id, t.id, { isAcknowledged: true }, taskMonthKey); }}
                                    holdDuration={1000}
                                    themeColor={activeTheme.color}
                                    isLight={isLight}
                                  />
                                )}
                                <MonthlyBarInput task={t} rowId={row.id} isGrouped={true} updateTask={(rid, tid, u) => updateTask(rid, tid, u, taskMonthKey)} prog={prog} isAck={isAck} showFieldNames={showFieldNames} showStatusText={showStatusText} showRemarks={showRemarks} segmentLabelFontSize={segmentLabelFontSize} isBarHovered={hoveredMonthlyBar && hoveredMonthlyBar.groupId === row.id && hoveredMonthlyBar.taskId === t.id} isWideMode={isWideMode} commitHistory={commitHistory} stickyLeftPct={(() => { const blp = ((tStartIdx - monthlyDayOffset) / MONTHLY_TRACK_DAYS) * 100; const bwp = ((tEndIdx - tStartIdx) / MONTHLY_TRACK_DAYS) * 100; return blp < 0 && bwp > 0 ? Math.min((-blp / bwp) * 100, 90) : 0; })()} isLight={isLight} />
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    );
                  })}
                  {/* Ungrouped tasks row */}
                  {(() => {
                    const top = cumulativeTop;
                    const ungroupedBlockHeight = Math.max(1, ungroupedTasks.length) * rowH;
                    return (
                      <motion.div layout transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="absolute left-0 right-0" style={{ top, height: ungroupedBlockHeight }}>
                        {ungroupedTasks.map(t => {
                          const tYear = t._year ?? displayYear;
                          const tMonth = t._month ?? displayMonth;
                          const tStartIdx = taskDayIndexFromAnchor(t.start, tYear, tMonth);
                          const tEndIdx = taskDayIndexFromAnchor(t.end, tYear, tMonth);
                          const hourFrac = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
                          const currentPos = todayDayIndex + hourFrac;
                          const barLeft = tStartIdx, barRight = tEndIdx;
                          const prog = currentPos == null ? 0 : currentPos < barLeft ? 0 : currentPos >= barRight ? 100 : ((currentPos - barLeft) / (barRight - barLeft)) * 100;
                          const isAck = t.isAcknowledged || false;
                          const barBg = isAck ? 'rgba(16, 185, 129, 0.05)' : (isLight ? t.color.replace(/[\d.]+\)$/, '0.18)') : t.color);
                          const progColor = isAck ? 'rgba(16, 185, 129, 0.5)' : (t.progressColor || hexToRgba(activeTheme.color, isLight ? 1.0 : 0.6));
                          const taskMonthKey = t._year != null ? getMonthKey(t._year, t._month) : monthKey;
                          return (
                            <div key={t.id} className="absolute left-0 right-0 group/bar z-[5]" style={{ top: ungroupedTasks.indexOf(t) * rowH, height: rowH }}
                              onMouseEnter={() => {
                                if (hoveredMonthlyTaskRef) hoveredMonthlyTaskRef.current = { groupId: null, taskId: t.id, monthKey: taskMonthKey };
                                setHoveredMonthlyBar({ groupId: null, taskId: t.id });
                              }}
                              onMouseLeave={() => {
                                if (hoveredMonthlyTaskRef) hoveredMonthlyTaskRef.current = null;
                                setHoveredMonthlyBar(null);
                              }}>
                              <div
                                data-monthly-task
                                className={`absolute inset-y-0 rounded-[4px] overflow-visible border border-white/5 ${activeTool === 'cut' ? 'cursor-crosshair' : activeTool === 'paint' ? '' : 'cursor-grab active:cursor-grabbing hover:outline hover:outline-1 hover:outline-white/30'}`}
                                style={{
                                  left: `${((tStartIdx - monthlyDayOffset) / MONTHLY_TRACK_DAYS) * 100}%`,
                                  width: `${((tEndIdx - tStartIdx) / MONTHLY_TRACK_DAYS) * 100}%`,
                                  backgroundColor: barBg,
                                  ...(activeTool === 'paint' ? { cursor: PAINT_BUCKET_CURSOR } : {})
                                }}
                                onPointerDown={e => {
                                  if (activeTool === 'paint') {
                                    e.stopPropagation();
                                    commitHistory();
                                    const newColor = hexToRgba(paintColor, 0.4);
                                    updateTask(null, t.id, { color: newColor }, taskMonthKey);
                                    return;
                                  }
                                  handleMonthlyBarPointerDown(e, null, t, false);
                                }}
                              >
                                <div className="absolute inset-0 rounded-[4px] overflow-hidden">
                                  <div
                                    className="absolute inset-0 transition-all"
                                    style={{ width: `${prog}%`, backgroundColor: progColor, cursor: activeTool === 'paint' ? PAINT_BUCKET_CURSOR : undefined }}
                                    onPointerDown={activeTool === 'paint' && prog > 0 ? (e) => { e.stopPropagation(); commitHistory(); updateTask(null, t.id, { progressColor: hexToRgba(paintColor, 0.6) }, taskMonthKey); } : undefined}
                                  />
                                </div>
                                <div className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/20 opacity-0 group-hover/bar:opacity-100 z-20" style={{ WebkitAppRegion: 'no-drag' }} />
                                <div className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/20 opacity-0 group-hover/bar:opacity-100 z-20" style={{ WebkitAppRegion: 'no-drag' }} />
                                {prog === 100 && !isAck && activeTool !== 'paint' && (
                                  <LongPressAck
                                    onConfirm={() => { commitHistory(); updateTask(null, t.id, { isAcknowledged: true }, taskMonthKey); }}
                                    holdDuration={1000}
                                    themeColor={activeTheme.color}
                                    isLight={isLight}
                                  />
                                )}
                                <MonthlyBarInput task={t} rowId={null} isGrouped={false} updateTask={(rid, tid, u) => updateTask(rid, tid, u, taskMonthKey)} prog={prog} isAck={isAck} showFieldNames={showFieldNames} showStatusText={showStatusText} showRemarks={showRemarks} segmentLabelFontSize={segmentLabelFontSize} isBarHovered={hoveredMonthlyBar && hoveredMonthlyBar.groupId === null && hoveredMonthlyBar.taskId === t.id} isWideMode={isWideMode} commitHistory={commitHistory} stickyLeftPct={(() => { const blp = ((tStartIdx - monthlyDayOffset) / MONTHLY_TRACK_DAYS) * 100; const bwp = ((tEndIdx - tStartIdx) / MONTHLY_TRACK_DAYS) * 100; return blp < 0 && bwp > 0 ? Math.min((-blp / bwp) * 100, 90) : 0; })()} isLight={isLight} />
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    );
                  })()}
                </>
              );
            })()}
          </div>
        </div>

        {/* Normal flow: title + grid only */}
        <div className="flex flex-col gap-0">
        {spanRows.map(row => {
          const g = groups[row.id] || { title: row.title, tasks: [] };
          const taskRows = sortMode === 'time' ? [...(g.tasks || [])].sort((a, b) => {
            const aIdx = taskDayIndexFromAnchor(a.start, a._year ?? displayYear, a._month ?? displayMonth);
            const bIdx = taskDayIndexFromAnchor(b.start, b._year ?? displayYear, b._month ?? displayMonth);
            return aIdx - bIdx;
          }) : (g.tasks || []);
          const rowHeight = Math.max(1, taskRows.length) * rowH;
          return (
            <motion.div key={row.id} layout transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className={`border-b box-border ${MC.rowBorder}`} style={{ height: rowHeight }}>
              <motion.div layout transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="flex gap-4 items-center group/grp" style={{ height: rowHeight }}>
                <div className="w-[140px] shrink-0 pl-1 flex items-center justify-between relative z-20 overflow-hidden" style={{ height: rowHeight }}>
                  <span className={`font-bold flex-1 truncate ${MC.labelText}`} style={{ textAlign: 'left', fontSize: `${effectiveTitleFontSize}px` }}>{g.title}</span>
                  <button onClick={() => addSubTask(row.id)} className={`p-1 shrink-0 ${MC.dayText} hover:opacity-80`}><Plus className="w-3 h-3" /></button>
                </div>
                <div className="flex-1 relative overflow-hidden" style={{ height: rowHeight }}>
                  {Array.from({ length: MONTHLY_TRACK_DAYS + 1 }).map((_, i) => {
                    const start = Math.floor(monthlyDayOffset);
                    const lineLeft = ((start + i - monthlyDayOffset) / MONTHLY_TRACK_DAYS) * 100;
                    return <div key={`grid-${i}`} className={`absolute top-0 bottom-0 border-l pointer-events-none z-[2] ${MC.rowBorder}`} style={{ left: `${lineLeft}%` }} />;
                  })}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
        <motion.div layout transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className={`flex gap-4 items-center border-b box-border ${MC.rowBorder}`} style={{ minHeight: rowH }}>
          <div className="w-[140px] shrink-0 pl-1 flex items-center opacity-30 hover:opacity-100 transition-opacity" style={{ height: rowH }}>
            <button onClick={addUngroupedTask} className={`flex items-center justify-center p-0 ${MC.dayText}`} title="其他任务">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 relative overflow-hidden" style={{ height: Math.max(1, ungroupedTasks.length) * rowH, minHeight: Math.max(1, ungroupedTasks.length) * rowH }}>
            {ungroupedTasks.length > 0 && Array.from({ length: MONTHLY_TRACK_DAYS + 1 }).map((_, i) => {
              const start = Math.floor(monthlyDayOffset);
              const lineLeft = ((start + i - monthlyDayOffset) / MONTHLY_TRACK_DAYS) * 100;
              return <div key={`ugrid-${i}`} className="absolute top-0 bottom-0 border-l border-white/5 pointer-events-none" style={{ left: `${lineLeft}%` }} />;
            })}
          </div>
        </motion.div>
        </div>

        {/* Today line + triangle markers: outside mask, z-[100] */}
        <div className="absolute top-0 bottom-0 left-[156px] right-0 pointer-events-none z-[100] overflow-visible">
          {(() => {
            const start = Math.floor(monthlyDayOffset);
            const todayInVisible = todayDayIndex >= start && todayDayIndex < start + MONTHLY_TRACK_DAYS;
            return (
              <>
                {todayInVisible && (
                  <>
                    <div className="absolute inset-0 pointer-events-none">
                      <div className={`absolute inset-0 pointer-events-none ${activeTheme.todayBg}`} style={{ left: todayColLeft, width: todayColWidth }} />
                    </div>
                    <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none">
                      {(() => {
                        const hourFrac = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
                        const dayFrac = todayDayIndex + hourFrac - monthlyDayOffset;
                        const leftPct = (dayFrac / MONTHLY_TRACK_DAYS) * 100;
                        return (
                          <div className={`absolute top-0 bottom-0 w-[1px] ${activeTheme.todayLine}`} style={{ left: `${leftPct}%` }}>
                            <div className={`absolute top-0 left-[0.5px] -translate-x-1/2 w-0 h-0 border-x-[3.5px] border-x-transparent border-t-[5px] ${activeTheme.todayArrow}`} />
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
                {!todayInVisible && todayDayIndex < start && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-[101] cursor-pointer pointer-events-auto hover:opacity-100 animate-blink-soft"
                    onClick={() => { setMonthlyOffset(0); setMonthlyDayOffset(0); }}
                    title="回到今天"
                  >
                    <div className="w-0 h-0 border-y-[8px] border-y-transparent border-r-[10px]" style={{ borderRightColor: activeTheme.todayColor }} />
                  </div>
                )}
                {!todayInVisible && todayDayIndex >= start + MONTHLY_TRACK_DAYS && (
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-[101] cursor-pointer pointer-events-auto hover:opacity-100 animate-blink-soft"
                    onClick={() => { setMonthlyOffset(0); setMonthlyDayOffset(0); }}
                    title="回到今天"
                  >
                    <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[10px]" style={{ borderLeftColor: activeTheme.todayColor }} />
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// To-Do List (昨日/今日/明日)
// ==========================================
const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtLabel = (d) => `${d.getMonth() + 1}月${d.getDate()}日`;

const TodoItem = ({ it, dateKey, index, updateItem, removeItem, moveItemToNextDay, moveItemToPrevDay, lastAddedRef, activeTheme, addItem, todoItemFontSize, isShaking, isLight }) => {
  const inputRef = useRef(null);
  const syncHeight = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    if (lastAddedRef.current?.dateKey === dateKey && lastAddedRef.current?.id === it.id) {
      inputRef.current?.focus();
      syncHeight();
      lastAddedRef.current = null;
    }
  }, [dateKey, it.id, lastAddedRef, syncHeight]);

  useEffect(() => {
    syncHeight();
  }, [it.text, syncHeight]);

  useEffect(() => {
    const handleResize = () => syncHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [syncHeight]);
  
  const handleBlur = () => {
    const v = (inputRef.current?.value ?? '').trim();
    if (!v) {
      removeItem(dateKey, it.id);
      return;
    }
    if (v !== it.text) updateItem(dateKey, it.id, { text: v });
  };

  const toggleCompleted = () => {
    if (it.isCompleted) {
      updateItem(dateKey, it.id, { isCompleted: false, completedAt: null });
    } else {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      updateItem(dateKey, it.id, { isCompleted: true, completedAt: timeStr });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const v = (inputRef.current?.value ?? '').trim();
      if (v === '') {
        inputRef.current?.blur();
      } else if (e.shiftKey) {
        moveItemToPrevDay?.(dateKey, it.id, v);
      } else {
        moveItemToNextDay?.(dateKey, it.id, v);
      }
      return;
    }
    if ((e.shiftKey || e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
      toggleCompleted();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = (inputRef.current?.value ?? '').trim();
      if (v !== it.text) updateItem(dateKey, it.id, { text: v });
      addItem(dateKey, it.id);
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const val = inputRef.current?.value ?? '';
      if (val === '') {
        e.preventDefault();
        removeItem(dateKey, it.id);
      }
    }
  };

  return (
    <div className={`relative flex items-start gap-1.5 group min-w-0 select-text transition-opacity duration-200 ${it.isCompleted ? 'opacity-50' : 'opacity-100'} ${isShaking ? 'animate-todo-boundary' : ''}`} style={{ userSelect: 'text' }}>
      <span className={`shrink-0 select-none w-4 pt-[2px] ${isLight ? 'text-gray-400' : 'text-white/40'}`} style={{ fontSize: `${Math.max(8, todoItemFontSize - 1)}px` }}>{index}.</span>
      <button 
        onClick={toggleCompleted} 
        className={`shrink-0 mt-[1px] p-0.5 rounded-full transition-colors z-10 relative ${it.isCompleted ? (isLight ? (activeTheme.lightHighlight.split(' ')[1] || 'text-gray-700') : (activeTheme.highlight.split(' ')[1] || 'text-white/70')) : (isLight ? 'text-gray-400 hover:text-gray-600' : 'text-white/30 hover:text-white/70')}`}
      >
        {it.isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
      </button>
      <textarea ref={inputRef} rows={1} wrap="soft" defaultValue={it.text} key={`${it.id}-${it.isCompleted ? 'done' : 'open'}`}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={syncHeight}
        placeholder="添加任务..."
        style={{ WebkitAppRegion: 'no-drag', fontSize: `${todoItemFontSize}px`, lineHeight: 1.45 }}
        className={`w-full flex-1 min-w-0 max-w-full bg-transparent focus:outline-none pointer-events-auto select-text resize-none overflow-hidden whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${it.isCompleted ? 'line-through' : ''} ${isLight ? 'text-gray-700 placeholder:text-gray-400' : 'text-white placeholder:text-white/30'}`} 
      />
      {it.isCompleted && it.completedAt && (
        <span className={`shrink-0 pt-[2px] select-none mr-1 ${isLight ? 'text-gray-400' : 'text-white/40'}`} style={{ fontSize: `${Math.max(8, todoItemFontSize - 1)}px` }}>
          {it.completedAt}
        </span>
      )}
    </div>
  );
};

const TodoCol = React.memo(({ dateKey, label, flex, isToday, items, addItem, updateItem, removeItem, moveItemToNextDay, moveItemToPrevDay, lastAddedRef, activeTheme, todoItemFontSize, shakeTaskId, isLight }) => (
  <div className={`min-w-0 flex flex-col rounded-lg border overflow-hidden ${flex} ${isLight ? 'border-black/10' : 'border-white/10'} ${isToday ? activeTheme.todayBg : (isLight ? 'bg-black/5' : 'bg-white/5')}`} style={{ minWidth: 120 }}>
    <div className={`px-2 py-1.5 border-b font-bold ${isLight ? 'border-black/10 text-gray-600' : 'border-white/10 text-white/70'}`} style={{ fontSize: `${todoItemFontSize}px` }}>{label}</div>
    <div className="flex-1 min-w-0 p-2 space-y-1.5 min-h-[60px] overflow-visible select-text">
      {items.map((it, i) => (
        <TodoItem key={it.id} it={it} dateKey={dateKey} index={i + 1} updateItem={updateItem} removeItem={removeItem} moveItemToNextDay={moveItemToNextDay} moveItemToPrevDay={moveItemToPrevDay} lastAddedRef={lastAddedRef} activeTheme={activeTheme} addItem={addItem} todoItemFontSize={todoItemFontSize} isShaking={shakeTaskId === it.id} isLight={isLight} />
      ))}
      <button onClick={() => addItem(dateKey)} className={`w-full text-left py-1 flex items-center gap-1 ${isLight ? 'text-gray-400 hover:text-gray-600' : 'text-white/40 hover:text-white/60'}`} style={{ fontSize: `${Math.max(8, todoItemFontSize - 1)}px` }}>
        <Plus className="w-3 h-3" /> 添加
      </button>
    </div>
  </div>
));

const TodoListView = ({ now, todoData, setTodoData, activeTheme, commitTodoHistory, todoItemFontSize, colorMode }) => {
  const lastAddedRef = useRef(null);
  const dateKey = fmtDate(now);
  const yesterday = useMemo(() => { const d = new Date(now); d.setDate(d.getDate() - 1); return d; }, [dateKey]);
  const today = useMemo(() => new Date(now), [dateKey]);
  const tomorrow = useMemo(() => { const d = new Date(now); d.setDate(d.getDate() + 1); return d; }, [dateKey]);
  const yesterdayKey = fmtDate(yesterday);
  const todayKey = fmtDate(today);
  const tomorrowKey = fmtDate(tomorrow);

  const [shakeTaskId, setShakeTaskId] = useState(null);
  const boundaryTimerRef = useRef(null);
  const triggerBoundaryFeedback = useCallback((id) => {
    if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current);
    setShakeTaskId(id);
    boundaryTimerRef.current = setTimeout(() => {
      setShakeTaskId(null);
      boundaryTimerRef.current = null;
    }, 250);
  }, []);

  useEffect(() => () => {
    if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current);
  }, []);

  const getItems = (key) => todoData[key] || [];
  const setItems = (key, items) => setTodoData(prev => ({ ...prev, [key]: items }));
  const addItem = (key, afterId = null) => {
    commitTodoHistory?.();
    const id = Date.now().toString();
    const items = getItems(key);
    if (afterId != null) {
      const idx = items.findIndex(it => it.id === afterId);
      const insertAt = idx === -1 ? items.length : idx + 1;
      const next = [...items.slice(0, insertAt), { id, text: '' }, ...items.slice(insertAt)];
      setItems(key, next);
    } else {
      setItems(key, [...items, { id, text: '' }]);
    }
    lastAddedRef.current = { dateKey: key, id };
  };
  const updateItem = useCallback((key, id, updates) => {
    commitTodoHistory?.();
    setTodoData(prev => ({ ...prev, [key]: (prev[key] || []).map(it => it.id === id ? { ...it, ...updates } : it) }));
  }, [commitTodoHistory]);
  const removeItem = (key, id) => {
    commitTodoHistory?.();
    setItems(key, getItems(key).filter(it => it.id !== id));
  };

  const moveItemToNextDay = (key, id, newText) => {
    const [y, m, d] = key.split('-').map(Number);
    const nextDate = new Date(y, m - 1, d + 1);
    const nextKey = fmtDate(nextDate);
    if (nextKey > tomorrowKey) {
      triggerBoundaryFeedback(id);
      return;
    }
    const items = getItems(key);
    const item = items.find(it => it.id === id);
    if (!item) return;
    commitTodoHistory?.();
    setTodoData(prev => {
      const next = { ...prev };
      next[key] = (prev[key] || []).filter(it => it.id !== id);
      const moved = { ...item, text: newText };
      next[nextKey] = [...(prev[nextKey] || []), moved];
      return next;
    });
    lastAddedRef.current = { dateKey: nextKey, id };
  };

  const moveItemToPrevDay = (key, id, newText) => {
    const [y, m, d] = key.split('-').map(Number);
    const prevDate = new Date(y, m - 1, d - 1);
    const prevKey = fmtDate(prevDate);
    if (prevKey < yesterdayKey) {
      triggerBoundaryFeedback(id);
      return;
    }
    const items = getItems(key);
    const item = items.find(it => it.id === id);
    if (!item) return;
    commitTodoHistory?.();
    setTodoData(prev => {
      const next = { ...prev };
      next[key] = (prev[key] || []).filter(it => it.id !== id);
      const moved = { ...item, text: newText };
      next[prevKey] = [...(prev[prevKey] || []), moved];
      return next;
    });
    lastAddedRef.current = { dateKey: prevKey, id };
  };

  const isLight = colorMode === 'light';
  return (
    <div className="w-full min-w-0 flex flex-col select-text">
      <div className={`uppercase tracking-wider mb-2 ${isLight ? 'text-gray-400' : 'text-white/40'}`} style={{ fontSize: `${Math.max(8, todoItemFontSize - 1)}px` }}>To do</div>
      <div className="flex min-w-0 gap-3">
        <TodoCol dateKey={yesterdayKey} label={`昨日 ${fmtLabel(yesterday)}`} flex="flex-[0.8]" isToday={false} items={getItems(yesterdayKey)} addItem={addItem} updateItem={updateItem} removeItem={removeItem} moveItemToNextDay={moveItemToNextDay} moveItemToPrevDay={moveItemToPrevDay} lastAddedRef={lastAddedRef} activeTheme={activeTheme} todoItemFontSize={todoItemFontSize} shakeTaskId={shakeTaskId} isLight={isLight} />
        <TodoCol dateKey={todayKey} label={`今日 ${fmtLabel(today)}`} flex="flex-[1.5]" isToday={true} items={getItems(todayKey)} addItem={addItem} updateItem={updateItem} removeItem={removeItem} moveItemToNextDay={moveItemToNextDay} moveItemToPrevDay={moveItemToPrevDay} lastAddedRef={lastAddedRef} activeTheme={activeTheme} todoItemFontSize={todoItemFontSize} shakeTaskId={shakeTaskId} isLight={isLight} />
        <TodoCol dateKey={tomorrowKey} label={`明日 ${fmtLabel(tomorrow)}`} flex="flex-[0.8]" isToday={false} items={getItems(tomorrowKey)} addItem={addItem} updateItem={updateItem} removeItem={removeItem} moveItemToNextDay={moveItemToNextDay} moveItemToPrevDay={moveItemToPrevDay} lastAddedRef={lastAddedRef} activeTheme={activeTheme} todoItemFontSize={todoItemFontSize} shakeTaskId={shakeTaskId} isLight={isLight} />
      </div>
    </div>
  );
};

export default App;
