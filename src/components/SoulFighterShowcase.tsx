import { useState } from "react";
import {
  Play,
  GithubLogo,
  ArrowSquareOut,
  Cpu,
  SpeakerHigh,
  Sparkle,
  ShieldCheck,
  Code,
  Fire,
  Heart,
  Lightbulb,
  Globe,
  ArrowsOut,
  ArrowLeft,
  ArrowRight,
  X,
  GameController,
} from "@phosphor-icons/react";
import type { DetailableItem, Language } from "../data/aster";

interface SoulFighterShowcaseProps {
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
    id: "gameplay",
    titlePt: "Arena de Batalha (In-Game)",
    titleEn: "Combat Arena (In-Game)",
    descPt: "Tabuleiro com cartas em 3D flip, boss Shaco no topo, medidor de vidas, combos dinâmicos e sistema de dicas.",
    descEn: "Full battle board with 3D card flips, Shaco boss, HP life counter, dynamic combos, and hint assist.",
    badge: "Gameplay Ativo",
    image: "/previews/soulfighter-gameplay.webp",
  },
  {
    id: "ranking",
    titlePt: "Ranking Global & Leaderboard",
    titleEn: "Global Ranking & Leaderboard",
    descPt: "Tabela de classificação competitiva em tempo real integrada com Aster Account e selos de cada modalidade.",
    descEn: "Real-time competitive leaderboard with Aster Account integration, difficulty badges, and best time records.",
    badge: "Nuvem & Ranking",
    image: "/previews/soulfighter-ranking.webp",
  },
  {
    id: "howtoplay",
    titlePt: "Manual da Arena & Regras",
    titleEn: "Combat Rules & Guide",
    descPt: "Apresentação das mecânicas: modos de jogo, espiadinha inicial, penalidades de K.O. e multiplicadores de pontuação.",
    descEn: "Complete rules breakdown: 4 game modes, initial peek preview, K.O. life penalties, and score multipliers.",
    badge: "Regras Oficiais",
    image: "/previews/soulfighter-howtoplay.webp",
  },
  {
    id: "lobby",
    titlePt: "Lobby do Torneio Remastered",
    titleEn: "Tournament Lobby Remastered",
    descPt: "Seleção de identidade na arena (Convidado ou Aster Account), 10 lutadores em destaque e escolha de dificuldade.",
    descEn: "Arena identity selection (Guest or Aster Account), showcase of all 10 fighters, and mode configurations.",
    badge: "Menu Principal",
    image: "/previews/soulfighter-lobby.webp",
  },
];

