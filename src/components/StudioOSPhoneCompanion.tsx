import {
  ArrowRight,
  Sparkle,
  Cpu,
  Database,
  Cloud,
  Monitor,
  VideoCamera,
  FilmStrip,
  Gauge,
  Flame,
  CheckCircle,
} from "@phosphor-icons/react";
import { isImageIcon, type DetailableItem, type Language } from "../data/aster";

interface StudioOSPhoneCompanionProps {
  isDark?: boolean;
  language?: Language;
  item: DetailableItem;
  categoryTag: string;
  ui?: any;
}

export function StudioOSPhoneCompanion({
  isDark = false,
  language = "br",
  item,
  categoryTag,
  ui,
}: StudioOSPhoneCompanionProps) {
  const isPt = language === "br" || language === "pt";

  const panelText = isDark ? "text-stone-100" : "text-aster-dark";
  const panelFaint = isDark ? "text-stone-500" : "text-aster-dark/40";
  const cardBg = isDark
    ? "bg-stone-700/60 border-stone-600 hover:bg-stone-700/80"
    : "bg-aster-beige-dark/60 border-aster-dark/[0.08] hover:bg-aster-beige-dark";

  const staticCardBg = isDark
    ? "bg-stone-700/40 border-stone-600/70"
    : "bg-aster-beige-dark/50 border-aster-dark/[0.08]";

  const appUrl = item.appUrl || "https://studio.asterdev.me/";
  const githubUrl =
    item.links.find(
      (l) =>
        l.icon === "file-code" ||
        l.title.toLowerCase().includes("código") ||
        l.title.toLowerCase().includes("source")
    )?.url || "https://github.com/zAstergun/StudioOS";

  const toolCategories = [
    {
      title: isPt ? "Criação & Roteiro" : "Creation & Scripting",
      badge: isPt ? "5 Ferramentas" : "5 Tools",
      desc: isPt
        ? "Rank de Ideia, Gerador de Títulos, Hooks de Retenção, Roteiro em 3 Atos e Briefing de Thumbnails."
        : "Idea Ranking, High-CTR Titles, Retention Hooks, 3-Act Scripting, and Thumbnail Briefs.",
      badgeColor: isDark ? "text-amber-400 bg-amber-500/15" : "text-amber-700 bg-amber-50",
    },
    {
      title: isPt ? "Publicação & Validação" : "Publishing & Validation",
      badge: isPt ? "3 Ferramentas" : "3 Tools",
      desc: isPt
        ? "Receita Viral, Humanizador de IA e Score de Post (checklist pré-upload de copy, timing e CTA)."
        : "Viral Recipe, AI Humanizer, and Pre-upload Post Scorecard (copy, timing, hooks & CTA).",
      badgeColor: isDark ? "text-orange-400 bg-orange-500/15" : "text-orange-700 bg-orange-50",
    },
    {
      title: isPt ? "Estratégia & Monetização" : "Strategy & Growth",
      badge: isPt ? "2 Ferramentas" : "2 Tools",
      desc: isPt
        ? "Mentor AI em tempo real e planejamento de esteira de produtos / Área de Membros."
        : "Real-time AI Strategic Mentor and digital membership / product pipeline planner.",
      badgeColor: isDark ? "text-yellow-400 bg-yellow-500/15" : "text-yellow-700 bg-yellow-50",
    },
    {
      title: isPt ? "Gestão & Colaboração" : "Management & Collaboration",
      badge: isPt ? "2 Módulos" : "2 Modules",
      desc: isPt
        ? "Calibração Central do canal, Projetos com chat de IA dedicado, Perfis Públicos e Sistema VIP."
        : "Channel calibration data, per-project contextual AI chat, public creator profiles, and VIP system.",
      badgeColor: isDark ? "text-emerald-400 bg-emerald-500/15" : "text-emerald-700 bg-emerald-50",
    },
  ];

  const techHighlights = [
    {
      icon: <Sparkle weight="bold" className="w-4 h-4 text-[#f7b733] shrink-0" />,
      title: "Astro 7.3 + React 19",
      desc: isPt ? "SSR ultrarrápido com ilhas de interatividade" : "Ultra-fast SSR with interactive islands",
    },
    {
      icon: <Cpu weight="bold" className="w-4 h-4 text-[#f7b733] shrink-0" />,
      title: "Tailwind CSS v4",
      desc: isPt ? "Estilização moderna de alto desempenho" : "Modern high-performance styling engine",
    },
    {
      icon: <Database weight="bold" className="w-4 h-4 text-[#f7b733] shrink-0" />,
      title: "Supabase Auth & Postgres",
      desc: isPt ? "Contas demo 24h, OAuth e Row Level Security" : "24h demo accounts, OAuth & Row Level Security",
    },
    {
      icon: <Cloud weight="bold" className="w-4 h-4 text-[#f7b733] shrink-0" />,
      title: "Cloudflare Workers",
      desc: isPt ? "Execução edge de baixa latência global" : "Low-latency edge execution worldwide",
    },
  ];

  return (
    <>
      {/* ─── 1. Header (Standard Portfolio App Header) ─── */}
      <div
        className="relative rounded-[22.5%] flex items-center justify-center shadow-md shrink-0 mb-3 w-20 h-20 p-2.5"
        style={{
          background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
        }}
      >
        {isImageIcon(item.icon) ? (
          <img
            src={item.icon}
            alt={item.name}
            className="w-full h-full object-contain rounded-[22.5%] drop-shadow-sm"
          />
        ) : (
          <span className="drop-shadow-sm select-none text-4xl">{item.icon}</span>
        )}
      </div>

      {/* Category tag */}
      <span className="text-[11px] @tablet:text-xs font-mono tracking-[0.2em] uppercase font-bold text-[#f7b733] mb-1 block">
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
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#f7b733] animate-pulse" />
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

      {/* Summary */}
      <p
        className={`text-xs @tablet:text-sm font-medium leading-relaxed transition-colors duration-500 mb-6 ${panelFaint}`}
      >
        {item.summary}
      </p>

      {/* Links List */}
      <div className="mb-6">
        <h3
          className={`text-xs font-bold uppercase tracking-widest mb-3 transition-colors duration-500 ${panelFaint}`}
        >
          {ui?.links || "Links"}
        </h3>
        <div className="space-y-2">
          {item.links.map((link) => (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 group cursor-pointer ${cardBg}`}
            >
              <span className="text-base flex items-center justify-center text-[#f7b733]">
                <Sparkle weight="bold" className="w-4 h-4" />
              </span>
              <span
                className={`text-xs @tablet:text-sm font-medium group-hover:text-amber-400 transition-colors duration-500 ${
                  isDark ? "text-stone-300" : "text-aster-dark/80"
                }`}
              >
                {link.title}
              </span>
              <span
                className={`ml-auto group-hover:text-amber-400 transition-colors duration-500 text-xs ${
                  isDark ? "text-stone-600" : "text-aster-dark/30"
                }`}
              >
                <ArrowRight
                  weight="bold"
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ─── 2. 12 Creator Tools Breakdown ─── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${panelFaint}`}
          >
            {isPt ? "12 Ferramentas em 4 Módulos" : "12 Tools Across 4 Modules"}
          </h3>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Astro 7 + React 19
          </span>
        </div>

        <div className="space-y-2.5">
          {toolCategories.map((cat) => (
            <div
              key={cat.title}
              className={`p-3.5 rounded-xl border transition-colors duration-500 ${staticCardBg}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs font-bold ${panelText}`}>{cat.title}</span>
                <span
                  className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${cat.badgeColor}`}
                >
                  {cat.badge}
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${panelFaint}`}>{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. Highlights Técnicos ─── */}
      <div className="mb-6">
        <h3
          className={`text-xs font-bold uppercase tracking-widest mb-3 transition-colors duration-500 ${panelFaint}`}
        >
          {isPt ? "Engenharia & Arquitetura" : "Engineering & Architecture"}
        </h3>

        <div className="grid grid-cols-1 gap-2">
          {techHighlights.map((tech) => (
            <div
              key={tech.title}
              className={`p-3 rounded-xl border flex items-start gap-3 transition-colors duration-500 ${staticCardBg}`}
            >
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0 mt-0.5">
                {tech.icon}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold ${panelText}`}>{tech.title}</div>
                <div className={`text-[11px] leading-tight ${panelFaint}`}>{tech.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. Previews Visuais ─── */}
      <div className="mb-6">
        <h3
          className={`text-xs font-bold uppercase tracking-widest mb-3 transition-colors duration-500 ${panelFaint}`}
        >
          {ui?.preview || "Preview"}
        </h3>
        <div className="rounded-2xl overflow-hidden border border-amber-500/30 shadow-lg bg-[#14120e]">
          <img
            src="/previews/studioos.png"
            alt="StudioOS Preview"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </>
  );
}

