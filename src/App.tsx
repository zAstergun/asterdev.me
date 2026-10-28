import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { ChatBot } from "./components/ChatBot";
import { SoulFighterShowcase } from "./components/SoulFighterShowcase";
import { SoulFighterPhoneCompanion } from "./components/SoulFighterPhoneCompanion";
import { IdealCalcShowcase } from "./components/IdealCalcShowcase";
import { IdealCalcPhoneCompanion } from "./components/IdealCalcPhoneCompanion";
import {
  GithubLogo,
  LinkedinLogo,
  EnvelopeSimple,
  FilePdf,
  FileDoc,
  FileText,
  FileCode,
  Users,
  ArrowSquareOut,
  Play,
  LinkSimple,
  FolderSimple,
  ArrowLeft,
  ArrowRight,
  RocketLaunch,
  GraduationCap,
  X,
  ArrowCounterClockwise,
  ArrowsOut,
  ArrowsIn,
  GameController,
  Info,
  Fire,
  Calculator,
  Heart,
  Sparkle,
} from "@phosphor-icons/react";
import {
  GRID_COLS,
  isDetailable,
  isFolder,
  isLink,
  isImageIcon,
  LANGUAGES,
  getHomeItems,
  type GridItem,
  type DetailableItem,
  type FolderItem,
  type Language,
  type TranslationDict,
} from "./data/aster";

/** Tablet container query breakpoint (must match tailwind containers.tablet) */
const TABLET_BREAKPOINT = 640;
const TABLET_COLS = 4;

// ─── Helpers ─────────────────────────────────────────────────

/** Clamp index within valid bounds — never returns < 0 or >= total */
function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(index, total - 1));
}

/** Update dark mode item with dynamic icon and name based on current theme */
function getDarkModeItem(item: GridItem, isDark: boolean): GridItem {
  if (item.id === 'dark-mode') {
    return {
      ...item,
      name: isDark ? 'Light Mode' : 'Dark Mode',
      icon: isDark ? '/icons/apps/light-mode.svg' : '/icons/apps/dark-mode.svg',
      gradient: isDark ? ['#f6d365', '#fda085'] : item.gradient,
    };
  }
  return item;
}

/** Hook: live clock string for the status bar */
function useClockTime(): string {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })
  );

  useEffect(() => {
    const id = setInterval(
      () =>
        setTime(
          new Date().toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })
        ),
      10_000
    );
    return () => clearInterval(id);
  }, []);

  return time;
}

/** Hook: detect if viewport matches `xl` breakpoint (1280px) */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1280px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1280px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

/**
 * Hook: observe a @container element's inline-size and return the active
 * column count (GRID_COLS or TABLET_COLS) based on the container-query
 * breakpoint.  This keeps the React state perfectly in sync with what
 * CSS container queries resolve.
 */
function useContainerCols(ref: React.RefObject<HTMLElement | null>): number {
  const [cols, setCols] = useState(GRID_COLS);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setCols(w >= TABLET_BREAKPOINT ? TABLET_COLS : GRID_COLS);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return cols;
}

/**
 * Given a logical item array and the current column count, produce
 * a *visual index mapping* that accounts for CSS `order` changes.
 *
 * When `activeCols === TABLET_COLS` (4-col tablet layout) and the
 * array is the home screen (not a folder), the dark-mode item is
 * visually moved to the last position by CSS `order-last`.
 * This function computes:
 *   - `logicalToVisual[logicalIdx]` → position on screen
 *   - `visualToLogical[visualPos]` → index in `items` array
 *
 * When no reordering applies both arrays are simple identity maps.
 */
function buildVisualMap(
  items: GridItem[],
  activeCols: number,
  isInsideFolder: boolean,
): { logicalToVisual: number[]; visualToLogical: number[] } {
  const n = items.length;
  const identity = Array.from({ length: n }, (_, i) => i);

  // Reorder only on 4-col tablet, and only on the home grid
  if (activeCols !== TABLET_COLS || isInsideFolder) {
    return { logicalToVisual: identity, visualToLogical: identity };
  }

  const darkIdx = items.findIndex((it) => it.id === 'dark-mode');
  if (darkIdx === -1) {
    return { logicalToVisual: identity, visualToLogical: identity };
  }

  // Build visual order: everyone keeps relative order, dark-mode goes last
  const visualToLogical: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i !== darkIdx) visualToLogical.push(i);
  }
  visualToLogical.push(darkIdx); // dark-mode is last visually

  const logicalToVisual: number[] = new Array(n);
  for (let v = 0; v < n; v++) {
    logicalToVisual[visualToLogical[v]] = v;
  }

  return { logicalToVisual, visualToLogical };
}

// ─── Sub-components ──────────────────────────────────────────

