import { useState } from "react";
import {
  Play,
  GithubLogo,
  ArrowSquareOut,
  Cpu,
  Sparkle,
  ShieldCheck,
  Globe,
  ArrowsOut,
  ArrowLeft,
  ArrowRight,
  X,
  ChartBar,
  Calculator,
  Database,
  ShareNetwork,
  UsersThree,
  Heart,
  Sliders,
} from "@phosphor-icons/react";
import type { DetailableItem, Language } from "../data/aster";

interface IdealCalcShowcaseProps {
  onPlayClick: () => void;
  isDark?: boolean;
  item: DetailableItem;
  ui?: any;
  language?: Language;
}

interface GalleryScreen {
  id: string;
  titlePt: string;
  titleEn: string;
  descPt: string;
  descEn: string;
  badge: string;
  image: string;
}

const GALLERY_SCREENS: GalleryScreen[] = [
  {
    id: "filters",
    titlePt: "Painel de Parâmetros & Filtros",
    titleEn: "Parameter Panel & 12 Filters",
    descPt: "12 critérios demográficos simultâneos: gênero, região, faixa etária, renda, altura, raça, estado civil, escolaridade e estilo de vida.",
    descEn: "12 simultaneous demographic filters: gender, state/region, age brackets, income, height, race, marital status, and habits.",
    badge: "Filtros Interativos",
    image: "/previews/idealcalc-filters.png",
  },
  {
    id: "results",
    titlePt: "Resultado em Tempo Real & Detalhamento",
    titleEn: "Real-Time Odds & Breakdown",
    descPt: "Cálculo instantâneo do percentual do mercado disponível, odds relativas ('1 em cada N mulheres/homens') e taxa de aprovação por filtro.",
    descEn: "Instant available market percentage, odds ratio, estimated absolute population, and filter-by-filter pass rates.",
    badge: "Motor Estatístico",
    image: "/previews/idealcalc-results.png",
  },
  {
    id: "card",
    titlePt: "Card Viral & Diagnóstico",
    titleEn: "Viral Scorecard & Sharing",
    descPt: "Geração de cartão estilizado via Canvas com diagnóstico de raridade ('A Raridade do Meu Tipo' / 'Nível: Coração de Mãe') pronto para redes sociais.",
    descEn: "Dynamic Canvas scorecard diagnosing partner rarity ('A Raridade do Meu Tipo') ready to download and share.",
    badge: "Card Viral",
    image: "/previews/idealcalc-card.png",
  },
  {
    id: "sources",
    titlePt: "Auditoria de Dados & Transparência IBGE",
    titleEn: "Data Audit & IBGE Transparency",
    descPt: "Transparência total e rastreabilidade: cruzamento de microdados públicos do Censo Demográfico 2022, PNAD Contínua 2023 e POF 2017-2018.",
    descEn: "Transparent dataset audit cross-referencing Census 2022, continuous PNAD 2023, and POF 2017-2018 official microdata.",
    badge: "Auditoria IBGE",
    image: "/previews/idealcalc-sources.png",
  },
];

