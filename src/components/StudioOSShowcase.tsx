import { useState } from "react";
import {
  Sparkle,
  GithubLogo,
  ArrowSquareOut,
  Cpu,
  ArrowsOut,
  ArrowLeft,
  ArrowRight,
  X,
  Database,
  Cloud,
  Monitor,
  VideoCamera,
  FilmStrip,
  Gauge,
  Flame,
  CheckCircle,
  Crown,
  Folder,
  Eye,
  ChatCircleDots,
  Broadcast,
} from "@phosphor-icons/react";
import type { DetailableItem, Language } from "../data/aster";

interface StudioOSShowcaseProps {
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
    id: "overview",
    titlePt: "Painel Principal & Esteira Integrada",
    titleEn: "Main Dashboard & Integrated Pipeline",
    descPt: "Centralização de todas as etapas de produção: da calibração do canal à geração de roteiros, thumbnails e checklist pré-upload.",
    descEn: "Complete production pipeline: from channel calibration to automated scripts, thumbnail design briefs, and pre-upload checklists.",
    badge: "Visão Geral",
    image: "/previews/studioos.png",
  },
  {
    id: "telemetry",
    titlePt: "Telemetria & Monitoramento de Retenção",
    titleEn: "Telemetry & Retention Monitoring",
    descPt: "Métricas preditivas antes da gravação: estimativa de retenção nos primeiros 3 a 5 segundos, ritmo de fala e potencial de engajamento.",
    descEn: "Predictive metrics prior to recording: estimated retention in the first 3-5 seconds, speech cadence, and engagement potential.",
    badge: "Telemetria & Métricas",
    image: "/previews/studioos-visao-geral.jpg",
  },
  {
    id: "rank",
    titlePt: "Validação Estratégica: Rank de Ideia",
    titleEn: "Strategic Validation: Idea Rank",
    descPt: "Avaliação algorítmica de 0 a 10 com base em novidade, apelo de clique, tensão e viabilidade técnica antes de investir tempo em produção.",
    descEn: "Algorithmic 0 to 10 scoring based on novelty, click appeal, emotional tension, and feasibility before committing recording resources.",
    badge: "Validação Estratégica",
    image: "/previews/studioos-rank-de-ideia.jpg",
  },
];

