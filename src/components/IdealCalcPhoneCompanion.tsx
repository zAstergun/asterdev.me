import {
  Play,
  FileCode,
  ArrowRight,
  Sparkle,
  Cpu,
  ShieldCheck,
  ChartBar,
  Database,
  Sliders,
} from "@phosphor-icons/react";
import { isImageIcon, type DetailableItem, type Language } from "../data/aster";

interface IdealCalcPhoneCompanionProps {
  isDark?: boolean;
  language?: Language;
  item: DetailableItem;
  categoryTag: string;
  ui?: any;
}

export function IdealCalcPhoneCompanion({
  isDark = false,
  language = "br",
  item,
  categoryTag,
  ui,
}: IdealCalcPhoneCompanionProps) {
  const isPt = language === "br" || language === "pt";

  const panelText = isDark ? "text-stone-100" : "text-aster-dark";
  const panelFaint = isDark ? "text-stone-500" : "text-aster-dark/40";
  const cardBg = isDark
    ? "bg-stone-700/60 border-stone-600 hover:bg-stone-700/80"
    : "bg-aster-beige-dark/60 border-aster-dark/[0.08] hover:bg-aster-beige-dark";

  const staticCardBg = isDark
    ? "bg-stone-700/40 border-stone-600/70"
    : "bg-aster-beige-dark/50 border-aster-dark/[0.08]";

  const appUrl = item.appUrl || "https://idealcalc.asterdev.me/";
  const githubUrl =
    item.links.find(
      (l) =>
        l.icon === "file-code" ||
        l.title.toLowerCase().includes("código") ||
        l.title.toLowerCase().includes("source")
    )?.url || "https://github.com/zAstergun/ideal-calculator";

  const filterCategories = [
    {
      title: isPt ? "Demografia & Identidade" : "Demographics & Identity",
      badge: isPt ? "4 Filtros" : "4 Filters",
      desc: isPt
        ? "Gênero, faixa etária exata, estado/região brasileira e raça/cor autodeclarada."
        : "Gender, age range, Brazilian state/region, and self-declared ethnicity.",
      badgeColor: isDark ? "text-[#ff4d4d] bg-[#e61e2a]/15" : "text-[#e61e2a] bg-rose-50",
    },
    {
      title: isPt ? "Socioeconômico & Renda" : "Socioeconomic & Income",
      badge: isPt ? "3 Filtros" : "3 Filters",
      desc: isPt
        ? "Faixa de renda individual mensal em salários mínimos e grau de instrução escolar."
        : "Monthly personal income brackets and formal educational attainment.",
      badgeColor: isDark ? "text-rose-400 bg-rose-500/15" : "text-rose-700 bg-rose-50",
    },
    {
      title: isPt ? "Físico & Estilo de Vida" : "Physical & Lifestyle",
      badge: isPt ? "3 Filtros" : "3 Filters",
      desc: isPt
        ? "Faixa de altura em centímetros, hábitos com tabaco/fumo e estado civil legal."
        : "Height distribution in cm, smoking habits, and legal marital status.",
      badgeColor: isDark ? "text-pink-400 bg-pink-500/15" : "text-pink-700 bg-pink-50",
    },
    {
      title: isPt ? "Família & Futuro" : "Family & Preferences",
      badge: isPt ? "2 Filtros" : "2 Filters",
      desc: isPt
        ? "Presença de filhos de uniões anteriores e pretensão sobre descendência."
        : "Children from previous relationships and future family plans.",
      badgeColor: isDark ? "text-amber-400 bg-amber-500/15" : "text-amber-700 bg-amber-50",
    },
  ];

  const techHighlights = [
    {
      icon: <Database weight="bold" className="w-4 h-4 text-[#ff4d4d] shrink-0" />,
      title: isPt ? "Microdados Oficiais do IBGE" : "Official IBGE Datasets",
      desc: isPt ? "Censo 2022 e PNAD Contínua 2023" : "Census 2022 and continuous PNAD",
    },
    {
      icon: <ChartBar weight="bold" className="w-4 h-4 text-[#ff4d4d] shrink-0" />,
      title: isPt ? "Probabilidade Composta" : "Compound Probability",
      desc: isPt ? "Matrizes condicionais em tempo real" : "Real-time conditional matrices",
    },
    {
      icon: <Cpu weight="bold" className="w-4 h-4 text-[#ff4d4d] shrink-0" />,
      title: isPt ? "100% Client-Side" : "100% Client-Side",
      desc: isPt ? "Zero latência de backend e cálculo instantâneo" : "Zero backend lag, instant calculation",
    },
    {
      icon: <Sparkle weight="bold" className="w-4 h-4 text-[#ff4d4d] shrink-0" />,
      title: isPt ? "Card Viral Canvas" : "Viral Canvas Scorecard",
      desc: isPt ? "Exportação gráfica para redes sociais" : "Social media ready graphics generator",
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
      <span className="text-[11px] @tablet:text-xs font-mono tracking-[0.2em] uppercase font-bold text-[#ff4d4d] mb-1 block">
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
                ? "bg-[#e61e2a]/15 text-[#ff4d4d] border border-[#e61e2a]/30"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#e61e2a] animate-pulse" />
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

      {/* ─── 3. Filtros Demográficos & Categorias ─── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <h3
            className={`text-xs @tablet:text-sm font-bold uppercase tracking-widest transition-colors duration-500 ${panelFaint}`}
          >
            {isPt ? "Critérios de Filtragem" : "Filtering Criteria"}
          </h3>
          <span className={`text-[10px] font-mono font-semibold transition-colors duration-500 ${panelFaint}`}>
            {isPt ? "12 Filtros" : "12 Filters"}
          </span>
        </div>

        <div className="space-y-2">
          {filterCategories.map((cat) => (
            <div
              key={cat.title}
              className={`p-3 rounded-xl border transition-colors duration-500 ${staticCardBg}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs @tablet:text-sm font-bold transition-colors duration-500 ${panelText}`}>
                  {cat.title}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-current/20 ${cat.badgeColor}`}
                >
                  {cat.badge}
                </span>
              </div>
              <p className={`text-xs leading-normal transition-colors duration-500 ${isDark ? "text-stone-300" : "text-aster-dark/75"}`}>
                {cat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. Arquitetura & Stack ─── */}
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

      {/* ─── 5. Links Oficiais ─── */}
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
            <span className="text-base flex items-center justify-center text-[#ff4d4d]">
              <Play weight="fill" className="w-5 h-5 shrink-0" />
            </span>
            <div className="min-w-0 flex flex-col">
              <span
                className={`text-xs @tablet:text-sm font-medium group-hover:text-[#ff4d4d] transition-colors duration-500 ${
                  isDark ? "text-stone-300" : "text-aster-dark/80"
                }`}
              >
                {isPt ? "Abrir Calculadora (idealcalc.asterdev.me)" : "Open Calculator (idealcalc.asterdev.me)"}
              </span>
              <span className={`text-[10px] font-mono transition-colors duration-500 ${panelFaint}`}>
                idealcalc.asterdev.me
              </span>
            </div>
            <span
              className={`ml-auto group-hover:text-[#ff4d4d] transition-colors duration-500 text-xs ${
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
            <span className="text-base flex items-center justify-center text-[#ff4d4d]">
              <FileCode weight="bold" className="w-5 h-5 shrink-0" />
            </span>
            <div className="min-w-0 flex flex-col">
              <span
                className={`text-xs @tablet:text-sm font-medium group-hover:text-[#ff4d4d] transition-colors duration-500 ${
                  isDark ? "text-stone-300" : "text-aster-dark/80"
                }`}
              >
                {isPt ? "Código Fonte no GitHub" : "Source Code on GitHub"}
              </span>
              <span className={`text-[10px] font-mono transition-colors duration-500 ${panelFaint}`}>
                zAstergun/ideal-calculator
              </span>
            </div>
            <span
              className={`ml-auto group-hover:text-[#ff4d4d] transition-colors duration-500 text-xs ${
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