function StatusBar({ time, isDark }: { time: string; isDark: boolean }) {
  const iconColor = isDark ? "#ffffff" : "#14131A";
  const textColor = isDark ? "text-stone-100" : "text-aster-dark";

  return (
    <div className="status-bar">
      <span className={`text-[12px] font-bold tracking-tight transition-colors duration-500 ${textColor}`}>
        {time}
      </span>
      <div className="status-symbols" aria-hidden="true">
        {/* Wi-Fi Icon */}
        <svg
          viewBox="0 0 18 14"
          fill="none"
          className="w-[15px] h-[13px] transition-colors duration-500"
          style={{ stroke: iconColor, strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" }}
        >
          <path d="M2 5.2a10 10 0 0 1 14 0M4.9 8a5.8 5.8 0 0 1 8.2 0M7.6 10.7a2 2 0 0 1 2.8 0" />
          <circle cx="9" cy="12" r=".7" fill={iconColor} stroke="none" />
        </svg>

        {/* Battery Icon */}
        <svg
          viewBox="0 0 20 14"
          fill="none"
          className="w-[18px] h-[13px] transition-colors duration-500"
          style={{ stroke: iconColor, strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" }}
        >
          <rect x="1" y="2" width="15.5" height="10" rx="2.2" />
          <path d="M18 5v4" />
          <rect x="3.2" y="4.1" width="10.7" height="5.8" rx="1" fill={iconColor} stroke="none" />
        </svg>
      </div>
    </div>
  );
}

const GridIcon = memo(function GridIcon({
  item,
  isFocused,
  onClick,
  onHover,
  isDark,
  extraClassName,
}: {
  item: GridItem;
  isFocused: boolean;
  onClick: (e: React.MouseEvent) => void;
  onHover: () => void;
  isDark: boolean;
  extraClassName?: string;
}) {
  const isFolder_ = item.type === "folder";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className={`app-icon relative flex flex-col items-center gap-2 @tablet:gap-4 p-2 @tablet:p-4 rounded-2xl transition-all duration-200 cursor-pointer scroll-m-6 ${
        isFocused ? "focused" : ""
      } ${extraClassName ?? ""}`}
      aria-label={
        isFolder_
          ? `Abrir pasta ${item.name}`
          : item.type === "link"
          ? `Abrir ${item.name}`
          : `Ver ${item.name}`
      }
      aria-haspopup={isFolder_ ? "true" : undefined}
      aria-expanded={isFolder_ ? "false" : undefined}
    >
      {/* Focus ring — asymmetric inset to balance the 5px cel-shading shadow */}
      {isFocused && (
        <div className="hidden xl:block absolute -top-[3px] -left-[3px] -bottom-[8px] -right-[8px] rounded-2xl border-2 border-aster-accent/60 animate-pulse-glow pointer-events-none" />
      )}

      {/* Icon */}
      <div
        className={`relative w-16 h-16 @tablet:w-28 @tablet:h-28 rounded-2xl @tablet:rounded-3xl flex items-center justify-center text-2xl @tablet:text-5xl transition-all duration-200 ${
          isFocused ? "shadow-cel scale-105" : "shadow-md hover:shadow-cel-sm"
        }`}
        style={{
          background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
        }}
      >
        {item.type === "link" && item.bgImage ? (
          <img
            src={item.bgImage}
            alt={item.name}
            className="w-full h-full object-cover rounded-2xl @tablet:rounded-3xl drop-shadow-sm"
          />
        ) : isImageIcon(item.icon) ? (
          <img
            src={item.icon}
            alt={item.name}
            className="w-full h-full object-cover rounded-2xl @tablet:rounded-3xl drop-shadow-sm"
          />
        ) : item.icon === "rocket" || item.icon === "🚀" ? (
          <RocketLaunch weight="fill" className="w-8 h-8 @tablet:w-14 @tablet:h-14 text-white drop-shadow-sm" />
        ) : item.icon === "graduation" || item.icon === "🎓" ? (
          <GraduationCap weight="fill" className="w-8 h-8 @tablet:w-14 @tablet:h-14 text-white drop-shadow-sm" />
        ) : (
          <span className="drop-shadow-sm select-none">{item.icon}</span>
        )}

        {/* Folder badge */}
        {isFolder_ && (
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 @tablet:w-8 @tablet:h-8 rounded-full bg-aster-beige border-2 border-white shadow-sm flex items-center justify-center text-aster-accent">
            <FolderSimple weight="fill" className="w-3 h-3 @tablet:w-4 @tablet:h-4 text-aster-accent" />
          </span>
        )}
      </div>

      {/* Label */}
      <span
        className={`text-[11px] @tablet:text-base font-medium leading-tight text-center max-w-[72px] @tablet:max-w-[120px] truncate transition-colors duration-500 ${
          isFocused
            ? (isDark ? "text-stone-100 font-semibold" : "text-aster-dark font-semibold")
            : (isDark ? "text-stone-400" : "text-aster-dark/70")
        }`}
      >
        {item.name}
      </span>
    </button>
  );
});

function renderPhosphorLinkIcon(icon?: string) {
  switch (icon) {
    case "github":
      return <GithubLogo weight="bold" className="w-5 h-5 shrink-0" />;
    case "linkedin":
      return <LinkedinLogo weight="bold" className="w-5 h-5 shrink-0" />;
    case "mail":
      return <EnvelopeSimple weight="bold" className="w-5 h-5 shrink-0" />;
    case "file-pdf":
      return <FilePdf weight="bold" className="w-5 h-5 shrink-0 text-rose-500" />;
    case "file-word":
      return <FileDoc weight="bold" className="w-5 h-5 shrink-0 text-sky-500" />;
    case "file-text":
      return <FileText weight="bold" className="w-5 h-5 shrink-0 text-amber-500" />;
    case "file-code":
      return <FileCode weight="bold" className="w-5 h-5 shrink-0 text-indigo-500" />;
    case "users":
      return <Users weight="bold" className="w-5 h-5 shrink-0" />;
    case "external-link":
      return <ArrowSquareOut weight="bold" className="w-5 h-5 shrink-0" />;
    case "play":
      return <Play weight="fill" className="w-5 h-5 shrink-0" />;
    default:
      return <LinkSimple weight="bold" className="w-5 h-5 shrink-0" />;
  }
}

function PreviewVisual({
  src,
  alt,
  isDesktop,
}: {
  src: string;
  alt: string;
  isDesktop: boolean;
  isClosing?: boolean;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Lazy mount after entry transition finishes
    const timer = setTimeout(() => setShouldRender(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative overflow-hidden w-full flex justify-center items-center bg-aster-dark/[0.04] ${
        isDesktop
          ? "rounded-2xl mt-8"
          : "rounded-2xl border border-aster-dark/10 mt-8 mx-0"
      }`}
      style={{ transform: "translateZ(0)" }} // Force isolated hardware-accelerated layer
    >
      {shouldRender && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`w-full h-auto max-h-[500px] object-contain transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
        />
      )}
    </div>
  );
}

function getCategoryTag(item: DetailableItem): string {
  const map: Record<string, string> = {
    "sobre-mim": "Perfil",
    "chatbot": "Assistente",
    "asterbot": "Assistente",
    "blog": "Artigos",
    "blog-placeholder": "Artigos",
    "certificacoes": "Conquistas",
    "cert-placeholder": "Conquistas",
    "curriculo": "Documento",
    "github": "Código",
    "traducao": "Idiomas",
    "frontend": "Stack",
    "calc-dev": "Stack",
    "soul-game": "Stack",
    "pex-app": "Stack",
    "mobile": "Apps",
    "mobile-demo": "Apps",
  };
  return (map[item.id] || item.tags[0] || "Projeto").toUpperCase();
}

function DetailPanel({
  item,
  onClose,
  isDesktop,
  isClosing,
  onAnimationEnd,
  origin,
  isDark,
  language = "br",
  ui,
}: {
  item: DetailableItem;
  onClose: () => void;
  isDesktop: boolean;
  isClosing?: boolean;
  onAnimationEnd?: () => void;
  origin?: { x: string; y: string };
  isDark?: boolean;
  language?: Language;
  ui: any;
}) {
  const animClass = isClosing ? "animate-ipadAppClose" : "animate-ipadAppOpen";
  const panelBg = isDark ? 'bg-stone-900' : 'bg-aster-beige';
  const panelText = isDark ? 'text-stone-100' : 'text-aster-dark';
  const panelFaint = isDark ? 'text-stone-500' : 'text-aster-dark/40';
  const categoryTag = getCategoryTag(item);

  const containerClass = isDesktop
    ? `detail-panel-desktop absolute inset-0 z-20 flex flex-col ${panelBg} overflow-hidden ${animClass} transition-colors duration-500`
    : `detail-panel absolute inset-0 z-30 ${panelBg} flex flex-col ${animClass} transition-colors duration-500`;

  return (
    <div
      className={containerClass}
      style={{
        willChange: 'transform, opacity',
        transformOrigin: origin ? `${origin.x} ${origin.y}` : '50% 50%',
      }}
      key={item.id}
      onAnimationEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        onAnimationEnd?.();
      }}
    >
      {/* Top App Bar (Phone view) - follows FolderHeader pattern */}
      {!isDesktop && (
        <div className="flex items-center gap-2 @tablet:gap-3 px-5 @tablet:px-8 pt-12 pb-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className={`w-7 h-7 @tablet:w-9 @tablet:h-9 rounded-full flex items-center justify-center transition-colors duration-500 cursor-pointer text-sm @tablet:text-base ${
              isDark
                ? "bg-stone-700 text-stone-400 hover:bg-stone-600"
                : "bg-aster-dark/[0.06] text-aster-dark/50 hover:bg-aster-dark/10"
            }`}
            aria-label={ui?.back || "Voltar"}
          >
            <ArrowLeft weight="bold" className="w-3.5 h-3.5 @tablet:w-4 @tablet:h-4" />
          </button>
          {isImageIcon(item.icon) ? (
            <img
              src={item.icon}
              alt={item.name}
              className="w-5 h-5 @tablet:w-7 @tablet:h-7 object-contain rounded-md"
            />
          ) : (
            <div
              className="w-5 h-5 @tablet:w-7 @tablet:h-7 rounded-md flex items-center justify-center text-xs text-white"
              style={{ background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})` }}
            >
              {item.icon === "rocket" || item.icon === "🚀" ? (
                <RocketLaunch weight="fill" className="w-3.5 h-3.5 text-white" />
              ) : item.icon === "graduation" || item.icon === "🎓" ? (
                <GraduationCap weight="fill" className="w-3.5 h-3.5 text-white" />
              ) : (
                <span>{item.icon}</span>
              )}
            </div>
          )}
          <h2 className={`text-sm @tablet:text-lg font-bold tracking-tight transition-colors duration-500 ${panelText}`}>
            {item.name}
          </h2>
          <span className={`text-[10px] @tablet:text-sm font-mono tracking-wider uppercase font-semibold ml-auto transition-colors duration-500 ${panelFaint}`}>
            {categoryTag}
          </span>
        </div>
      )}

      {/* Body — unified scroll area */}
      <div
        className={`flex-1 overflow-y-auto detail-scroll-area ${
          isDesktop
            ? "ipad-content-reveal px-16 @tablet:px-24 py-12 @tablet:py-16"
            : "px-6 py-6"
        }`}
      >
        {!isDesktop && item.id === "soul-fighter-memory" ? (
          <SoulFighterPhoneCompanion
            isDark={isDark}
            language={language}
            item={item}
            categoryTag={categoryTag}
            ui={ui}
          />
        ) : !isDesktop && item.id === "ideal-calculator" ? (
          <IdealCalcPhoneCompanion
            isDark={isDark}
            language={language}
            item={item}
            categoryTag={categoryTag}
            ui={ui}
          />
        ) : (
          <>
            {/* Icon */}
            <div
              className={`relative rounded-[22.5%] flex items-center justify-center shadow-md shrink-0 mb-3 ${
                isDesktop ? "w-28 h-28 @tablet:w-32 @tablet:h-32 mb-5" : "w-20 h-20"
              }`}
              style={{
                background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
              }}
            >
              {isImageIcon(item.icon) ? (
                <img
                  src={item.icon}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-[22.5%] drop-shadow-sm"
                />
              ) : item.icon === "rocket" || item.icon === "🚀" ? (
                <RocketLaunch weight="fill" className={`text-white drop-shadow-sm ${isDesktop ? "w-14 h-14" : "w-10 h-10"}`} />
              ) : item.icon === "graduation" || item.icon === "🎓" ? (
                <GraduationCap weight="fill" className={`text-white drop-shadow-sm ${isDesktop ? "w-14 h-14" : "w-10 h-10"}`} />
              ) : (
                <span className={`drop-shadow-sm select-none ${isDesktop ? "text-5xl" : "text-4xl"}`}>
                  {item.icon}
                </span>
              )}
            </div>

            {/* Category tag */}
            <span className="text-[11px] @tablet:text-xs font-mono tracking-[0.2em] uppercase font-bold text-aster-accent mb-1 block">
              {categoryTag}
            </span>

            {/* Name */}
            <h2
              className={`font-extrabold leading-tight tracking-tight transition-colors duration-500 mb-3 ${panelText} ${
                isDesktop ? "text-4xl @tablet:text-5xl mb-4" : "text-2xl @tablet:text-3xl"
              }`}
            >
              {item.name}
            </h2>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {item.appUrl && (
                <span
                  className={`tag-chip flex items-center gap-1.5 font-bold transition-colors duration-500 ${
                    isDark
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live App
                </span>
              )}
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className={`tag-chip transition-colors duration-500 ${isDark ? 'bg-stone-700 text-stone-400' : 'bg-aster-dark/[0.07] text-aster-dark/60'}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Resumo Section */}
            <h3 className={`text-xs @tablet:text-sm font-bold uppercase tracking-widest mb-2 transition-colors duration-500 ${panelFaint}`}>
              {ui?.summary || "Resumo"}
            </h3>
            <p
              className={`leading-relaxed transition-colors duration-500 mb-6 ${isDark ? 'text-stone-300' : 'text-aster-dark/80'} ${
                isDesktop ? "text-base max-w-2xl" : "text-xs @tablet:text-sm"
              } whitespace-pre-wrap`}
            >
              {item.summary}
            </p>

            {/* Links Section */}
            {item.links.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 transition-colors duration-500 ${panelFaint}`}>
                  Links
                </h3>
                <div
                  className={`grid gap-2.5 ${
                    isDesktop ? "grid-cols-2 max-w-2xl" : "grid-cols-1"
                  }`}
                >
                  {item.links.map((link) => (
                    <a
                      key={link.title}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-500 group ${
                        isDark
                          ? "bg-stone-700/60 border-stone-600 hover:bg-stone-700"
                          : "bg-aster-beige-dark/60 border-aster-dark/[0.08] hover:bg-aster-beige-dark"
                      }`}
                    >
                      <span className="text-base flex items-center justify-center">
                        {isImageIcon(link.icon || "") ? (
                          <img src={link.icon} alt={link.title} className="w-5 h-5 object-contain" />
                        ) : (
                          renderPhosphorLinkIcon(link.icon)
                        )}
                      </span>
                      <span
                        className={`text-xs @tablet:text-sm font-medium group-hover:text-aster-accent transition-colors duration-500 ${
                          isDark ? "text-stone-300" : "text-aster-dark/80"
                        }`}
                      >
                        {link.title}
                      </span>
                      <span
                        className={`ml-auto group-hover:text-aster-accent transition-colors duration-500 text-xs ${
                          isDark ? "text-stone-600" : "text-aster-dark/30"
                        }`}
                      >
                        <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Visual */}
            {item.previewMedia && (
              <div className="mb-6">
                <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 transition-colors duration-500 ${panelFaint}`}>
                  Preview
                </h3>
                <PreviewVisual
                  src={item.previewMedia}
                  alt={`Preview de ${item.name}`}
                  isDesktop={isDesktop}
                  isClosing={isClosing}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Divisória minimalista */}
      <div className={`w-full ${isDesktop ? 'px-12 pt-1' : 'px-6 pt-1 pb-1'} shrink-0 transition-colors duration-500 ${panelBg}`}>
        <div className={`w-full h-[1px] transition-colors duration-500 ${isDark ? 'bg-stone-700' : 'bg-aster-dark/[0.08]'}`} />
      </div>

      {/* iPad physical circular home button (desktop tablet) */}
      {isDesktop && (
        <div className={`relative flex justify-center py-4 shrink-0 transition-colors duration-500 ${panelBg}`}>
          <div
            className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
              isDark
                ? "bg-gradient-to-t from-black/80 to-transparent"
                : "bg-gradient-to-t from-black/10 to-transparent"
            }`}
          />
          <button
            type="button"
            onClick={onClose}
            className={`home-btn relative z-10 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${
              isDark
                ? "bg-stone-900/50 border border-stone-700 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] hover:bg-stone-800"
                : "bg-black/[0.02] border border-aster-dark/10 shadow-[inset_0_3px_6px_rgba(0,0,0,0.08)] hover:bg-black/[0.04]"
            }`}
            aria-label={ui?.homeButton || "Botão Home"}
          />
        </div>
      )}

      {/* Bottom bar pill (phone only) */}
      {!isDesktop && (
        <div className={`shrink-0 flex justify-center pb-2.5 pt-1 transition-colors duration-500 ${panelBg}`}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Voltar ao início"
            className="group py-1 px-4 cursor-pointer"
          >
            <div className={`w-28 h-1 rounded-full transition-colors duration-500 group-hover:bg-aster-accent/60 ${isDark ? 'bg-white/20' : 'bg-aster-dark/20'}`} />
          </button>
        </div>
      )}
    </div>
  );
}