export function StudioOSShowcase({
  onPlayClick,
  item,
  language = "br",
}: StudioOSShowcaseProps) {
  const isPt = language === "br" || language === "pt";
  const [selectedScreenId, setSelectedScreenId] = useState<string>("overview");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const appUrl = item.appUrl || "https://studio.asterdev.me/";
  const githubUrl =
    item.links.find(
      (l) =>
        l.icon === "file-code" ||
        l.title.toLowerCase().includes("código") ||
        l.title.toLowerCase().includes("source")
    )?.url || "https://github.com/zAstergun/StudioOS";

  const activeScreen =
    GALLERY_SCREENS.find((s) => s.id === selectedScreenId) || GALLERY_SCREENS[0];

  const toolsSuite = [
    {
      icon: <Gauge weight="bold" className="w-4 h-4 text-[#f7b733]" />,
      name: isPt ? "Rank de Ideia" : "Idea Ranking",
      desc: isPt
        ? "Pontuação algorítmica de 0 a 10 por novidade, tensão e viabilidade."
        : "Algorithmic 0 to 10 score evaluating novelty, tension, and feasibility.",
      badge: isPt ? "Validação" : "Validation",
    },
    {
      icon: <Flame weight="bold" className="w-4 h-4 text-orange-400" />,
      name: isPt ? "Gerador de Títulos" : "Title Generator",
      desc: isPt
        ? "Fórmulas de alto CTR calibradas especificamente ao tom do canal."
        : "High-CTR tested frameworks calibrated to your channel's persona.",
      badge: "CTR",
    },
    {
      icon: <Broadcast weight="bold" className="w-4 h-4 text-amber-400" />,
      name: isPt ? "Hooks de Retenção" : "Retention Hooks",
      desc: isPt
        ? "6 variações de abertura com retenção projetada para os primeiros 3-5s."
        : "6 opening hook variations with projected 3-5 second viewer retention.",
      badge: isPt ? "Retenção" : "Retention",
    },
    {
      icon: <FilmStrip weight="bold" className="w-4 h-4 text-yellow-400" />,
      name: isPt ? "Roteiro & Teleprompter" : "Script & Teleprompter",
      desc: isPt
        ? "Estrutura em 3 atos, ritmo de fala e teleprompter em tela cheia com velocidade ajustável."
        : "3-act structure, pacing calculator, and full-screen teleprompter with speed control.",
      badge: isPt ? "Gravação" : "Recording",
    },
    {
      icon: <Eye weight="bold" className="w-4 h-4 text-emerald-400" />,
      name: isPt ? "Briefing de Thumbnail" : "Thumbnail Briefing",
      desc: isPt
        ? "Composição visual, pontos focais, expressões e paleta de cores recomendada."
        : "Visual layout, focal hotspots, emotional expressions, and recommended color palette.",
      badge: isPt ? "Design" : "Visual",
    },
    {
      icon: <Sparkle weight="bold" className="w-4 h-4 text-purple-400" />,
      name: isPt ? "Receita Viral" : "Viral Recipe",
      desc: isPt
        ? "Desconstrução de formatos em alta para replicação ética no seu nicho."
        : "Deconstruction of trending content frameworks for ethical niche adaptation.",
      badge: isPt ? "Formatos" : "Trending",
    },
    {
      icon: <ChatCircleDots weight="bold" className="w-4 h-4 text-sky-400" />,
      name: isPt ? "Humanizador de IA" : "AI Humanizer",
      desc: isPt
        ? "Elimina clichês e vícios robóticos, conferindo cadência natural à fala."
        : "Eliminates robotic AI cliches, injecting natural spoken human rhythm.",
      badge: isPt ? "Voz Natural" : "Natural",
    },
    {
      icon: <CheckCircle weight="bold" className="w-4 h-4 text-teal-400" />,
      name: isPt ? "Score de Post" : "Post Scorecard",
      desc: isPt
        ? "Checklist analítico pré-upload de copy, timing, ganchos e CTA."
        : "Complete pre-upload checklist evaluating copy, timing, hooks, and call-to-actions.",
      badge: isPt ? "Auditoria" : "Audit",
    },
    {
      icon: <Cpu weight="bold" className="w-4 h-4 text-rose-400" />,
      name: isPt ? "Mentor AI Estratégico" : "Strategic AI Mentor",
      desc: isPt
        ? "Consultor em tempo real para posicionamento, esteira de produtos e tomada de decisões."
        : "Real-time strategic advisor for positioning, product suites, and high-stakes decisions.",
      badge: "Mentor",
    },
    {
      icon: <Folder weight="bold" className="w-4 h-4 text-amber-300" />,
      name: isPt ? "Projetos & Pastas" : "Projects & Folders",
      desc: isPt
        ? "Organização por pastas temáticas com chat de IA dedicado por projeto."
        : "Thematic folder management featuring an isolated, contextual AI chat per project.",
      badge: isPt ? "Contexto" : "Workspace",
    },
    {
      icon: <Crown weight="bold" className="w-4 h-4 text-amber-400" />,
      name: isPt ? "Perfis Públicos & VIP" : "Public Profiles & VIP",
      desc: isPt
        ? "Página pública /perfil/@handle com estatísticas, badges e personalização RGB."
        : "Public /perfil/@handle showcase with telemetry stats, badges, and RGB color styling.",
      badge: "VIP",
    },
    {
      icon: <Database weight="bold" className="w-4 h-4 text-blue-400" />,
      name: isPt ? "Calibração de Canal" : "Channel Calibration",
      desc: isPt
        ? "Base central de audiência, tom de voz e regras inegociáveis herdadas por todas as ferramentas."
        : "Centralized audience, voice tone, and boundary guidelines inherited across all tools.",
      badge: "Core",
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto detail-scroll-area bg-[#0e0d0b] text-[#f4efe6] select-text p-5 sm:p-6 md:p-8 lg:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* ─── Hero Banner Amber Studio ─── */}
        <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden border border-[#f7b733]/30 bg-gradient-to-br from-[#1c160c] via-[#141109] to-[#0a0805] shadow-[0_12px_40px_rgba(247,183,51,0.15)]">
          {/* Ambient decorative amber glows */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#f7b733]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#fc4a1a]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-[#f7b733]/60 shadow-[0_0_24px_rgba(247,183,51,0.35)] bg-[#181308] p-3 flex items-center justify-center">
                <img
                  src={item.icon || "/icons/studio_os.svg"}
                  alt="StudioOS"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(247,183,51,0.5)]"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#f7b733] to-[#fc4a1a] text-[10px] font-black uppercase tracking-wider text-stone-950 shadow-md">
                LIVE APP
              </span>
            </div>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.8 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#f7b733]/15 text-[#f7b733] border border-[#f7b733]/30 shadow-[0_0_12px_rgba(247,183,51,0.2)]">
                  <Sparkle weight="fill" className="w-3.5 h-3.5 text-[#f7b733]" />
                  Astro 7.3 · React 19 · Tailwind v4
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white/5 text-stone-300 border border-white/10">
                  Supabase SSR
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white/5 text-stone-300 border border-white/10">
                  Cloudflare Workers
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                StudioOS:{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f7b733] to-[#fc4a1a]">
                  Sistema Operacional do Criador
                </span>
              </h1>

              <p className="mt-2.5 text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
                {isPt
                  ? "Suíte completa com 12 ferramentas inteligentes conectadas ao cérebro calibrado do seu canal. Da validação de ideias ao post publicado com métricas reais, retenção projetada e zero achismo."
                  : "Complete suite of 12 smart tools connected to your channel's unique calibrated voice. From idea validation to published content with real retention metrics and zero guesswork."}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={onPlayClick}
                  className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm text-stone-950 bg-gradient-to-r from-[#f7b733] via-[#ffc048] to-[#fc4a1a] hover:opacity-95 shadow-[0_4px_20px_rgba(247,183,51,0.4)] transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <Sparkle weight="fill" className="w-4 h-4 text-stone-950" />
                  <span>{isPt ? "Acessar StudioOS" : "Launch StudioOS"}</span>
                </button>

                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-stone-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  <ArrowSquareOut weight="bold" className="w-4 h-4" />
                  <span>studio.asterdev.me</span>
                </a>

                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-stone-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  <GithubLogo weight="bold" className="w-4 h-4" />
                  <span>zAstergun/StudioOS</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 12 Ferramentas em Bento Grid ─── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>{isPt ? "A Suíte de 12 Ferramentas" : "The 12-Tool Creator Suite"}</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {isPt
                  ? "Todas as ferramentas compartilham a mesma calibração central de nicho, tom e regras inegociáveis."
                  : "All tools automatically inherit the same centralized calibration for persona and voice."}
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-[#f7b733] border border-amber-500/20">
              12 Ferramentas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {toolsSuite.map((tool) => (
              <div
                key={tool.name}
                className="p-4 rounded-2xl bg-[#14120e] border border-white/5 hover:border-[#f7b733]/40 transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-[#f7b733]/10 group-hover:border-[#f7b733]/30 transition-colors">
                    {tool.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-stone-400 uppercase tracking-wider">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#f7b733] transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Galeria de Telas & Demonstração ─── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {isPt ? "Galeria do Sistema" : "System Interface Gallery"}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {isPt
                  ? "Clique nas abas para inspecionar cada módulo de produção em alta resolução."
                  : "Click tabs below to inspect high-resolution production workflows."}
              </p>
            </div>
            <span className="text-xs font-mono text-stone-500">
              {activeScreen.badge}
            </span>
          </div>

          {/* Screen Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
            {GALLERY_SCREENS.map((screen) => {
              const isSelected = screen.id === selectedScreenId;
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setSelectedScreenId(screen.id)}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(247,183,51,0.15)]"
                      : "bg-[#14120e] border-white/5 hover:border-white/15 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? "text-[#f7b733]" : "text-stone-200"
                    }`}
                  >
                    {isPt ? screen.titlePt : screen.titleEn}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 mt-1">
                    {screen.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Screen Preview Card with Lightbox Trigger */}
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-[#0e0d0b] shadow-2xl group">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60 flex items-center justify-center">
              <img
                src={activeScreen.image}
                alt={isPt ? activeScreen.titlePt : activeScreen.titleEn}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Lightbox Trigger Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-xs font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg hover:bg-[#f7b733] hover:text-stone-950 hover:border-[#f7b733]"
              >
                <ArrowsOut weight="bold" className="w-3.5 h-3.5" />
                <span>{isPt ? "Expandir" : "Expand"}</span>
              </button>
            </div>

            {/* Description Footer */}
            <div className="p-4 bg-[#14120e] border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block">
                  {isPt ? activeScreen.titlePt : activeScreen.titleEn}
                </span>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  {isPt ? activeScreen.descPt : activeScreen.descEn}
                </p>
              </div>

              <button
                type="button"
                onClick={onPlayClick}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-stone-950 bg-gradient-to-r from-[#f7b733] to-[#fc4a1a] hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                <span>{isPt ? "Abrir App" : "Open App"}</span>
                <ArrowRight weight="bold" className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Stack & Arquitetura Técnica ─── */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{isPt ? "Arquitetura & Engenharia" : "Architecture & Technical Stack"}</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {isPt
                ? "Construído sobre a tríade de velocidade, escalabilidade global e persistência segura."
                : "Built on speed, low global latency, and enterprise-grade data security."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#14120e] border border-white/5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#f7b733]">
                  <Sparkle weight="bold" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Astro 7.3 + React 19</h3>
                  <span className="text-[10px] font-mono text-stone-400">Server-Driven Islands</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                {isPt
                  ? "Renderização SSR híbrida com zero JavaScript desnecessário no cliente. Páginas de landing e documentação carregam instantaneamente com SEO e Open Graph calibrados."
                  : "Hybrid SSR with zero redundant client-side JS overhead. Landing pages and documentation load instantly with calibrated SEO and Open Graph."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#14120e] border border-white/5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <Cloud weight="bold" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cloudflare Workers Edge</h3>
                  <span className="text-[10px] font-mono text-stone-400">Low-Latency Global Edge</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                {isPt
                  ? "Deploy distribuído em mais de 300 data centers globais da Cloudflare, garantindo tempo de resposta sub-100ms em qualquer continente."
                  : "Globally deployed across 300+ Cloudflare edge data centers, guaranteeing sub-100ms response times worldwide."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#14120e] border border-white/5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Database weight="bold" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Supabase Auth & Postgres</h3>
                  <span className="text-[10px] font-mono text-stone-400">Row Level Security (RLS)</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                {isPt
                  ? "Autenticação fluida com Google, Discord, e-mail e modo visitante com conta temporária de 24h. Banco de dados relacional isolado por políticas RLS rigorosas."
                  : "Smooth authentication via Google, Discord, email, or instant 24h demo accounts. Data secured by strict Row Level Security policies."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#14120e] border border-white/5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Cpu weight="bold" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Tailwind CSS v4 Engine</h3>
                  <span className="text-[10px] font-mono text-stone-400">High-Performance Tokens</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                {isPt
                  ? "Nova geração do Tailwind CSS integrada via Vite sem build steps desnecessários, com tokens de design para modo escuro profissional e teleprompter em tela cheia."
                  : "Next-gen Tailwind CSS compiled directly with Vite, offering design tokens for dark themes and full-screen teleprompter mode."}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Footer CTA ─── */}
        <div className="p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-[#14120e] to-orange-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              {isPt ? "Pronto para criar conteúdo a sério?" : "Ready to take content creation seriously?"}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {isPt
                ? "Acesse a versão live agora mesmo ou examine o código fonte completo no GitHub."
                : "Launch the live application now or explore the full source code on GitHub."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-stone-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white transition-all cursor-pointer"
            >
              GitHub ↗
            </a>
            <button
              type="button"
              onClick={onPlayClick}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-stone-950 bg-gradient-to-r from-[#f7b733] to-[#fc4a1a] hover:opacity-90 shadow-sm transition-all cursor-pointer"
            >
              {isPt ? "Acessar StudioOS ↗" : "Launch StudioOS ↗"}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Lightbox Modal ─── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-[#14120e] rounded-2xl border border-amber-500/40 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/50">
              <span className="text-xs font-bold text-white">
                {isPt ? activeScreen.titlePt : activeScreen.titleEn}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-black/80">
              <img
                src={activeScreen.image}
                alt={isPt ? activeScreen.titlePt : activeScreen.titleEn}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>

            <div className="p-3 bg-[#14120e] border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-stone-400">
                {isPt ? activeScreen.descPt : activeScreen.descEn}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-[#f7b733]">
                {activeScreen.badge}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