export function IdealCalcShowcase({
  onPlayClick,
  item,
  language = "br",
}: IdealCalcShowcaseProps) {
  const isPt = language === "br" || language === "pt";
  const [selectedScreenId, setSelectedScreenId] = useState<string>("filters");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const appUrl = item.appUrl || "https://idealcalc.asterdev.me/";
  const githubUrl =
    item.links.find(
      (l) =>
        l.icon === "file-code" ||
        l.title.toLowerCase().includes("código") ||
        l.title.toLowerCase().includes("source")
    )?.url || "https://github.com/zAstergun/ideal-calculator";

  const activeScreen =
    GALLERY_SCREENS.find((s) => s.id === selectedScreenId) || GALLERY_SCREENS[0];

  return (
    <div className="w-full h-full overflow-y-auto detail-scroll-area bg-[#0b0a0a] text-[#f0ede8] select-text p-5 sm:p-6 md:p-8 lg:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* ─── Hero Banner Stealth Carmesim ─── */}
        <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden border border-[#e61e2a]/30 bg-gradient-to-br from-[#1a0a0f] via-[#12070a] to-[#080708] shadow-[0_12px_40px_rgba(230,30,42,0.18)]">
          {/* Ambient decorative crimson glows */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#e61e2a]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#ff4d4d]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-[#e61e2a]/60 shadow-[0_0_24px_rgba(230,30,42,0.35)] bg-[#14080c] p-3 flex items-center justify-center">
                <img
                  src={item.icon || "/icons/calculator.svg"}
                  alt="Ideal Calc"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(230,30,42,0.5)]"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#e61e2a] to-[#a71d24] text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                LIVE APP
              </span>
            </div>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.8 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#e61e2a]/15 text-[#ff4d4d] border border-[#e61e2a]/30 shadow-[0_0_12px_rgba(230,30,42,0.2)]">
                  <Heart weight="fill" className="w-3.5 h-3.5 text-[#ff4d4d]" />
                  Dark Stealth · Carmesim
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white/5 text-stone-300 border border-white/10">
                  IBGE Censo 2022
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white/5 text-stone-300 border border-white/10">
                  PNAD Contínua 2023
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Ideal Calc:{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#ff4d4d] to-[#e61e2a]">
                  Calculadora de Raridade de Parceiros
                </span>
              </h1>

              <p className="mt-2.5 text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
                {isPt
                  ? "Aplicação estatística que cruza 12 filtros demográficos com as bases oficiais do IBGE para quantificar a raridade real de encontrar o parceiro ideal no Brasil. Cálculo matemático de probabilidade composta em tempo real, interface brutalista moderna em carbono e carmesim, sem dependências pesadas e com exportação de card viral."
                  : "High-precision demographic calculator cross-referencing 12 demographic filters with official Brazilian IBGE census datasets to quantify the real rarity of finding an ideal partner. Real-time compound probability engine, modern dark carbon & crimson UI, zero heavy dependencies, and viral scorecard export."}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onPlayClick}
                  className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#e61e2a] to-[#a71d24] hover:from-[#ff3344] hover:to-[#c41825] shadow-[0_4px_20px_rgba(230,30,42,0.4)] transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <Play weight="fill" className="w-4 h-4" />
                  {isPt ? "Usar Calculadora (Abrir Agora)" : "Use Calculator (Live App)"}
                </button>

                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-stone-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  <GithubLogo weight="bold" className="w-4 h-4" />
                  {isPt ? "Código no GitHub" : "View Source"}
                </a>

                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-stone-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  <ArrowSquareOut weight="bold" className="w-4 h-4" />
                  {isPt ? "Abrir em Nova Aba" : "Open Standalone"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Modern Key Metrics ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#121012]/90 border border-[#e61e2a]/20 flex flex-col justify-between hover:border-[#e61e2a]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#ff4d4d] uppercase font-bold tracking-wider">
                Filtros
              </span>
              <Sliders weight="fill" className="w-4 h-4 text-[#ff4d4d]" />
            </div>
            <div className="text-xl md:text-2xl font-black text-white">12 Critérios</div>
            <p className="text-[11px] text-stone-400 mt-1">
              {isPt ? "Gênero, idade, renda, altura e hábitos" : "Gender, age, income, height & habits"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#121012]/90 border border-[#e61e2a]/20 flex flex-col justify-between hover:border-[#e61e2a]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#ff4d4d] uppercase font-bold tracking-wider">
                Base Estatística
              </span>
              <Database weight="fill" className="w-4 h-4 text-[#ff4d4d]" />
            </div>
            <div className="text-xl md:text-2xl font-black text-white">IBGE Oficial</div>
            <p className="text-[11px] text-stone-400 mt-1">
              {isPt ? "Censo 2022 + PNAD Contínua 2023" : "Census 2022 & PNAD 2023 datasets"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#121012]/90 border border-[#e61e2a]/20 flex flex-col justify-between hover:border-[#e61e2a]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#ff4d4d] uppercase font-bold tracking-wider">
                Performance
              </span>
              <Cpu weight="fill" className="w-4 h-4 text-[#ff4d4d]" />
            </div>
            <div className="text-xl md:text-2xl font-black text-white">&lt; 16ms</div>
            <p className="text-[11px] text-stone-400 mt-1">
              {isPt ? "Zero backend · 100% Client-Side" : "Zero backend latency · Client-Side"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#121012]/90 border border-[#e61e2a]/20 flex flex-col justify-between hover:border-[#e61e2a]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#ff4d4d] uppercase font-bold tracking-wider">
                Compartilhamento
              </span>
              <ShareNetwork weight="bold" className="w-4 h-4 text-[#ff4d4d]" />
            </div>
            <div className="text-xl md:text-2xl font-black text-white">Card Viral</div>
            <p className="text-[11px] text-stone-400 mt-1">
              {isPt ? "Renderização Canvas de alta resolução" : "High-res dynamic Canvas scorecard"}
            </p>
          </div>
        </div>

        {/* ─── Galeria Interativa com Capturas Reais ─── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkle weight="fill" className="w-4 h-4 text-[#ff4d4d]" />
              <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-white">
                {isPt ? "Galeria do Aplicativo (Telas Oficiais)" : "Application Gallery (Official Screens)"}
              </h2>
            </div>
            <span className="text-[11px] text-stone-400">
              {isPt ? "Selecione uma área para inspecionar:" : "Select a section to inspect:"}
            </span>
          </div>

          {/* Screen Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GALLERY_SCREENS.map((screen) => {
              const isSelected = screen.id === selectedScreenId;
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setSelectedScreenId(screen.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#e61e2a]/15 border-[#e61e2a]/60 text-white shadow-[0_0_16px_rgba(230,30,42,0.25)] ring-1 ring-[#e61e2a]/50"
                      : "bg-[#121012] border-white/10 text-stone-400 hover:border-white/20 hover:text-stone-200"
                  }`}
                >
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded mb-1.5 ${
                      isSelected
                        ? "bg-[#e61e2a] text-white"
                        : "bg-white/10 text-stone-300"
                    }`}
                  >
                    {screen.badge}
                  </span>
                  <span className="text-xs font-bold truncate w-full">
                    {isPt ? screen.titlePt : screen.titleEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Screen Display Card */}
          <div className="rounded-3xl overflow-hidden border border-[#e61e2a]/30 bg-[#0e0c0e] relative group shadow-2xl">
            {/* Top description row */}
            <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/[0.08] bg-black/40">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e61e2a] animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-white uppercase font-mono tracking-wider truncate">
                    {isPt ? activeScreen.titlePt : activeScreen.titleEn}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/10 text-stone-300 shrink-0">
                    {activeScreen.badge}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5 truncate">
                  {isPt ? activeScreen.descPt : activeScreen.descEn}
                </p>
              </div>

              {/* Actions: Zoom & Play */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                  title={isPt ? "Ampliar captura em alta resolução" : "Zoom screenshot"}
                >
                  <ArrowsOut weight="bold" className="w-3.5 h-3.5 text-[#ff4d4d]" />
                  <span>{isPt ? "Ampliar" : "Zoom"}</span>
                </button>

                <button
                  type="button"
                  onClick={onPlayClick}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#e61e2a] to-[#a71d24] hover:from-[#ff3344] hover:to-[#c41825] shadow-[0_2px_12px_rgba(230,30,42,0.4)] transition-all cursor-pointer active:scale-95"
                  title={isPt ? "Abrir calculadora interativa" : "Open live calculator"}
                >
                  <Calculator weight="fill" className="w-3.5 h-3.5" />
                  <span>{isPt ? "Abrir App" : "Use App"}</span>
                </button>
              </div>
            </div>

            {/* High-Resolution Screenshot Frame with Zoom-on-Click */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative cursor-zoom-in overflow-hidden aspect-[16/9] max-h-[380px] w-full flex items-center justify-center bg-black/80"
              title={isPt ? "Clique para inspecionar em tela cheia" : "Click to view full screenshot"}
            >
              <img
                key={activeScreen.image}
                src={activeScreen.image}
                alt={activeScreen.titleEn}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a0a] via-transparent to-black/20 opacity-40 group-hover:opacity-20 transition-opacity" />

              {/* Viewfinder Badges */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono text-stone-200 shadow-lg pointer-events-none">
                <Sparkle weight="fill" className="w-3 h-3 text-[#ff4d4d]" />
                <span>{isPt ? "Captura da Interface Oficial · HD" : "Official Interface Capture · HD"}</span>
              </div>

              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono text-[#ff4d4d] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ArrowsOut weight="bold" className="w-3 h-3 text-[#ff4d4d]" />
                <span>{isPt ? "Clique para ampliar" : "Click to expand"}</span>
              </div>

              {/* Viewfinder corners */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#e61e2a]/60 pointer-events-none" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#e61e2a]/60 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#e61e2a]/60 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#e61e2a]/60 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ─── Lightbox Modal para Inspecionar em Alta Resolução ─── */}
        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div
              className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-[#0e0c0e] border border-[#e61e2a]/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(230,30,42,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e61e2a] animate-pulse shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider truncate">
                    {isPt ? activeScreen.titlePt : activeScreen.titleEn}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-stone-300 shrink-0">
                    {activeScreen.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLightboxOpen(false);
                      onPlayClick();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#e61e2a] to-[#a71d24] hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    <Calculator weight="fill" className="w-3.5 h-3.5" />
                    <span>{isPt ? "Abrir App" : "Use App"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    title={isPt ? "Fechar" : "Close"}
                  >
                    <X weight="bold" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lightbox Image View with Prev/Next Controls */}
              <div className="relative flex-1 min-h-0 flex items-center justify-center bg-black/85 overflow-hidden p-2 sm:p-4">
                <img
                  src={activeScreen.image}
                  alt={activeScreen.titleEn}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
                />

                {/* Prev Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = GALLERY_SCREENS.findIndex((s) => s.id === selectedScreenId);
                    const prevIndex = (currentIndex - 1 + GALLERY_SCREENS.length) % GALLERY_SCREENS.length;
                    setSelectedScreenId(GALLERY_SCREENS[prevIndex].id);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/70 hover:bg-[#e61e2a] border border-white/20 text-white transition-all cursor-pointer shadow-lg"
                  title={isPt ? "Tela anterior" : "Previous screen"}
                >
                  <ArrowLeft weight="bold" className="w-5 h-5" />
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = GALLERY_SCREENS.findIndex((s) => s.id === selectedScreenId);
                    const nextIndex = (currentIndex + 1) % GALLERY_SCREENS.length;
                    setSelectedScreenId(GALLERY_SCREENS[nextIndex].id);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/70 hover:bg-[#e61e2a] border border-white/20 text-white transition-all cursor-pointer shadow-lg"
                  title={isPt ? "Próxima tela" : "Next screen"}
                >
                  <ArrowRight weight="bold" className="w-5 h-5" />
                </button>
              </div>

              {/* Lightbox Footer */}
              <div className="px-4 py-2.5 bg-black/50 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                <span className="truncate max-w-md">
                  {isPt ? activeScreen.descPt : activeScreen.descEn}
                </span>
                <span className="font-mono text-[11px] shrink-0 text-stone-400">
                  {GALLERY_SCREENS.findIndex((s) => s.id === selectedScreenId) + 1} / {GALLERY_SCREENS.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Destaques Técnicos & Metodologia ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#121012] border border-[#e61e2a]/20 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck weight="bold" className="w-5 h-5 text-[#ff4d4d]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {isPt ? "Metodologia Estatística do IBGE" : "IBGE Statistical Methodology"}
              </h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {isPt
                ? "Os cálculos são estruturados sobre o Teorema da Probabilidade Condicional e tabelas de contingência multidimensionais extraídas do Censo 2022 e PNAD 2023. As correlações entre renda, nível de escolaridade e faixa etária são calibradas para evitar distorções de independência ingênua."
                : "Calculations rely on conditional probability matrices and multidimensional contingency tables derived from the 2022 Census and 2023 PNAD. Correlations between income, education level, and age brackets are calibrated to prevent naive independence distortion."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121012] border border-[#e61e2a]/20 space-y-3">
            <div className="flex items-center gap-2">
              <Cpu weight="bold" className="w-5 h-5 text-[#ff4d4d]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {isPt ? "Arquitetura Zero-Dependências" : "Zero-Dependency Architecture"}
              </h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {isPt
                ? "Construído em Vanilla JavaScript puro de altíssima performance. Todas as tabelas de referência foram compactadas em estruturas binárias leves diretamente no cliente, garantindo que cada mudança nos sliders atualize o resultado em menos de 16 milissegundos sem chamadas de rede."
                : "Engineered in pure, high-performance Vanilla JavaScript. All reference datasets were compressed into lightweight client structures, ensuring every slider drag updates results in under 16 milliseconds with zero network requests."}
            </p>
          </div>
        </div>

        {/* ─── Footer com Links Oficiais ─── */}
        <div className="p-6 rounded-2xl bg-[#121012] border border-[#e61e2a]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Globe weight="bold" className="w-5 h-5 text-[#ff4d4d] shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                idealcalc.asterdev.me
              </span>
              <span className="text-[11px] text-stone-400">
                {isPt
                  ? "Hospedado na Cloudflare com HTTPS e compressão Brotli"
                  : "Hosted on Cloudflare with HTTPS and Brotli compression"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-stone-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white transition-all cursor-pointer"
            >
              GitHub ↗
            </a>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-gradient-to-r from-[#e61e2a] to-[#a71d24] hover:opacity-90 shadow-sm transition-all cursor-pointer"
            >
              idealcalc.asterdev.me ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
