import {
  Play,
  FileCode,
  ArrowRight,
  RocketLaunch,
  GraduationCap,
  Sparkle,
  Cpu,
  SpeakerHigh,
  ShieldCheck,
} from "@phosphor-icons/react";
import { isImageIcon, type DetailableItem, type Language } from "../data/aster";

interface SoulFighterPhoneCompanionProps {
  isDark?: boolean;
  language?: Language;
  item: DetailableItem;
  categoryTag: string;
  ui?: any;
}

export function SoulFighterPhoneCompanion({
  isDark = false,
  language = "br",
  item,
  categoryTag,
  ui,
}: SoulFighterPhoneCompanionProps) {
  const isPt = language === "br" || language === "pt";

  const panelText = isDark ? "text-stone-100" : "text-aster-dark";
  const panelFaint = isDark ? "text-stone-500" : "text-aster-dark/40";
  const cardBg = isDark
    ? "bg-stone-700/60 border-stone-600 hover:bg-stone-700/80"
    : "bg-aster-beige-dark/60 border-aster-dark/[0.08] hover:bg-aster-beige-dark";

  const staticCardBg = isDark
    ? "bg-stone-700/40 border-stone-600/70"
    : "bg-aster-beige-dark/50 border-aster-dark/[0.08]";

  const kbdBg = isDark
    ? "bg-stone-800 text-aster-accent border-stone-600"
    : "bg-aster-dark/[0.07] text-aster-accent border-aster-dark/10";

  const appUrl = item.appUrl || "https://soulfighter.asterdev.me/";
  const githubUrl =
    item.links.find(
      (l) =>
        l.icon === "file-code" ||
        l.title.toLowerCase().includes("código") ||
        l.title.toLowerCase().includes("source")
    )?.url || "https://github.com/zAstergun/Soul-Fighter-Memory-Game";

  const modes = [
    {
      name: isPt ? "Novato" : "Rookie",
      mult: "1.0x",
      specs: isPt ? "6 pares · 3 dicas · Espiadinha de 2s" : "6 pairs · 3 hints · 2s peek",
      desc: isPt ? "Ideal para aquecer e memorizar os campeões." : "Warm-up round to memorize the champions.",
      badgeColor: isDark ? "text-emerald-400 bg-emerald-500/15" : "text-emerald-700 bg-emerald-50",
    },
    {
      name: isPt ? "Lutador" : "Fighter",
      mult: "1.5x",
      specs: isPt ? "10 pares · 2 dicas · Espiadinha de 1s" : "10 pairs · 2 hints · 1s peek",
      desc: isPt ? "Todos os 10 lutadores Soul Fighter no grid." : "All 10 Soul Fighter champions in the ring.",
      badgeColor: isDark ? "text-amber-400 bg-amber-500/15" : "text-amber-700 bg-amber-50",
    },
    {
      name: isPt ? "Clássico" : "Classic",
      mult: "2.0x",
      specs: isPt ? "5 lutadores (4 cartas cada) · 2 dicas" : "5 fighters (4 cards each) · 2 hints",
      desc: isPt ? "Regra original: encontre 4 cópias de cada campeão." : "Original rule: match 4 copies of each fighter.",
      badgeColor: isDark ? "text-purple-400 bg-purple-500/15" : "text-purple-700 bg-purple-50",
    },
    {
      name: isPt ? "Lenda (K.O.)" : "Legend (K.O.)",
      mult: "3.0x",
      specs: isPt ? "12 pares · 10 vidas com morte súbita · 1 dica" : "12 pairs · 10 lives sudden death · 1 hint",
      desc: isPt ? "Skins Prestígio inclusas. Errou 10 vezes? K.O." : "Includes Prestige skins. Miss 10 times? K.O.",
      badgeColor: isDark ? "text-rose-400 bg-rose-500/15" : "text-rose-700 bg-rose-50",
    },
  ];

  const controls = [
    {
      key: "P",
      action: isPt ? "Pausar" : "Pause",
      desc: isPt ? "Congela tempo" : "Freezes timer",
    },
    {
      key: "H",
      action: isPt ? "Dica" : "Hint",
      desc: isPt ? "Revela 1 par" : "Reveals 1 pair",
    },
    {
      key: "M",
      action: isPt ? "Som" : "Audio",
      desc: isPt ? "Mudo / Ativo" : "Mute / Unmute",
    },
    {
      key: "R",
      action: isPt ? "Reiniciar" : "Restart",
      desc: isPt ? "Novo round" : "Reset board",
    },
  ];

  const techHighlights = [
    {
      icon: <Cpu weight="bold" className="w-4 h-4 text-aster-accent shrink-0" />,
      title: "React 19 + TypeScript",
      desc: isPt ? "Matchmaking determinístico & state machine" : "Deterministic matchmaking & state machine",
    },
    {
      icon: <SpeakerHigh weight="bold" className="w-4 h-4 text-aster-accent shrink-0" />,
      title: "Web Audio API",
      desc: isPt ? "Sonoplastia espacial sintetizada em tempo real" : "Spatial synthesized sound effects",
    },
    {
      icon: <ShieldCheck weight="bold" className="w-4 h-4 text-aster-accent shrink-0" />,
      title: "Aster Account",
      desc: isPt ? "Autenticação em nuvem e ranking mundial" : "Cloud authentication & global leaderboard",
    },
    {
      icon: <Sparkle weight="bold" className="w-4 h-4 text-aster-accent shrink-0" />,
      title: isPt ? "Remasterização Visual" : "Visual Remaster",
      desc: isPt ? "VFX animados, feedback tátil e responsividade" : "Animated VFX, tactile feedback & responsiveness",
    },
  ];

  return (
    <>
      {/* ─── 1. Header (Identical to other portfolio pages) ─── */}
      <div
        className="relative rounded-[22.5%] flex items-center justify-center shadow-md shrink-0 mb-3 w-20 h-20"
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
          <RocketLaunch weight="fill" className="text-white drop-shadow-sm w-10 h-10" />
        ) : item.icon === "graduation" || item.icon === "🎓" ? (
          <GraduationCap weight="fill" className="text-white drop-shadow-sm w-10 h-10" />
        ) : (
          <span className="drop-shadow-sm select-none text-4xl">{item.icon}</span>
        )}
      </div>

      {/* Category tag */}
      <span className="text-[11px] @tablet:text-xs font-mono tracking-[0.2em] uppercase font-bold text-aster-accent mb-1 block">
        {categoryTag}
      </span>

      {/* Title */}
      <h2
        className={`font-extrabold leading-tight tracking-tight transition-colors duration-500 mb-3 text-2xl @tablet:text-3xl ${panelText}`}
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
            className={`tag-chip transition-colors duration-500 ${
              isDark ? "bg-stone-700 text-stone-400" : "bg-aster-dark/[0.07] text-aster-dark/60"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* ─── 2. Resumo Section ─── */}
      <div className="mb-6">
        <h3
          className={`text-xs @tablet:text-sm font-bold uppercase tracking-widest mb-2 transition-colors duration-500 ${panelFaint}`}
        >
          {ui?.summary || (isPt ? "Resumo" : "Summary")}
        </h3>
        <p
          className={`leading-relaxed transition-colors duration-500 text-xs @tablet:text-sm whitespace-pre-wrap ${
            isDark ? "text-stone-300" : "text-aster-dark/80"
          }`}
        >
          {item.summary}
        </p>
      </div>

      {/* ─── 3. Modos de Jogo & Regras ─── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <h3
            className={`text-xs @tablet:text-sm font-bold uppercase tracking-widest transition-colors duration-500 ${panelFaint}`}
          >
            {isPt ? "Modos de Combate" : "Combat Modes"}
          </h3>
          <span className={`text-[10px] font-mono font-semibold transition-colors duration-500 ${panelFaint}`}>
            {isPt ? "4 Dificuldades" : "4 Difficulties"}
          </span>
        </div>

        <div className="space-y-2">
          {modes.map((mode) => (
            <div
              key={mode.name}
              className={`p-3 rounded-xl border transition-colors duration-500 ${staticCardBg}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs @tablet:text-sm font-bold transition-colors duration-500 ${panelText}`}>
                  {mode.name}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-current/20 ${mode.badgeColor}`}
                >
                  {mode.mult} PTS
                </span>
              </div>
              <p className={`text-[11px] font-mono font-medium mb-0.5 ${isDark ? "text-stone-400" : "text-aster-dark/60"}`}>
                {mode.specs}
              </p>
              <p className={`text-xs leading-normal transition-colors duration-500 ${isDark ? "text-stone-300" : "text-aster-dark/75"}`}>
                {mode.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. Atalhos no Teclado ─── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <h3
            className={`text-xs @tablet:text-sm font-bold uppercase tracking-widest transition-colors duration-500 ${panelFaint}`}
          >
            {isPt ? "Controles no Teclado" : "Keyboard Controls"}
          </h3>
          <span className={`text-[10px] font-mono font-semibold transition-colors duration-500 ${panelFaint}`}>
            {isPt ? "Atalhos Rápidos" : "Quick Actions"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {controls.map((ctrl) => (
            <div
              key={ctrl.key}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-colors duration-500 ${staticCardBg}`}
            >
              <kbd
                className={`w-6 h-6 shrink-0 rounded-md font-mono text-xs font-bold flex items-center justify-center border shadow-xs transition-colors duration-500 ${kbdBg}`}
              >
                {ctrl.key}
              </kbd>
              <div className="min-w-0">
                <p className={`text-xs font-bold leading-tight truncate transition-colors duration-500 ${panelText}`}>
                  {ctrl.action}
                </p>
                <p className={`text-[10px] leading-tight truncate transition-colors duration-500 ${panelFaint}`}>
                  {ctrl.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 5. Arquitetura & Stack ─── */}
      <div className="mb-6">
        <h3
          className={`text-xs @tablet:text-sm font-bold uppercase tracking-widest mb-2.5 transition-colors duration-500 ${panelFaint}`}
        >
          {isPt ? "Destaques Técnicos" : "Technical Highlights"}
        </h3>

        <div className="grid grid-cols-1 gap-2">
          {techHighlights.map((tech) => (
            <div
              key={tech.title}
              className={`flex items-start gap-2.5 px-3 py-2 rounded-xl border transition-colors duration-500 ${staticCardBg}`}
            >
              <span className="mt-0.5">{tech.icon}</span>
              <div className="min-w-0">
                <p className={`text-xs font-bold transition-colors duration-500 ${panelText}`}>
                  {tech.title}
                </p>
                <p className={`text-[11px] leading-tight transition-colors duration-500 ${panelFaint}`}>
                  {tech.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 6. Links Oficiais (Aster Standard Link Cards) ─── */}
      <div className="mb-6 pb-8">
        <h3
          className={`text-xs font-bold uppercase tracking-widest mb-3 transition-colors duration-500 ${panelFaint}`}
        >
          Links
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-500 group ${cardBg}`}
          >
            <span className="text-base flex items-center justify-center text-aster-accent">
              <Play weight="fill" className="w-5 h-5 shrink-0" />
            </span>
            <div className="min-w-0 flex flex-col">
              <span
                className={`text-xs @tablet:text-sm font-medium group-hover:text-aster-accent transition-colors duration-500 ${
                  isDark ? "text-stone-300" : "text-aster-dark/80"
                }`}
              >
                {isPt ? "Jogar Arena (Standalone)" : "Play Arena (Standalone)"}
              </span>
              <span className={`text-[10px] font-mono transition-colors duration-500 ${panelFaint}`}>
                soulfighter.asterdev.me
              </span>
            </div>
            <span
              className={`ml-auto group-hover:text-aster-accent transition-colors duration-500 text-xs ${
                isDark ? "text-stone-600" : "text-aster-dark/30"
              }`}
            >
              <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-500 group ${cardBg}`}
          >
            <span className="text-base flex items-center justify-center text-aster-accent">
              <FileCode weight="bold" className="w-5 h-5 shrink-0" />
            </span>
            <div className="min-w-0 flex flex-col">
              <span
                className={`text-xs @tablet:text-sm font-medium group-hover:text-aster-accent transition-colors duration-500 ${
                  isDark ? "text-stone-300" : "text-aster-dark/80"
                }`}
              >
                {isPt ? "Código Fonte no GitHub" : "Source Code on GitHub"}
              </span>
              <span className={`text-[10px] font-mono transition-colors duration-500 ${panelFaint}`}>
                zAstergun/Soul-Fighter-Memory-Game
              </span>
            </div>
            <span
              className={`ml-auto group-hover:text-aster-accent transition-colors duration-500 text-xs ${
                isDark ? "text-stone-600" : "text-aster-dark/30"
              }`}
            >
              <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