export function SoulFighterShowcase({
  onPlayClick,
  item,
  language = "br",
}: SoulFighterShowcaseProps) {
  const isPt = language === "br" || language === "pt";
  const [selectedScreenId, setSelectedScreenId] = useState<string>("gameplay");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const appUrl = item.appUrl || "https://soulfighter.asterdev.me/";
  const githubUrl =
    item.links.find((l) => l.icon === "file-code" || l.title.toLowerCase().includes("código") || l.title.toLowerCase().includes("source"))?.url ||
    "https://github.com/zAstergun/Soul-Fighter-Memory-Game";

  const activeScreen = GALLERY_SCREENS.find((s) => s.id === selectedScreenId) || GALLERY_SCREENS[0];

  return (
    <div className="w-full h-full overflow-y-auto detail-scroll-area bg-[#0b0813] text-stone-100 select-text p-5 sm:p-6 md:p-8 lg:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* ─── Hero Banner Remastered ─── */}
        <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden border border-[#ff4655]/30 bg-gradient-to-br from-[#1b102b] via-[#120a1f] to-[#0c0816] shadow-[0_12px_40px_rgba(255,70,85,0.18)]">
          {/* Ambient decorative glows */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#ff4655]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#705df2]/25 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Chibi Icon Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-[#ff4655]/60 shadow-[0_0_24px_rgba(255,70,85,0.4)] bg-[#1a0f2e]">
                <img
                  src={item.icon || "/icons/memory.png"}
                  alt="Gwen Soul Fighter"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#ff4655] to-[#705df2] text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                REMASTERED
              </span>
            </div>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.8 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#ff4655]/20 text-[#ff4655] border border-[#ff4655]/40 shadow-[0_0_12px_rgba(255,70,85,0.2)]">
                  <Fire weight="fill" className="w-3.5 h-3.5 text-[#ff4655]" />
                  Soul Fighter Arena
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  React 19 · Vite · TypeScript
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Tailwind CSS
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Soul Fighter: <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] via-[#ff758c] to-[#a855f7]">Memory Game Remastered</span>
              </h1>

              <p className="mt-2.5 text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
                {isPt
                  ? "Evolução completa do jogo original para uma stack moderna em React 19, TypeScript e Tailwind CSS. Traz 4 modos de luta exclusivos (incluindo o modo Lenda com 10 vidas e K.O.), sistema de espiadinha de cartas, dicas dinâmicas, Web Audio API espacial e sincronização com Aster Account para o ranking mundial."
                  : "Complete overhaul of the original project to a modern React 19, TypeScript, and Tailwind CSS stack. Features 4 exclusive combat modes (including Legend with 10 lives and K.O.), card peek previews, dynamic hints, spatial Web Audio API, and global leaderboard sync via Aster Account."}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onPlayClick}
                  className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#ff4655] to-[#705df2] hover:from-[#ff3366] hover:to-[#6355e0] shadow-[0_4px_20px_rgba(255,70,85,0.4)] transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <Play weight="fill" className="w-4 h-4" />
                  {isPt ? "Entrar na Arena (Jogar Agora)" : "Enter Arena (Play Live)"}
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

        {/* ─── Modern Key Metrics / Remaster Specs ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#140e24]/80 border border-cyan-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-cyan-300/80 uppercase font-bold tracking-wider">
                Stack Core
              </span>
              <Cpu weight="fill" className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl md:text-2xl font-black text-white">React 19</div>
            <p className="text-[11px] text-stone-400 mt-1">
              {isPt ? "TypeScript + Vite 6" : "TypeScript + Vite 6"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#140e24]/80 border border-[#ff4655]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#ff4655]/80 uppercase font-bold tracking-wider">
                Combate
              </span>
              <ShieldCheck weight="fill" className="w-4 h-4 text-[#ff4655]" />
            </div>
            <div className="text-xl md:text-2xl font-black text-white">4 Modos</div>
            <p className="text-[11px] text-stone-400 mt-1">
              {isPt ? "Novato, Lutador, Lenda e Clássico" : "Novice, Fighter, Legend & Classic"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#140e24]/80 border border-amber-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-amber-300/80 uppercase font-bold tracking-wider">
                Mecânicas
              </span>
              <Heart weight="fill" className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl md:text-2xl font-black text-white">10 Vidas / Dicas</div>
            <p className="text-[11px] text-stone-400 mt-1">
              {isPt ? "Sistema K.O. e espiadinha" : "K.O. life system & peek"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#140e24]/80 border border-purple-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-purple-300/80 uppercase font-bold tracking-wider">
                Rede Aster
              </span>
              <Globe weight="bold" className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl md:text-2xl font-black text-white">Ranking Real</div>
            <p className="text-[11px] text-stone-400 mt-1">
              {isPt ? "Placar global e Aster Account" : "Live cloud leaderboard"}
            </p>
          </div>
        </div>

        {/* ─── Galeria Interativa de Imagens (Nova Prévia Multitela) ─── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkle weight="fill" className="w-4 h-4 text-[#ff4655]" />
              <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-white">
                {isPt ? "Galeria da Arena Remastered" : "Remastered Arena Gallery"}
              </h2>
            </div>
            <span className="text-[11px] text-stone-400">
              {isPt ? "Selecione uma tela para inspecionar:" : "Select a screen to preview:"}
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
                      ? "bg-[#ff4655]/15 border-[#ff4655]/60 text-white shadow-[0_0_16px_rgba(255,70,85,0.25)] ring-1 ring-[#ff4655]/50"
                      : "bg-[#130d22] border-white/10 text-stone-400 hover:border-white/20 hover:text-stone-200"
                  }`}
                >
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded mb-1.5 ${
                      isSelected
                        ? "bg-[#ff4655] text-white"
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
          <div className="rounded-3xl overflow-hidden border border-[#ff4655]/30 bg-[#120a1f] relative group shadow-2xl">
            {/* Top description row */}
            <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/[0.08] bg-black/40">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff4655] animate-pulse shrink-0" />
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
                  <ArrowsOut weight="bold" className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isPt ? "Ampliar" : "Zoom"}</span>
                </button>

                <button
                  type="button"
                  onClick={onPlayClick}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#ff4655] to-[#705df2] hover:from-[#ff3366] hover:to-[#6355e0] shadow-[0_2px_12px_rgba(255,70,85,0.4)] transition-all cursor-pointer active:scale-95"
                  title={isPt ? "Iniciar jogo na arena interativa" : "Play live game"}
                >
                  <GameController weight="fill" className="w-3.5 h-3.5" />
                  <span>{isPt ? "Jogar Arena" : "Play Live"}</span>
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0813] via-transparent to-black/20 opacity-40 group-hover:opacity-20 transition-opacity" />

              {/* Viewfinder Badges */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono text-stone-200 shadow-lg pointer-events-none">
                <Sparkle weight="fill" className="w-3 h-3 text-[#ff4655]" />
                <span>{isPt ? "Captura Remastered · 1080p" : "Remastered HD Capture"}</span>
              </div>

              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono text-cyan-300 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ArrowsOut weight="bold" className="w-3 h-3 text-cyan-400" />
                <span>{isPt ? "Clique para ampliar" : "Click to expand"}</span>
              </div>

              {/* Viewfinder corners */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#ff4655]/60 pointer-events-none" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#ff4655]/60 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#ff4655]/60 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#ff4655]/60 pointer-events-none" />
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
              className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-[#120a1f] border border-[#ff4655]/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(255,70,85,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff4655] animate-pulse shrink-0" />
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#ff4655] to-[#705df2] hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    <GameController weight="fill" className="w-3.5 h-3.5" />
                    <span>{isPt ? "Entrar na Arena" : "Enter Arena"}</span>
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/70 hover:bg-[#ff4655] border border-white/20 text-white transition-all cursor-pointer shadow-lg"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/70 hover:bg-[#ff4655] border border-white/20 text-white transition-all cursor-pointer shadow-lg"
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

        {/* ─── Deep-Dive de Arquitetura & Engenharia ─── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Code weight="bold" className="w-5 h-5 text-[#ff4655]" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              {isPt ? "Engenharia & Destaques de Código Remastered" : "Remastered Code & Architecture"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: React 19 Engine */}
            <div className="p-5 rounded-2xl bg-[#130d22] border border-white/[0.08] hover:border-cyan-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-3">
                <Cpu weight="bold" className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                {isPt ? "Engine em React 19 & State Machine" : "React 19 Engine & Deterministic State"}
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                {isPt
                  ? "Reconstrução arquitetural da versão legado para React 19 e TypeScript com ciclo de vida otimizado. Máquina de estados para travas de matching (lockBoard), gerenciamento reativo de pares revelados e zero rerenders desnecessários."
                  : "Architectural migration from legacy code to React 19 and TypeScript. Deterministic state machine handles match locking (lockBoard), asynchronous peek windows, and zero unwanted rerenders."}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">React 19.2</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">TypeScript</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">lockBoard</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">useReducer</span>
              </div>
            </div>

            {/* Card 2: 4 Modos & Vidas K.O. */}
            <div className="p-5 rounded-2xl bg-[#130d22] border border-white/[0.08] hover:border-[#ff4655]/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#ff4655]/15 border border-[#ff4655]/30 flex items-center justify-center mb-3">
                <Heart weight="bold" className="w-4 h-4 text-[#ff4655]" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                {isPt ? "4 Modos de Combate & Sistema de Vidas" : "4 Combat Modes & K.O. Life System"}
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                {isPt
                  ? "Quatro categorias calibradas: Novato (6 pares), Lutador (10 pares), Lenda (12 pares com skins Prestígio e 10 vidas com K.O. definitivo) e Clássico (5 lutadores, 4 cartas). Multiplicadores dinâmicos de pontuação (1.0x a 3.0x)."
                  : "Calibrated game modes: Novice (6 pairs), Fighter (10 pairs), Legend (12 pairs with Prestige skins and 10 HP lives with sudden K.O.), plus Classic retro mode. Multipliers scale from 1.0x to 3.0x."}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">Mode: Lenda K.O.</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">3.0x Multiplier</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">Prestige Skins</span>
              </div>
            </div>

            {/* Card 3: Dicas & Espiadinha */}
            <div className="p-5 rounded-2xl bg-[#130d22] border border-white/[0.08] hover:border-amber-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3">
                <Lightbulb weight="bold" className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                {isPt ? "Sistema de Dicas (Hints) & Espiadinha" : "Hint Assist System & Initial Peek"}
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                {isPt
                  ? "Mecânica de aquecimento inicial (espiadinha de 2s ou 1s) para visualização rápida das cartas. Sistema de dicas consumíveis (💡 3x, 2x ou 1x) que revela instantaneamente um par correspondente nos momentos de aperto."
                  : "Initial peek preview window (2s or 1s) for flash memorization before combat lock. Consumable in-game hint system that briefly highlights matching pairs under pressure."}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">peekTimer: 2s/1s</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">consumeHint()</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">revealPulse</span>
              </div>
            </div>

            {/* Card 4: Web Audio & Rede Aster */}
            <div className="p-5 rounded-2xl bg-[#130d22] border border-white/[0.08] hover:border-purple-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-3">
                <SpeakerHigh weight="bold" className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                {isPt ? "Web Audio API & Rede Aster Cloud" : "Web Audio API & Aster Cloud Network"}
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                {isPt
                  ? "Sonoplastia espacial de arena (card flips, combo streaks, K.O. e fanfarras) sem atraso perceptível. Conexão com Aster Account para gravação e disputa de melhores tempos no ranking mundial."
                  : "Zero-latency spatial arena sound effects (card flip, combo streaks, damage buzzers, and victory fanfare). Integrated Aster Account for persistent cloud scores and global competition."}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">Web Audio API</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">Aster Account</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">Global Leaderboard</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