interface LiveAppFrameProps {
  item: DetailableItem;
  onClose: () => void;
  isClosing?: boolean;
  onAnimationEnd?: () => void;
  origin?: { x: string; y: string };
  isDark: boolean;
  ui?: any;
  language?: Language;
  isDesktop?: boolean;
}

function LiveAppFrame({
  item,
  onClose,
  isClosing,
  onAnimationEnd,
  origin,
  isDark,
  ui,
  language = "br",
  isDesktop = true,
}: LiveAppFrameProps) {
  const isSoulFighter = item.id === "soul-fighter-memory";
  const isIdealCalc = item.id === "ideal-calculator";
  const [activeTab, setActiveTab] = useState<"play" | "details">("play");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const isPt = language === "br" || language === "pt";

  const animClass = isDesktop
    ? isClosing
      ? "animate-ipadAppClose"
      : "animate-ipadAppOpen"
    : isClosing
    ? "animate-fadeClose"
    : "animate-fadeOpen";
  const panelBg = isDark ? "bg-stone-900" : "bg-aster-beige";
  const panelText = isDark ? "text-stone-100" : "text-aster-dark";
  const barBorder = isDark ? "border-stone-800" : "border-aster-dark/[0.08]";
  const pillBg = isDark
    ? "bg-stone-800/90 border-stone-700/80 text-stone-200"
    : "bg-white/80 border-black/[0.08] text-stone-800";

  const appUrl = item.appUrl || "#";
  const hostname = useMemo(() => {
    try {
      return new URL(appUrl).hostname;
    } catch {
      return appUrl;
    }
  }, [appUrl]);

  // Safety fallback: dismiss loading overlay after 2.5s on mobile if iframe onLoad delays
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [iframeKey]);

  // Sync fullscreen state with document
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Keyboard shortcut: Escape exits fullscreen if active
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && !isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const fullscreenClass = isFullscreen
    ? "!fixed !inset-0 !z-50 !w-screen !h-screen !rounded-none !m-0 !p-0"
    : isDesktop
    ? "absolute inset-0 z-20"
    : "absolute inset-0 z-30";

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreen
          ? fullscreenClass
          : isDesktop
          ? "detail-panel-desktop absolute inset-0 z-20"
          : "mobile-live-app absolute inset-0 z-30"
      } flex flex-col ${
        isSoulFighter ? "bg-[#0b0813]" : isIdealCalc ? "bg-[#080d0a]" : panelBg
      } overflow-hidden ${animClass} transition-colors duration-500`}
      style={
        isDesktop
          ? {
              willChange: "transform, opacity",
              transformOrigin: origin ? `${origin.x} ${origin.y}` : "50% 50%",
            }
          : undefined
      }
      key={item.id}
      onAnimationEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (isClosing) {
          onAnimationEnd?.();
        }
      }}
    >
      {/* ─── Top Window Bar / Header ─── */}
      {isSoulFighter ? (
        <div className="relative shrink-0 select-none z-10">
          {/* Top neon strip */}
          <div className="h-[2px] w-full bg-gradient-to-r from-[#ff4655] via-[#a855f7] to-[#00cec9] shadow-[0_0_8px_rgba(255,70,85,0.6)]" />

          {/* Header Row */}
          <div className={`flex items-center justify-between gap-2 px-3 sm:px-4 ${
            isDesktop ? "py-2 sm:py-2.5" : "pt-8 sm:pt-9 pb-2.5"
          } bg-[#0f0b1a] border-b border-[#ff4655]/25 shadow-[0_4px_20px_rgba(15,11,26,0.6)]`}>
            {/* Left: Back + Soul Fighter Identity */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/5 border border-white/10 text-stone-300 hover:bg-[#ff4655]/20 hover:text-white hover:border-[#ff4655]/40 shrink-0"
                aria-label={ui?.back || "Voltar"}
                title={ui?.back || "Voltar"}
              >
                <ArrowLeft weight="bold" className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={item.icon || "/icons/memory.png"}
                    alt={item.name}
                    className="w-7 h-7 object-cover rounded-lg border border-[#ff4655]/50 shadow-[0_0_10px_rgba(255,70,85,0.4)]"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ff4655] animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xs font-black tracking-wider text-white uppercase truncate font-mono">
                      SOUL FIGHTER
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-gradient-to-r from-[#ff4655] to-[#705df2] text-white font-extrabold tracking-tight">
                      ARENA
                    </span>
                  </div>
                  {isDesktop && (
                    <span className="text-[10px] text-stone-400 font-mono truncate leading-tight">
                      Memory Game Remastered
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Segmented Tabs [🎮 Jogar / 📋 Detalhes & Stack] (Desktop) */}
            {isDesktop && (
              <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveTab("play")}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === "play"
                      ? "bg-gradient-to-r from-[#ff4655] to-[#705df2] text-white shadow-[0_2px_12px_rgba(255,70,85,0.4)]"
                      : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                  }`}
                >
                  <GameController weight="fill" className="w-3.5 h-3.5" />
                  <span>{isPt ? "Jogar Arena" : "Play Arena"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === "details"
                      ? "bg-white/15 text-white border border-white/20 shadow-sm"
                      : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                  }`}
                >
                  <Info weight="bold" className="w-3.5 h-3.5" />
                  <span>{isPt ? "Detalhes & Stack" : "Specs & Stack"}</span>
                </button>
              </div>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!isDesktop && (
                <button
                  type="button"
                  onClick={() => setActiveTab((t) => (t === "play" ? "details" : "play"))}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer border ${
                    activeTab === "details"
                      ? "bg-[#ff4655]/20 text-[#ff4655] border-[#ff4655]/50"
                      : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10 hover:text-white"
                  }`}
                  title={activeTab === "play" ? (isPt ? "Ver Detalhes" : "View Specs") : (isPt ? "Jogar Arena" : "Play Arena")}
                  aria-label={activeTab === "play" ? (isPt ? "Ver Detalhes" : "View Specs") : (isPt ? "Jogar Arena" : "Play Arena")}
                >
                  {activeTab === "play" ? (
                    <Info weight="bold" className="w-4 h-4" />
                  ) : (
                    <GameController weight="fill" className="w-4 h-4 text-[#ff4655]" />
                  )}
                </button>
              )}

              {isDesktop && activeTab === "play" && (
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10 hover:text-white"
                  title={isFullscreen ? (isPt ? "Sair da Tela Cheia" : "Exit Fullscreen") : (isPt ? "Modo Tela Cheia Arcade" : "Arcade Fullscreen")}
                >
                  {isFullscreen ? (
                    <ArrowsIn weight="bold" className="w-4 h-4 text-[#ff4655]" />
                  ) : (
                    <ArrowsOut weight="bold" className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Reload */}
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setIframeKey((k) => k + 1);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10 hover:text-white"
                title={isPt ? "Recarregar" : "Reload"}
                aria-label={isPt ? "Recarregar" : "Reload"}
              >
                <ArrowCounterClockwise weight="bold" className={`w-4 h-4 ${isLoading ? "animate-spin text-[#ff4655]" : ""}`} />
              </button>

              {/* Open in new tab */}
              <a
                href={appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10 hover:text-white"
                title={isPt ? "Abrir em nova aba" : "Open in new tab"}
                aria-label={isPt ? "Abrir em nova aba" : "Open in new tab"}
              >
                <ArrowSquareOut weight="bold" className="w-4 h-4" />
              </a>

              {/* Close (Desktop) */}
              {isDesktop && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/5 border border-white/10 text-stone-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                  title={isPt ? "Fechar" : "Close"}
                  aria-label={isPt ? "Fechar" : "Close"}
                >
                  <X weight="bold" className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : isIdealCalc ? (
        <div className="relative shrink-0 select-none z-10">
          {/* Top neon strip */}
          <div className="h-[2px] w-full bg-gradient-to-r from-[#e61e2a] via-[#ff4d4d] to-[#b3141f] shadow-[0_0_8px_rgba(230,30,42,0.6)]" />

          {/* Header Row */}
          <div className={`flex items-center justify-between gap-2 px-3 sm:px-4 ${
            isDesktop ? "py-2 sm:py-2.5" : "pt-8 sm:pt-9 pb-2.5"
          } bg-[#0f0c0e] border-b border-[#e61e2a]/25 shadow-[0_4px_20px_rgba(15,12,14,0.6)]`}>
            {/* Left: Back + Ideal Calc Identity */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/5 border border-white/10 text-stone-300 hover:bg-[#e61e2a]/20 hover:text-white hover:border-[#e61e2a]/40 shrink-0"
                aria-label={ui?.back || "Voltar"}
                title={ui?.back || "Voltar"}
              >
                <ArrowLeft weight="bold" className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0 w-7 h-7 rounded-lg border border-[#e61e2a]/50 shadow-[0_0_10px_rgba(230,30,42,0.4)] bg-[#160d10] p-1 flex items-center justify-center">
                  <img
                    src={item.icon || "/icons/calculator.svg"}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#e61e2a] animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xs font-black tracking-wider text-white uppercase truncate font-mono">
                      IDEAL CALC
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-gradient-to-r from-[#e61e2a] to-[#a71d24] text-white font-extrabold tracking-tight">
                      IBGE
                    </span>
                  </div>
                  {isDesktop && (
                    <span className="text-[10px] text-stone-400 font-mono truncate leading-tight">
                      {isPt ? "Raridade Demográfica" : "Demographic Rarity"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Segmented Tabs [📊 Usar Calculadora / 📋 Detalhes & Metodologia] (Desktop) */}
            {isDesktop && (
              <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveTab("play")}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === "play"
                      ? "bg-gradient-to-r from-[#e61e2a] to-[#a71d24] text-white shadow-[0_2px_12px_rgba(230,30,42,0.4)]"
                      : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                  }`}
                >
                  <Calculator weight="fill" className="w-3.5 h-3.5" />
                  <span>{isPt ? "Usar Calculadora" : "Use Calculator"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === "details"
                      ? "bg-white/15 text-white border border-white/20 shadow-sm"
                      : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                  }`}
                >
                  <Info weight="bold" className="w-3.5 h-3.5" />
                  <span>{isPt ? "Detalhes & Metodologia" : "Specs & Methodology"}</span>
                </button>
              </div>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!isDesktop && (
                <button
                  type="button"
                  onClick={() => setActiveTab((t) => (t === "play" ? "details" : "play"))}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer border ${
                    activeTab === "details"
                      ? "bg-[#e61e2a]/20 text-[#ff4d4d] border-[#e61e2a]/50"
                      : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10 hover:text-white"
                  }`}
                  title={activeTab === "play" ? (isPt ? "Ver Detalhes" : "View Specs") : (isPt ? "Usar Calculadora" : "Use Calculator")}
                  aria-label={activeTab === "play" ? (isPt ? "Ver Detalhes" : "View Specs") : (isPt ? "Usar Calculadora" : "Use Calculator")}
                >
                  {activeTab === "play" ? (
                    <Info weight="bold" className="w-4 h-4" />
                  ) : (
                    <Calculator weight="fill" className="w-4 h-4 text-[#ff4d4d]" />
                  )}
                </button>
              )}

              {isDesktop && activeTab === "play" && (
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10 hover:text-white"
                  title={isFullscreen ? (isPt ? "Sair da Tela Cheia" : "Exit Fullscreen") : (isPt ? "Modo Tela Cheia" : "Fullscreen Mode")}
                >
                  {isFullscreen ? (
                    <ArrowsIn weight="bold" className="w-4 h-4 text-[#ff4d4d]" />
                  ) : (
                    <ArrowsOut weight="bold" className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Reload */}
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setIframeKey((k) => k + 1);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10 hover:text-white"
                title={isPt ? "Recarregar" : "Reload"}
                aria-label={isPt ? "Recarregar" : "Reload"}
              >
                <ArrowCounterClockwise weight="bold" className={`w-4 h-4 ${isLoading ? "animate-spin text-[#ff4d4d]" : ""}`} />
              </button>

              {/* Open in new tab */}
              <a
                href={appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10 hover:text-white"
                title={isPt ? "Abrir em nova aba" : "Open in new tab"}
                aria-label={isPt ? "Abrir em nova aba" : "Open in new tab"}
              >
                <ArrowSquareOut weight="bold" className="w-4 h-4" />
              </a>

              {/* Close (Desktop) */}
              {isDesktop && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/5 border border-white/10 text-stone-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                  title={isPt ? "Fechar" : "Close"}
                  aria-label={isPt ? "Fechar" : "Close"}
                >
                  <X weight="bold" className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Generic LiveAppFrame Header */
        <div
          className={`flex items-center justify-between gap-3 px-4 ${
            isDesktop ? "py-3" : "pt-8 pb-3"
          } shrink-0 border-b ${barBorder} select-none transition-colors duration-500`}
        >
          {/* Left: Close button + App Icon & Name */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                isDark
                  ? "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white"
                  : "bg-aster-dark/[0.06] text-aster-dark/60 hover:bg-aster-dark/12 hover:text-aster-dark"
              }`}
              aria-label={ui?.back || "Voltar"}
              title={ui?.back || "Voltar"}
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              {isImageIcon(item.icon) ? (
                <img
                  src={item.icon}
                  alt={item.name}
                  className="w-6 h-6 object-contain rounded-md shrink-0 shadow-sm"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs text-white shrink-0 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                  }}
                >
                  {item.icon === "rocket" || item.icon === "🚀" ? (
                    <RocketLaunch weight="fill" className="w-3.5 h-3.5 text-white" />
                  ) : item.icon === "graduation" || item.icon === "🎓" ? (
                    <GraduationCap weight="fill" className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <span>{item.icon}</span>
                  )}
                </div>
              )}
              <span className={`text-sm font-bold tracking-tight truncate ${panelText}`}>
                {item.name}
              </span>
            </div>
          </div>

          {/* Center: Address Bar Pill */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono shadow-sm max-w-sm w-full justify-center mx-2 ${pillBg}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate tracking-wide">{hostname}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0 ${
                isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-600/10 text-emerald-700"
              }`}
            >
              Live
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isDesktop && (
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isDark
                    ? "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white"
                    : "bg-aster-dark/[0.06] text-aster-dark/60 hover:bg-aster-dark/12 hover:text-aster-dark"
                }`}
                title={isFullscreen ? (isPt ? "Sair da Tela Cheia" : "Exit Fullscreen") : (isPt ? "Modo Tela Cheia" : "Fullscreen Mode")}
              >
                {isFullscreen ? (
                  <ArrowsIn weight="bold" className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ArrowsOut weight="bold" className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setIframeKey((k) => k + 1);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                isDark
                  ? "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white"
                  : "bg-aster-dark/[0.06] text-aster-dark/60 hover:bg-aster-dark/12 hover:text-aster-dark"
              }`}
              title="Recarregar aplicativo"
              aria-label="Recarregar"
            >
              <ArrowCounterClockwise
                weight="bold"
                className={`w-4 h-4 ${isLoading ? "animate-spin text-aster-accent" : ""}`}
              />
            </button>

            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                isDark
                  ? "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white"
                  : "bg-aster-dark/[0.06] text-aster-dark/60 hover:bg-aster-dark/12 hover:text-aster-dark"
              }`}
              title="Abrir em nova aba"
              aria-label="Abrir em nova aba"
            >
              <ArrowSquareOut weight="bold" className="w-4 h-4" />
            </a>

            {isDesktop && (
              <button
                type="button"
                onClick={onClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isDark
                    ? "bg-stone-800 text-stone-400 hover:bg-red-500/20 hover:text-red-400"
                    : "bg-aster-dark/[0.06] text-aster-dark/60 hover:bg-red-500/10 hover:text-red-600"
                }`}
                title="Fechar aplicativo"
                aria-label="Fechar"
              >
                <X weight="bold" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Main Body: Play Arena (Iframe) OR Details & Stack Showcase ─── */}
      <div className={`flex-1 min-h-0 relative w-full overflow-hidden ${
        isSoulFighter ? "bg-[#0b0418]" : isIdealCalc ? "bg-[#0b0a0a]" : "bg-black"
      }`}>
        <div className={`w-full flex-1 min-h-0 flex flex-col h-full ${activeTab === "play" ? "" : "hidden"}`}>
          {isLoading && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 backdrop-blur-md transition-opacity duration-300 pointer-events-none ${
              isSoulFighter
                ? "bg-[#0b0418]/85"
                : isIdealCalc
                ? "bg-[#0b0a0a]/85"
                : "bg-black/85"
            }`}>
              <div className="relative">
                <div
                  className={`w-12 h-12 border-3 border-transparent rounded-full animate-spin ${
                    isSoulFighter
                      ? "border-t-[#ff4655] border-r-[#705df2] shadow-[0_0_20px_rgba(255,70,85,0.5)]"
                      : isIdealCalc
                      ? "border-t-[#e61e2a] border-r-[#ff4d4d] shadow-[0_0_20px_rgba(230,30,42,0.5)]"
                      : "border-t-aster-accent border-r-teal-400"
                  }`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {isSoulFighter ? (
                    <Fire weight="fill" className="w-5 h-5 text-[#ff4655] animate-pulse" />
                  ) : isIdealCalc ? (
                    <Heart weight="fill" className="w-5 h-5 text-[#ff4d4d] animate-pulse" />
                  ) : (
                    <Sparkle weight="fill" className="w-5 h-5 text-aster-accent animate-pulse" />
                  )}
                </div>
              </div>
              <span className="text-xs font-mono font-bold tracking-wider text-stone-300 uppercase">
                {isSoulFighter
                  ? isPt
                    ? "Entrando na Arena Soul Fighter..."
                    : "Entering Soul Fighter Arena..."
                  : isIdealCalc
                  ? isPt
                    ? "Carregando bases e microdados do IBGE..."
                    : "Loading IBGE Datasets & Microdata..."
                  : isPt
                  ? "Carregando aplicativo..."
                  : "Loading application..."}
              </span>
            </div>
          )}

          <div
            className={`w-full flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden ${
              isSoulFighter ? "bg-[#0b0418]" : isIdealCalc ? "bg-[#0b0a0a]" : "bg-black"
            }`}
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
            }}
          >
            <iframe
              key={iframeKey}
              src={appUrl}
              title={item.name}
              className="w-full h-full min-h-full border-0 select-auto pointer-events-auto block"
              style={{
                width: "100%",
                height: "100%",
                minHeight: "100%",
                border: "none",
                pointerEvents: "auto",
                touchAction: "pan-y",
              }}
              scrolling="yes"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {/* Fullscreen Floating Exit Hint */}
          {isFullscreen && (
            <div className="absolute top-4 right-4 z-30">
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border text-xs font-mono text-white shadow-xl hover:bg-black transition-all cursor-pointer ${
                  isSoulFighter
                    ? "border-[#ff4655]/40"
                    : isIdealCalc
                    ? "border-[#e61e2a]/40"
                    : "border-white/30"
                }`}
              >
                <ArrowsIn
                  weight="bold"
                  className={`w-3.5 h-3.5 ${
                    isSoulFighter
                      ? "text-[#ff4655]"
                      : isIdealCalc
                      ? "text-[#ff4d4d]"
                      : "text-white"
                  }`}
                />
                <span>{isPt ? "Sair da Tela Cheia (ESC)" : "Exit Fullscreen (ESC)"}</span>
              </button>
            </div>
          )}
        </div>

        {activeTab === "details" && (
          isSoulFighter ? (
            <SoulFighterShowcase
              onPlayClick={() => setActiveTab("play")}
              isDark={isDark}
              item={item}
              ui={ui}
              language={language}
            />
          ) : isIdealCalc ? (
            <IdealCalcShowcase
              onPlayClick={() => setActiveTab("play")}
              isDark={isDark}
              item={item}
              ui={ui}
              language={language}
            />
          ) : null
        )}
      </div>

      {/* ─── Bottom Home Indicator Bar ─── */}
      <div
        className={`relative flex justify-center ${
          isDesktop
            ? "py-2"
            : "py-2 pb-[max(0.6rem,env(safe-area-inset-bottom,12px))]"
        } shrink-0 border-t ${
          isSoulFighter
            ? "border-[#ff4655]/20 bg-[#0f0b1a]"
            : isIdealCalc
            ? "border-[#e61e2a]/20 bg-[#0f0c0e]"
            : `${barBorder} ${panelBg}`
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="group py-1 px-8 cursor-pointer flex items-center justify-center active:scale-95 transition-transform"
          aria-label={ui?.homeButton || "Fechar"}
        >
          <div
            className={`w-32 h-1 rounded-full transition-all duration-300 ${
              isSoulFighter
                ? "bg-gradient-to-r from-[#ff4655]/40 via-[#705df2]/60 to-[#ff4655]/40 group-hover:from-[#ff4655] group-hover:to-[#705df2] group-hover:shadow-[0_0_10px_rgba(255,70,85,0.6)]"
                : isIdealCalc
                ? "bg-gradient-to-r from-[#e61e2a]/40 via-[#ff4d4d]/60 to-[#e61e2a]/40 group-hover:from-[#e61e2a] group-hover:to-[#ff4d4d] group-hover:shadow-[0_0_10px_rgba(230,30,42,0.6)]"
                : `group-hover:bg-aster-accent ${isDark ? "bg-white/20" : "bg-aster-dark/20"}`
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function HomeButton({ onClick, isDark }: { onClick: () => void; isDark: boolean }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-5 pt-3 pointer-events-none">
      <button
        type="button"
        onClick={onClick}
        className={`home-btn pointer-events-auto w-14 h-14 @tablet:w-16 @tablet:h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${isDark ? 'bg-stone-900/80 border border-stone-700 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] hover:bg-stone-800' : 'bg-aster-beige-dark/80 border border-aster-dark/10 shadow-[inset_0_3px_6px_rgba(0,0,0,0.08)] backdrop-blur-sm hover:bg-aster-beige-dark'}`}
        aria-label="Home"
      >
      </button>
    </div>
  );
}

function KeyHint({ isDesktop, isDark, ui }: { isDesktop: boolean; isDark: boolean; ui: any }) {
  if (!isDesktop) return null;

  const kbdBg = isDark ? "bg-[#181725]" : "bg-[#FBF8F0]";
  const kbdBorder = isDark ? "border-[#2A2840]" : "border-[#E3DCC8]";
  const kbdText = isDark ? "text-[#F2EFFA]" : "text-[#14131A]";
  const labelColor = isDark ? "text-[#A8A3BC]" : "text-[#6B6657]";

  return (
    <div className={`flex items-center justify-center gap-1.5 py-2.5 transition-colors duration-500 text-[10.5px] ${labelColor} select-none`}>
      <div className="flex gap-1">
        {["W", "A", "S", "D"].map((key) => (
          <kbd
            key={key}
            className={`min-w-[20px] h-5 px-1 rounded-[5px] text-[10px] font-mono font-bold flex items-center justify-center border border-b-2 transition-colors duration-500 ${kbdBg} ${kbdBorder} ${kbdText}`}
          >
            {key}
          </kbd>
        ))}
      </div>
      <span className="ml-0.5">{ui.navigate}</span>
      <kbd
        className={`px-1.5 h-5 rounded-[5px] text-[10px] font-mono font-bold flex items-center justify-center border border-b-2 transition-colors duration-500 ml-1.5 ${kbdBg} ${kbdBorder} ${kbdText}`}
      >
        Enter
      </kbd>
      <span className="ml-0.5">{ui.open}</span>
    </div>
  );
}

function SplashScreen({ isBooting, ui }: { isBooting: boolean; ui: any }) {
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    if (!isBooting) {
      const timer = setTimeout(() => setIsRendered(false), 1100);
      return () => clearTimeout(timer);
    }
  }, [isBooting]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-aster-beige flex flex-col items-center justify-center transition-opacity duration-1000 ${
        isBooting ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <span className="text-5xl text-aster-dark select-none mb-6">✦</span>
      <div className="w-5 h-5 border-[3px] border-aster-dark/20 border-t-aster-dark rounded-full animate-spin" />
      <p className="text-[10px] font-mono tracking-[0.2em] text-aster-dark/40 uppercase mt-6 animate-pulse">
        {ui.booting}
      </p>
    </div>
  );
}

function FolderHeader({
  folder,
  onBack,
  isDark,
  ui,
}: {
  folder: FolderItem;
  onBack: () => void;
  isDark: boolean;
  ui: any;
}) {
  let singular = ui.project;
  let plural = ui.projects;

  if (folder.id === "blog") {
    singular = ui.post;
    plural = ui.posts;
  } else if (folder.id === "idiomas") {
    singular = ui.lang;
    plural = ui.langs;
  } else if (folder.id === "certificacoes") {
    singular = ui.cert;
    plural = ui.certs;
  }

  const count = folder.children.length;
  const label = count === 1 ? singular : plural;

  return (
    <div className="flex items-center gap-2 @tablet:gap-3 px-5 @tablet:px-8 pt-4 @tablet:pt-6 pb-2 @tablet:pb-3">
      <button
        type="button"
        onClick={onBack}
        className={`w-7 h-7 @tablet:w-9 @tablet:h-9 rounded-full flex items-center justify-center transition-colors duration-500 cursor-pointer text-sm @tablet:text-base ${isDark ? 'bg-stone-700 text-stone-400 hover:bg-stone-600' : 'bg-aster-dark/[0.06] text-aster-dark/50 hover:bg-aster-dark/10'}`}
        aria-label={ui.back}
      >
        <ArrowLeft weight="bold" className="w-3.5 h-3.5 @tablet:w-4 @tablet:h-4" />
      </button>
      {isImageIcon(folder.icon) ? (
        <img
          src={folder.icon}
          alt={folder.name}
          className="w-5 h-5 @tablet:w-7 @tablet:h-7 object-contain rounded-md"
        />
      ) : (
        <span className="text-sm">{folder.icon}</span>
      )}
      <h2 className={`text-sm @tablet:text-lg font-bold tracking-tight transition-colors duration-500 ${isDark ? 'text-stone-100' : 'text-aster-dark'}`}>
        {folder.name}
      </h2>
      <span className={`text-[10px] @tablet:text-sm font-medium ml-auto transition-colors duration-500 ${isDark ? 'text-stone-500' : 'text-aster-dark/30'}`}>
        {count} {label}
      </span>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [phoneDetail, setPhoneDetail] = useState<DetailableItem | null>(null);
  const [isPhoneClosing, setIsPhoneClosing] = useState(false);
  const [tabletDetail, setTabletDetail] = useState<DetailableItem | null>(null);
  const [isTabletClosing, setIsTabletClosing] = useState(false);
  const [openFolder, setOpenFolder] = useState<FolderItem | null>(null);
  const [appOrigin, setAppOrigin] = useState({ x: "50%", y: "50%" });
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<TranslationDict | null>(null);

  /** Ref to the @container element that drives container queries */
  const containerRef = useRef<HTMLDivElement>(null);

  const time = useClockTime();
  const isDesktop = useIsDesktop();

  // ─── URL & Language Management ─────────────────────────────
  useEffect(() => {
    const initLanguage = async () => {
      const path = window.location.pathname;
      const pathParts = path.split('/').filter(Boolean);
      let langInPath = pathParts[0] as string;

      if (langInPath === 'pt-br') langInPath = 'br';
      else if (langInPath === 'pt-pt') langInPath = 'pt';

      let targetLang: Language = 'en';

      if (langInPath && LANGUAGES.includes(langInPath as Language)) {
        targetLang = langInPath as Language;
        localStorage.setItem('app-language', targetLang);
      } else {
        const savedLang = localStorage.getItem('app-language') as Language;
        if (savedLang && LANGUAGES.includes(savedLang)) {
          targetLang = savedLang;
        } else {
          const navLang = navigator.language.toLowerCase();
          if (navLang === 'pt-br') targetLang = 'br';
          else if (navLang === 'pt-pt' || navLang.startsWith('pt')) targetLang = 'pt';
          else if (LANGUAGES.includes(navLang as Language)) targetLang = navLang as Language;
        }
      }

      setLanguage(targetLang);
      
      const search = window.location.search;
      window.history.replaceState({}, "", `/${targetLang}/${search}`);

      try {
        const module = await import(`./locales/${targetLang}.json`);
        setTranslations(module.default || module);
      } catch (err) {
        console.error("Failed to load language file", err);
      }
    };

    initLanguage();
  }, []);

  // ─── Boot Experience ────────────────────────────────────────
  useEffect(() => {
    if (translations) {
      const timer = setTimeout(() => {
        setIsBooting(false);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [translations]);

  // WebKit/iOS touch bug workaround: activate touch gesture routing for child iframes
  useEffect(() => {
    const noop = () => {};
    window.addEventListener("touchstart", noop, { passive: true });
    return () => window.removeEventListener("touchstart", noop);
  }, []);

  const HOME_ITEMS = useMemo(() => {
    if (!translations) return [];
    return getHomeItems(language, translations.items);
  }, [language, translations]);

  const ui = useMemo(() => {
    if (!translations) return { booting: '[ ASTER_OS BOOT ]' } as any;
    return translations.ui;
  }, [translations]);

  // Update Title and HTML Lang
  useEffect(() => {
    const baseTitle = "Aster Dev · Portfolio";
    const currentDetail = phoneDetail || tabletDetail;
    if (currentDetail) {
      document.title = `${baseTitle} | ${currentDetail.name}`;
    } else {
      document.title = baseTitle;
    }
    document.documentElement.lang = language;
  }, [phoneDetail, tabletDetail, language]);

  // Update URL when language changes
  const changeLanguage = useCallback(async (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('app-language', newLang);
    
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(Boolean);
    
    let newPath = '';
    if (pathParts.length > 0 && LANGUAGES.includes(pathParts[0] as Language)) {
      pathParts[0] = newLang;
      newPath = '/' + pathParts.join('/') + '/';
    } else {
      newPath = `/${newLang}/`;
    }
    
    window.history.pushState({}, "", newPath + window.location.search);

    try {
      const module = await import(`./locales/${newLang}.json`);
      setTranslations(module.default || module);
    } catch (err) {
      console.error("Failed to load language file", err);
    }
  }, []);

  // ─── Theme helpers ────────────────────────────────────────
  const text = isDark ? 'text-stone-100' : 'text-aster-dark';
  const textFaint = isDark ? 'text-stone-500' : 'text-aster-dark/40';

  // ─── Deep Linking ──────────────────────────────────────────
  const initialDeepLinkHandled = useRef(false);
  useEffect(() => {
    if (initialDeepLinkHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const appId = params.get("app");

    if (appId && HOME_ITEMS.length > 0) {
      let foundItem: DetailableItem | null = null;
      let parentFolder: FolderItem | null = null;
      let foundIndex = 0;

      const items = HOME_ITEMS;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === appId && isDetailable(item)) {
          foundItem = item;
          foundIndex = i;
          break;
        }
        if (isFolder(item)) {
          const childIndex = item.children.findIndex((c) => c.id === appId);
          if (childIndex !== -1) {
            const child = item.children[childIndex];
            if (isDetailable(child)) {
              foundItem = child as DetailableItem;
              parentFolder = item;
              foundIndex = childIndex;
              break;
            }
          }
        }
      }

      if (foundItem) {
        if (parentFolder) {
          setOpenFolder(parentFolder);
        }
        setFocusedIndex(foundIndex);
        setPhoneDetail(foundItem);
        setTabletDetail(foundItem);
        initialDeepLinkHandled.current = true;
      }
    }
  }, [HOME_ITEMS]);

  // ─── Language Change Sync ─────────────────────────────────
  useEffect(() => {
    setOpenFolder((prev) => {
      if (!prev) return null;
      const newFolder = HOME_ITEMS.find((i) => i.id === prev.id);
      return newFolder && isFolder(newFolder) ? newFolder : prev;
    });

    const updateItemLanguage = (prev: DetailableItem | null) => {
      if (!prev) return null;
      for (const item of HOME_ITEMS) {
        if (item.id === prev.id && isDetailable(item)) {
          return item;
        }
        if (isFolder(item)) {
          const child = item.children.find((c) => c.id === prev.id);
          if (child && isDetailable(child)) {
            return child as DetailableItem;
          }
        }
      }
      return prev;
    };

    setPhoneDetail(updateItemLanguage);
    setTabletDetail(updateItemLanguage);
  }, [HOME_ITEMS]);

  /** Items currently visible in the phone grid */
  const currentItems: GridItem[] = useMemo(
    () => (openFolder ? openFolder.children : HOME_ITEMS),
    [openFolder, HOME_ITEMS]
  );

  /** Detect active column count from the @container element */
  const activeCols = useContainerCols(containerRef);

  /** Visual ↔ Logical index maps (accounts for CSS order-last on tablet) */
  const { logicalToVisual, visualToLogical } = useMemo(
    () => buildVisualMap(currentItems, activeCols, !!openFolder),
    [currentItems, activeCols, openFolder]
  );

  /** Clamped index — always safe for the current grid */
  const safeFocusedIndex = useMemo(
    () => clampIndex(focusedIndex, currentItems.length),
    [focusedIndex, currentItems.length]
  );

  // ─── Auto-scroll focused item ─────────────────────────────
  useEffect(() => {
    const focusedEl = document.querySelector('.app-icon.focused');
    if (focusedEl) {
      focusedEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [safeFocusedIndex]);

  // ─── Actions ───────────────────────────────────────────────

  const goHome = useCallback(() => {
    setOpenFolder(null);
    setFocusedIndex(0);
  }, []);

  const goBackFromFolder = useCallback(() => {
    if (openFolder) {
      const idx = HOME_ITEMS.findIndex((i) => i.id === openFolder.id);
      setFocusedIndex(idx !== -1 ? idx : 0);
    } else {
      setFocusedIndex(0);
    }
    setOpenFolder(null);
  }, [openFolder, HOME_ITEMS]);

  const closePhoneDetail = useCallback(() => {
    setIsPhoneClosing(true);
    if (!isDesktop) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [isDesktop]);

  const closeTabletDetail = useCallback(() => {
    setIsTabletClosing(true);
    if (!phoneDetail) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [phoneDetail]);

  const activateItem = useCallback(
    (item: GridItem, index: number, e?: React.MouseEvent) => {
      setFocusedIndex(index);

      // ─── Dark Mode toggle — never opens a detail panel ───
      if (item.id === 'dark-mode') {
        setIsDark(prev => !prev);
        return;
      }

      if (isLink(item)) {
        if (item.id.startsWith('lang-')) {
          const newLang = item.id.replace('lang-', '') as Language;
          if (LANGUAGES.includes(newLang)) {
            changeLanguage(newLang);
            return;
          }
        }
        window.open(item.url, "_blank", "noopener,noreferrer");
        return;
      }
      if (isFolder(item)) {
        setOpenFolder(item);
        setFocusedIndex(0);
        return;
      }
      if (isDetailable(item)) {
        // Calculate transform origin from the clicked icon's centre relative to screen container
        const el = (e?.currentTarget as HTMLElement) || document.querySelector('.app-icon.focused');
        if (el) {
          const rect = el.getBoundingClientRect();
          const container = containerRef.current || document.body;
          const cRect = container.getBoundingClientRect();
          const originX = ((rect.left + rect.width / 2 - cRect.left) / cRect.width) * 100;
          const originY = ((rect.top + rect.height / 2 - cRect.top) / cRect.height) * 100;
          setAppOrigin({
            x: `${originX.toFixed(1)}%`,
            y: `${originY.toFixed(1)}%`,
          });
        } else {
          setAppOrigin({ x: "50%", y: "50%" });
        }

        window.history.replaceState({}, '', `${window.location.pathname}?app=${item.id}`);

        // Open in phone
        setPhoneDetail(item);
        setIsPhoneClosing(false);

        // Open in tablet
        setTabletDetail(item);
        setIsTabletClosing(false);
      }
    },
    [changeLanguage]
  );

  // ─── Keyboard Navigation ──────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        if (e.key === "Escape") {
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      // Detail open on mobile — only Escape closes (or Backspace if not in chatbot)
      if (phoneDetail && !isDesktop) {
        if (e.key === "Escape" || (e.key === "Backspace" && phoneDetail.id !== "chatbot")) {
          e.preventDefault();
          closePhoneDetail();
          return;
        }

        if (["w", "W", "s", "S", "ArrowUp", "ArrowDown"].includes(e.key)) {
          e.preventDefault();
          const container = document.querySelector('.detail-scroll-area');
          if (container) {
            const amount = (e.key === "w" || e.key === "W" || e.key === "ArrowUp") ? -150 : 150;
            container.scrollBy({ top: amount });
          }
        }
        return;
      }

      // Escape on desktop — closes phone detail and tablet detail
      if (isDesktop && e.key === "Escape") {
        e.preventDefault();
        if (phoneDetail) {
          closePhoneDetail();
        }
        if (tabletDetail) {
          closeTabletDetail();
        }
        return;
      }

      const total = currentItems.length;
      const cols = activeCols;

      // Navigate in *visual* space, then map back to logical index
      const moveVisual = (logicalIdx: number, delta: number) => {
        const visualPos = logicalToVisual[logicalIdx];
        const newVisual = clampIndex(visualPos + delta, total);
        return visualToLogical[newVisual];
      };

      const keyActions: Record<string, () => void> = {
        ArrowRight: () => setFocusedIndex((i) => moveVisual(i, 1)),
        d: () => setFocusedIndex((i) => moveVisual(i, 1)),
        D: () => setFocusedIndex((i) => moveVisual(i, 1)),

        ArrowLeft: () => setFocusedIndex((i) => moveVisual(i, -1)),
        a: () => setFocusedIndex((i) => moveVisual(i, -1)),
        A: () => setFocusedIndex((i) => moveVisual(i, -1)),

        ArrowDown: () =>
          setFocusedIndex((i) => moveVisual(i, cols)),
        s: () => setFocusedIndex((i) => moveVisual(i, cols)),
        S: () => setFocusedIndex((i) => moveVisual(i, cols)),

        ArrowUp: () =>
          setFocusedIndex((i) => moveVisual(i, -cols)),
        w: () => setFocusedIndex((i) => moveVisual(i, -cols)),
        W: () => setFocusedIndex((i) => moveVisual(i, -cols)),

        Enter: () => {
          const item = currentItems[safeFocusedIndex];
          if (item) activateItem(item, safeFocusedIndex, undefined);
        },

        Escape: () => {
          if (openFolder) {
            goBackFromFolder();
          }
        },

        Backspace: () => {
          if (openFolder) {
            goBackFromFolder();
          }
        },
      };

      const action = keyActions[e.key];
      if (action) {
        e.preventDefault();
        action();
      }
    },
    [
      phoneDetail,
      tabletDetail,
      isDesktop,
      currentItems,
      activeCols,
      logicalToVisual,
      visualToLogical,
      safeFocusedIndex,
      openFolder,
      closePhoneDetail,
      closeTabletDetail,
      activateItem,
      goBackFromFolder,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ─── Phone Screen Content ─────────────────────────────────

  const phoneContent = (
    <>
      {/* Dynamic Island (hide on mobile when app overlay is active) */}
      {(!phoneDetail || isDesktop) && (
        <div className="phone-island" aria-hidden="true"><span /></div>
      )}

      {/* Status Bar (hide on mobile when app overlay is active) */}
      {(!phoneDetail || isDesktop) && (
        <StatusBar time={time} isDark={isDark} />
      )}

      <div
        className={`home-view flex-1 flex flex-col ${
          phoneDetail && !isPhoneClosing ? "away" : ""
        }`}
      >
        {/* Header / Folder header */}
        {openFolder ? (
        <FolderHeader folder={openFolder} onBack={goBackFromFolder} isDark={isDark} ui={ui} />
      ) : (
        <div className="px-5 @tablet:px-8 pt-4 @tablet:pt-6 pb-2 @tablet:pb-3">
          <div className="flex items-center gap-2 @tablet:gap-3 mb-1">
            <div className="w-2 h-2 @tablet:w-3 @tablet:h-3 rounded-full bg-aster-accent animate-pulse" />
            <h1 className={`text-lg @tablet:text-2xl font-extrabold tracking-tight transition-colors duration-500 ${text}`}>
              Aster<span className="text-aster-accent">Dev</span>
            </h1>
          </div>
          <p className={`text-[11px] @tablet:text-sm font-medium tracking-wide transition-colors duration-500 ${textFaint}`}>
            Frontend &amp; Mobile Development
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 px-4 @tablet:px-8 py-3 @tablet:py-6 overflow-y-auto">
        <div className="grid grid-cols-3 @[640px]:grid-cols-4 gap-3 @[640px]:gap-5 justify-items-center">
          {currentItems.map((item, index) => {
            const displayItem = getDarkModeItem(item, isDark);
            return (
              <GridIcon
                key={item.id}
                item={displayItem}
                isFocused={safeFocusedIndex === index}
                onClick={(e) => activateItem(item, index, e)}
                onHover={() => setFocusedIndex(index)}
                isDark={isDark}
                extraClassName={
                  item.id === 'dark-mode' && !openFolder
                    ? '@[640px]:order-last'
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>

      {/* Key hints (desktop only) */}
      <KeyHint isDesktop={isDesktop} isDark={isDark} ui={ui} />

      {/* Bottom bar (desktop only) */}
      {isDesktop && (
        <div className="flex justify-center pb-3 pt-1">
          <div className={`w-28 h-1 rounded-full transition-colors duration-500 ${isDark ? 'bg-white/20' : 'bg-aster-dark/15'}`} />
        </div>
      )}

      {/* Divisória minimalista (Mobile Home) */}
      {!isDesktop && (
        <div className="w-full px-6 pt-1 pb-3 shrink-0 transition-colors duration-500">
          <div className={`w-full h-[1px] transition-colors duration-500 ${isDark ? 'bg-stone-700' : 'bg-aster-dark/[0.08]'}`} />
        </div>
      )}

      {/* Mobile Safe Area with texture for floating home button */}
      {!isDesktop && (
        <div className="relative h-20 shrink-0 w-full">
          <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${isDark ? 'bg-gradient-to-t from-black/80 to-transparent' : 'bg-gradient-to-t from-black/10 to-transparent'}`} />
        </div>
      )}
      </div>
      
      {/* Detail Panel / ChatBot / LiveAppFrame as overlay (MOBILE & DESKTOP PHONE) */}
      {phoneDetail && (
        phoneDetail.id === "chatbot" ? (
          <ChatBot
            onClose={closePhoneDetail}
            isDesktop={false}
            isClosing={isPhoneClosing}
            onAnimationEnd={
              isPhoneClosing
                ? () => {
                    setPhoneDetail(null);
                    setIsPhoneClosing(false);
                  }
                : undefined
            }
            origin={appOrigin}
            isDark={isDark}
            language={language}
            ui={ui}
          />
        ) : !isDesktop && phoneDetail.appUrl ? (
          <LiveAppFrame
            item={phoneDetail}
            onClose={closePhoneDetail}
            isDesktop={false}
            isClosing={isPhoneClosing}
            onAnimationEnd={
              isPhoneClosing
                ? () => {
                    setPhoneDetail(null);
                    setIsPhoneClosing(false);
                  }
                : undefined
            }
            origin={appOrigin}
            isDark={isDark}
            language={language}
            ui={ui}
          />
        ) : (
          <DetailPanel
            item={phoneDetail}
            onClose={closePhoneDetail}
            isDesktop={false}
            isClosing={isPhoneClosing}
            onAnimationEnd={
              isPhoneClosing
                ? () => {
                    setPhoneDetail(null);
                    setIsPhoneClosing(false);
                  }
                : undefined
            }
            origin={appOrigin}
            isDark={isDark}
            language={language}
            ui={ui}
          />
        )
      )}
    </>
  );

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className={`h-[100dvh] w-full relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-aster-dark is-dark dark' : 'bg-aster-beige is-light light'}`}>
      <SplashScreen isBooting={isBooting} ui={ui} />

      {/* Ambient glows (desktop only) */}
      {isDesktop && (
        <>
          <div
            className="ambient-glow"
            style={{ top: "-10%", left: "20%", background: "#6c63ff" }}
          />
          <div
            className="ambient-glow"
            style={{ bottom: "-10%", right: "15%", background: "#00cec9" }}
          />
        </>
      )}

      {/* ── MOBILE LAYOUT ── */}
      {!isDesktop && (
        <div ref={containerRef} className={`@container w-full h-[100dvh] flex flex-col relative transition-colors duration-500 ${isDark ? 'bg-stone-900' : 'bg-aster-beige'}`}>
          {phoneContent}
          {/* Floating home button — visible on home, folders, and standard info details; hidden during live iframe apps */}
          {(!phoneDetail || !phoneDetail.appUrl) && (
            <HomeButton
              isDark={isDark}
              onClick={
                phoneDetail
                  ? closePhoneDetail
                  : openFolder
                  ? goBackFromFolder
                  : goHome
              }
            />
          )}
        </div>
      )}

      {/* ── DESKTOP LAYOUT ── */}
      {isDesktop && (
        <div className="h-screen w-full flex items-center justify-center gap-10 px-10 py-8 relative z-10">
          {/* Brand watermark */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 select-none">
            <span className={`text-xs font-mono tracking-[0.3em] uppercase transition-colors duration-500 ${isDark ? 'text-white/10' : 'text-aster-dark/20'}`}>
              Aster Dev
            </span>
          </div>

          {/* Phone (left) */}
          <div className={`phone-shell flex-shrink-0 w-[340px] h-[700px] relative z-10 ${isDark ? 'is-dark' : 'is-light'}`}>
            <div ref={containerRef} className={`@container phone-screen w-full h-full flex flex-col relative transition-colors duration-500 ${isDark ? 'bg-stone-900' : 'bg-aster-beige'}`}>
              {phoneContent}
            </div>
          </div>

          {/* Detail Panel (right) — iPad shell frame */}
          <div className="flex-1 max-w-[1400px] h-[750px] relative z-10">
            <div className={`ipad-shell w-full h-full ${isDark ? 'is-dark' : 'is-light'}`}>
              <div className={`@container ipad-screen relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-stone-900' : 'bg-aster-beige'}`}>
                {/* Empty State — wallpaper, fills 100% */}
                <div
                  className={`h-full w-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
                    tabletDetail
                      ? "opacity-0 scale-[0.97] pointer-events-none"
                      : "opacity-100 scale-100"
                  }`}
                >
                  {/* Decorative ambient circles */}
                  <div className="absolute top-10 right-16 w-40 h-40 rounded-full bg-aster-accent/[0.04] blur-2xl pointer-events-none" />
                  <div className="absolute bottom-16 left-12 w-56 h-56 rounded-full bg-[#00cec9]/[0.03] blur-3xl pointer-events-none" />

                  {/* Logo mark */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-aster-accent/20 to-aster-accent/5 border border-aster-accent/10 flex items-center justify-center shadow-lg">
                      <span className="text-4xl select-none">✦</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-aster-accent/60 animate-pulse" />
                  </div>

                  {/* Welcome copy */}
                  <h2 className={`text-2xl font-bold tracking-tight mb-2 transition-colors duration-500 ${isDark ? 'text-white/80' : 'text-aster-dark'}`}>
                    {ui.welcomeTitle} <span className="text-aster-accent">AsterDev</span>
                  </h2>
                  <p className={`text-sm font-medium max-w-sm text-center leading-relaxed mb-6 transition-colors duration-500 ${isDark ? 'text-white/30' : 'text-aster-dark/60'}`}>
                    {ui.welcomeSubtitle}
                  </p>

                  {/* Interaction hint */}
                  <div
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] border transition-colors duration-500 select-none ${
                      isDark
                        ? "bg-[#181725] border-[#2A2840] text-[#A8A3BC]"
                        : "bg-[#FBF8F0] border-[#E3DCC8] text-[#6B6657]"
                    } text-xs`}
                  >
                    <div className="flex gap-1">
                      {["W", "A", "S", "D"].map((key) => (
                        <kbd
                          key={key}
                          className={`min-w-[20px] h-5 px-1 rounded-[5px] text-[10px] font-mono font-bold flex items-center justify-center border border-b-2 transition-colors duration-500 ${
                            isDark
                              ? "bg-[#181725] border-[#2A2840] text-[#F2EFFA]"
                              : "bg-[#FBF8F0] border-[#E3DCC8] text-[#14131A]"
                          }`}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                    <span className="ml-0.5">{ui.navigate}</span>
                    <kbd
                      className={`px-1.5 h-5 rounded-[5px] text-[10px] font-mono font-bold flex items-center justify-center border border-b-2 transition-colors duration-500 ml-1.5 ${
                        isDark
                          ? "bg-[#181725] border-[#2A2840] text-[#F2EFFA]"
                          : "bg-[#FBF8F0] border-[#E3DCC8] text-[#14131A]"
                      }`}
                    >
                      Enter
                    </kbd>
                    <span className="ml-0.5">{ui.open}</span>
                  </div>

                  {/* Tagline */}
                  <p className={`text-[10px] font-mono tracking-widest uppercase mt-8 transition-colors duration-500 ${isDark ? 'text-white/[0.08]' : 'text-aster-dark/20'}`}>
                    Frontend · Mobile · Design
                  </p>
                </div>

                {/* DetailPanel / ChatBot / LiveAppFrame — absolute overlay, covers the full screen */}
                {tabletDetail && (
                  tabletDetail.id === "chatbot" ? (
                    <ChatBot
                      onClose={closeTabletDetail}
                      isDesktop
                      isClosing={isTabletClosing}
                      onAnimationEnd={
                        isTabletClosing
                          ? () => {
                              setTabletDetail(null);
                              setIsTabletClosing(false);
                            }
                          : undefined
                      }
                      origin={appOrigin}
                      isDark={isDark}
                      language={language}
                      ui={ui}
                    />
                  ) : tabletDetail.appUrl ? (
                    <LiveAppFrame
                      item={tabletDetail}
                      onClose={closeTabletDetail}
                      isClosing={isTabletClosing}
                      onAnimationEnd={
                        isTabletClosing
                          ? () => {
                              setTabletDetail(null);
                              setIsTabletClosing(false);
                            }
                          : undefined
                      }
                      origin={appOrigin}
                      isDark={isDark}
                      language={language}
                      ui={ui}
                      isDesktop={true}
                    />
                  ) : (
                    <DetailPanel
                      item={tabletDetail}
                      onClose={closeTabletDetail}
                      isDesktop
                      isClosing={isTabletClosing}
                      onAnimationEnd={
                        isTabletClosing
                          ? () => {
                              setTabletDetail(null);
                              setIsTabletClosing(false);
                            }
                          : undefined
                      }
                      origin={appOrigin}
                      isDark={isDark}
                      language={language}
                      ui={ui}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Bottom brand */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center z-10 select-none">
            <p className={`text-[10px] font-mono tracking-widest uppercase transition-colors duration-500 ${isDark ? 'text-white/[0.06]' : 'text-aster-dark/20'}`}>
              Portfolio
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
