// ─── Heuristic Intent Classifier for Aster.Dev ────────────────────────────
// Pure TypeScript client-side classifier using rule-based pattern matching,
// weighted n-grams, text normalization, and confidence scoring.

export type IntentId =
  | "GREETING"
  | "ABOUT_ASTER"
  | "REVERSE_ENGINEERING"
  | "IRONMAN_TRIATHLON"
  | "TECH_STACK"
  | "PROJECTS_OVERVIEW"
  | "PROJECT_IDEAL_CALC"
  | "PROJECT_SOUL_FIGHTER"
  | "PROJECT_PEX_WIKI"
  | "PROJECT_MOBILE_DEMO"
  | "BLOG_HACKATHONS"
  | "EDUCATION"
  | "RESUME_CV"
  | "CONTACT_SOCIAL"
  | "BOT_CAPABILITIES"
  | "HOW_CLASSIFIER_WORKS"
  | "FAREWELL"
  | "FALLBACK";

export interface ActionButton {
  label: string;
  url?: string;
  type?: "link" | "download";
}

export interface ClassifierResult {
  intent: IntentId;
  confidence: number; // 0.0 to 1.0
  matchedTokens: string[];
  response: string;
  actions?: ActionButton[];
  suggestions: string[];
}

interface IntentDefinition {
  id: IntentId;
  patterns: RegExp[];
  keywords: Array<{ term: string; weight: number }>;
  negativeKeywords?: string[];
  minScoreThreshold?: number;
}

// ─── Text Normalization ───────────────────────────────────────────────────

export function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics / accents
    .replace(/[-_]+/g, "-") // normalize multiple dashes/underscores to single hyphen
    .replace(/[^\w\s-]/g, " ") // remove punctuation except hyphens
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTokens(normalized: string): string[] {
  if (!normalized) return [];
  const words = normalized.split(" ").filter((w) => w.length > 0);
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  const trigrams: string[] = [];
  for (let i = 0; i < words.length - 2; i++) {
    trigrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return [...words, ...bigrams, ...trigrams];
}

// ─── Intent Definitions ───────────────────────────────────────────────────

const INTENT_DEFINITIONS: IntentDefinition[] = [
  {
    id: "GREETING",
    patterns: [
      /^(oi|ola|opa|e ai|eai|fala|hey|hello|hi|salve|oie|bom dia|boa tarde|boa noite)\b/,
      /^como vai|^tudo bem|^beleza/,
    ],
    keywords: [
      { term: "ola", weight: 3 },
      { term: "oi", weight: 3 },
      { term: "opa", weight: 3 },
      { term: "hello", weight: 3 },
      { term: "hey", weight: 3 },
      { term: "tudo bem", weight: 2 },
      { term: "bom dia", weight: 3 },
      { term: "boa tarde", weight: 3 },
      { term: "boa noite", weight: 3 },
    ],
    negativeKeywords: ["ideal", "calc", "projeto", "stack", "curriculo"],
  },
  {
    id: "HOW_CLASSIFIER_WORKS",
    patterns: [
      /como (voce|o bot|esse bot|o classificador) (funciona|foi feito|opera)/,
      /voce (usa|e) (ia|inteligencia artificial|chatgpt|openai|llm)/,
      /o que e (um )?classificador heuristico/,
    ],
    keywords: [
      { term: "classificador", weight: 5 },
      { term: "heuristico", weight: 5 },
      { term: "heuristica", weight: 5 },
      { term: "como funciona o bot", weight: 5 },
      { term: "chatgpt", weight: 4 },
      { term: "llm", weight: 4 },
      { term: "como voce foi feito", weight: 5 },
    ],
  },
  {
    id: "BOT_CAPABILITIES",
    patterns: [
      /o que (voce|o bot) (sabe|faz|pode fazer|consegue responder)/,
      /o que posso (perguntar|saber)/,
      /^(ajuda|help|comandos|menu|opcoes)$/,
    ],
    keywords: [
      { term: "ajuda", weight: 4 },
      { term: "help", weight: 4 },
      { term: "o que voce faz", weight: 5 },
      { term: "o que perguntar", weight: 5 },
      { term: "comandos", weight: 4 },
      { term: "capacidades", weight: 4 },
    ],
  },
  {
    id: "REVERSE_ENGINEERING",
    patterns: [
      /engenharia reversa/,
      /como comecou a programar/,
      /servidores de jogos/,
      /criacao de cheats/,
    ],
    keywords: [
      { term: "engenharia reversa", weight: 6 },
      { term: "reversa", weight: 4 },
      { term: "cheats", weight: 5 },
      { term: "cheat", weight: 5 },
      { term: "servidores", weight: 3 },
      { term: "baixo nivel", weight: 4 },
      { term: "memoria", weight: 3 },
      { term: "como comecou", weight: 4 },
    ],
  },
  {
    id: "IRONMAN_TRIATHLON",
    patterns: [
      /ironman/,
      /triathlon/,
      /treino|atleta|rotina esportiva/,
    ],
    keywords: [
      { term: "ironman", weight: 7 },
      { term: "triathlon", weight: 7 },
      { term: "triatlo", weight: 6 },
      { term: "treino", weight: 3 },
      { term: "esporte", weight: 3 },
      { term: "natacao", weight: 3 },
      { term: "ciclismo", weight: 3 },
      { term: "corrida", weight: 3 },
    ],
  },
  {
    id: "PROJECT_IDEAL_CALC",
    patterns: [
      /ideal calc|calculadora ideal/,
      /calculadora estatistica/,
      /ibge|censo 2022|pnad/,
    ],
    keywords: [
      { term: "ideal calc", weight: 8 },
      { term: "idealcalc", weight: 8 },
      { term: "calculadora", weight: 4 },
      { term: "ibge", weight: 6 },
      { term: "censo", weight: 4 },
      { term: "pnad", weight: 4 },
      { term: "parceiro ideal", weight: 6 },
    ],
  },
  {
    id: "PROJECT_SOUL_FIGHTER",
    patterns: [
      /soul fighter/,
      /jogo da memoria/,
      /memory game/,
    ],
    keywords: [
      { term: "soul fighter", weight: 8 },
      { term: "soulfighter", weight: 8 },
      { term: "jogo da memoria", weight: 6 },
      { term: "memory game", weight: 6 },
      { term: "league of legends", weight: 4 },
      { term: "lol", weight: 3 },
      { term: "card flip", weight: 3 },
    ],
  },
  {
    id: "PROJECT_PEX_WIKI",
    patterns: [
      /pex wiki|pex-wiki/,
      /projetos? de extensao/,
      /ods da onu|blurple/,
    ],
    keywords: [
      { term: "pex wiki", weight: 8 },
      { term: "pex", weight: 6 },
      { term: "wiki", weight: 4 },
      { term: "ods", weight: 4 },
      { term: "blurple", weight: 4 },
      { term: "extensao", weight: 3 },
    ],
  },
  {
    id: "PROJECT_MOBILE_DEMO",
    patterns: [
      /app mobile demo|mobile demo/,
      /projeto mobile|aplicativo mobile/,
    ],
    keywords: [
      { term: "mobile demo", weight: 7 },
      { term: "app demo", weight: 6 },
      { term: "react native", weight: 4 },
      { term: "mobile", weight: 2 },
    ],
  },
  {
    id: "PROJECTS_OVERVIEW",
    patterns: [
      /quais (sao )?(os )?(seus )?projetos/,
      /mostre (os )?projetos/,
      /o que (voce|o aster) (ja )?(construiu|fez|desenvolveu)/,
      /portfolio|trabalhos|cases/,
    ],
    keywords: [
      { term: "projetos", weight: 5 },
      { term: "portfolio", weight: 5 },
      { term: "construiu", weight: 4 },
      { term: "trabalhos", weight: 4 },
      { term: "cases", weight: 4 },
      { term: "apps", weight: 3 },
    ],
    negativeKeywords: ["ideal", "soul", "pex", "mobile demo"],
  },
  {
    id: "TECH_STACK",
    patterns: [
      /qual (e )?(a )?(sua )?stack/,
      /quais (sao )?(as )?(suas )?(tecnologias|habilidades|skills|linguagens)/,
      /o que (voce|o aster) usa para programar/,
      /quais frameworks/,
    ],
    keywords: [
      { term: "stack", weight: 6 },
      { term: "tecnologias", weight: 5 },
      { term: "linguagens", weight: 5 },
      { term: "skills", weight: 5 },
      { term: "habilidades", weight: 4 },
      { term: "frameworks", weight: 4 },
      { term: "react", weight: 3 },
      { term: "typescript", weight: 3 },
      { term: "next", weight: 3 },
      { term: "tailwind", weight: 3 },
      { term: "astro", weight: 3 },
      { term: "vue", weight: 3 },
      { term: "ferramentas", weight: 3 },
    ],
  },
  {
    id: "EDUCATION",
    patterns: [
      /onde (o aster )?estuda/,
      /qual faculdade|formacao academica/,
      /ciencia da computacao/,
      /uniamerica/,
    ],
    keywords: [
      { term: "faculdade", weight: 5 },
      { term: "uniamerica", weight: 7 },
      { term: "ciencia da computacao", weight: 6 },
      { term: "semestre", weight: 4 },
      { term: "formacao", weight: 4 },
      { term: "estudos", weight: 3 },
      { term: "lideranca tecnica", weight: 5 },
      { term: "comunidade academica", weight: 5 },
    ],
  },
  {
    id: "RESUME_CV",
    patterns: [
      /como (posso )?baixar o curriculo/,
      /curriculo|resume|cv/,
      /download (do )?curriculo/,
    ],
    keywords: [
      { term: "curriculo", weight: 7 },
      { term: "cv", weight: 7 },
      { term: "resume", weight: 6 },
      { term: "baixar curriculo", weight: 8 },
      { term: "download cv", weight: 8 },
      { term: "pdf", weight: 3 },
    ],
  },
  {
    id: "CONTACT_SOCIAL",
    patterns: [
      /como (posso )?(entrar em )?contato/,
      /como falar com (o aster|voce)/,
      /redes sociais|links|linkedin|github|email/,
    ],
    keywords: [
      { term: "contato", weight: 6 },
      { term: "email", weight: 6 },
      { term: "linkedin", weight: 6 },
      { term: "github", weight: 5 },
      { term: "falar com", weight: 4 },
      { term: "redes sociais", weight: 5 },
      { term: "redes", weight: 3 },
    ],
  },
  {
    id: "BLOG_HACKATHONS",
    patterns: [
      /hackathon|hackathons/,
      /blog|devlog|artigos/,
    ],
    keywords: [
      { term: "hackathon", weight: 7 },
      { term: "hackathons", weight: 7 },
      { term: "blog", weight: 6 },
      { term: "devlog", weight: 5 },
      { term: "competicoes", weight: 4 },
    ],
  },
  {
    id: "ABOUT_ASTER",
    patterns: [
      /quem e (o )?aster/,
      /quem e voce/,
      /sobre o aster/,
      /fale sobre (voce|o aster)/,
      /apresente-se/,
      /biografia/,
      /who (is|are) (aster|you)/,
      /about aster/,
    ],
    keywords: [
      { term: "quem e aster", weight: 8 },
      { term: "quem e", weight: 4 },
      { term: "sobre o aster", weight: 7 },
      { term: "sobre voce", weight: 5 },
      { term: "biografia", weight: 5 },
      { term: "historia", weight: 4 },
      { term: "who is aster", weight: 8 },
      { term: "about aster", weight: 7 },
      { term: "who are you", weight: 8 },
      { term: "aster", weight: 2 },
    ],
  },
  {
    id: "FAREWELL",
    patterns: [
      /^(tchau|adeus|ate mais|ate logo|falou|valeu|obrigado|obrigada|thanks|bye)\b/,
    ],
    keywords: [
      { term: "tchau", weight: 4 },
      { term: "valeu", weight: 4 },
      { term: "obrigado", weight: 4 },
      { term: "obrigada", weight: 4 },
      { term: "ate mais", weight: 4 },
      { term: "bye", weight: 4 },
    ],
  },
];

// ─── Response Knowledge Base ──────────────────────────────────────────────

interface LocalizedResponse {
  pt: {
    text: string;
    actions?: ActionButton[];
    suggestions: string[];
  };
  en: {
    text: string;
    actions?: ActionButton[];
    suggestions: string[];
  };
}

const RESPONSES: Record<IntentId, LocalizedResponse> = {
  GREETING: {
    pt: {
      text: "Olá! 👋 Sou o AsterBot, o assistente virtual do Aster. Estou aqui para responder dúvidas sobre a trajetória dele, projetos (Ideal Calc, PEX Wiki, Soul Fighter...), stack técnica e contatos. Sobre o que você gostaria de conversar?",
      suggestions: [
        "Quem é o Aster?",
        "Quais são os projetos?",
        "Qual é a sua stack?",
        "Como entrar em contato?",
      ],
    },
    en: {
      text: "Hello! 👋 I am AsterBot, Aster's virtual assistant. I am here to answer questions about his career, projects (Ideal Calc, PEX Wiki, Soul Fighter...), tech stack, and contacts. What would you like to know?",
      suggestions: [
        "Who is Aster?",
        "What are his projects?",
        "What is his tech stack?",
        "How can I contact him?",
      ],
    },
  },
  ABOUT_ASTER: {
    pt: {
      text: "O Aster é Desenvolvedor Frontend focado em interfaces fluidas, de alta performance e arquiteturas limpas. Está atualmente no 5º semestre de Ciência da Computação na UniAmérica, onde lidera uma comunidade acadêmica voltada a projetos colaborativos e mentoria.\n\nSua mentalidade de engenharia une curiosidade de baixo nível (veio da engenharia reversa e servidores de jogos), disciplina física (treina para completar um triathlon Ironman) e estudo contínuo de idiomas (Mandarim e Japonês).",
      suggestions: [
        "Como começou na programação?",
        "Treino para o Ironman?",
        "Quais são os projetos?",
        "Qual a formação acadêmica?",
      ],
    },
    en: {
      text: "Aster is a Frontend Developer focused on fluid interfaces, high performance, and clean architectures. He is currently in his 5th semester of Computer Science at UniAmérica, where he leads an academic community for collaborative projects and mentorship.\n\nHis engineering mindset combines low-level curiosity (rooted in reverse engineering and online game servers), physical discipline (training for an Ironman triathlon), and continuous language learning (Mandarin and Japanese).",
      suggestions: [
        "How did he start coding?",
        "Ironman training?",
        "What are his projects?",
        "Education & Community?",
      ],
    },
  },
  REVERSE_ENGINEERING: {
    pt: {
      text: "A porta de entrada do Aster para a programação não foi convencional: começou configurando servidores de jogos online e dissecando executáveis via engenharia reversa para criar cheats.\n\nEssa exploração prática o forçou a entender desde muito cedo como a memória da máquina opera, como pacotes e fluxos de dados são interceptados e como as estruturas funcionam em baixo nível. Hoje, ele canaliza essa mentalidade analítica para construir aplicações web extremamente performáticas e seguras.",
      suggestions: [
        "Qual a stack atual?",
        "Quais os projetos dele?",
        "Quem é o Aster?",
      ],
    },
    en: {
      text: "Aster's entry into programming was hands-on: he started by configuring online game servers and dissecting binaries through reverse engineering to develop cheats.\n\nThis early exploration taught him machine memory structures, packet inspection, and low-level system logic. Today, he channels that sharp analytical edge into creating performant, rock-solid web applications.",
      suggestions: [
        "What is his tech stack?",
        "Show projects",
        "Who is Aster?",
      ],
    },
  },
  IRONMAN_TRIATHLON: {
    pt: {
      text: "Para além do código, o Aster aplica uma disciplina inegociável na vida real: treina com a meta de completar um triathlon Ironman (3.8 km de natação, 180 km de ciclismo e 42.2 km de corrida).\n\nEssa rotina de alta exigência reflete diretamente em sua atuação como engenheiro: consistência diária, foco em metas de longo prazo e resiliência diante de desafios complexos.",
      suggestions: [
        "Quem é o Aster?",
        "Quais são os projetos?",
        "Qual a stack técnica?",
      ],
    },
    en: {
      text: "Beyond code, Aster maintains rigorous discipline: he is actively training to complete an Ironman triathlon (3.8 km swim, 180 km bike, 42.2 km marathon run).\n\nThis endurance mindset directly informs his work as a software engineer: daily consistency, long-term focus, and grit when solving complex technical hurdles.",
      suggestions: [
        "Who is Aster?",
        "What are his projects?",
        "What is his tech stack?",
      ],
    },
  },
  TECH_STACK: {
    pt: {
      text: "A stack técnica do Aster é construída com foco em modernidade, velocidade e tipagem sólida:\n\n• Frontend: React, Next.js, Vue.js, Astro, TypeScript, JavaScript (ES6+), Tailwind CSS\n• Mobile & Sistemas: Flutter, Dart, React Native, C++\n• Backend & Infra: Node.js, SQL, Vercel, Cloudflare, Git/GitHub\n• Produtividade & PKM: Notion e Obsidian (fluxos de documentação e gestão do conhecimento)\n• Idiomas: Português (nativo), Inglês (avançado), Mandarim e Japonês (em aprendizado)",
      suggestions: [
        "Quais projetos usam essa stack?",
        "Baixar Currículo",
        "Ver Ideal Calc",
      ],
    },
    en: {
      text: "Aster's tech stack is centered on modernity, speed, and strict type safety:\n\n• Frontend: React, Next.js, Vue.js, Astro, TypeScript, JavaScript (ES6+), Tailwind CSS\n• Mobile & Systems: Flutter, Dart, React Native, C++\n• Backend & Infra: Node.js, SQL, Vercel, Cloudflare, Git/GitHub\n• Productivity & PKM: Notion and Obsidian\n• Human Languages: Portuguese (Native), English (Advanced), Mandarin & Japanese (Learning)",
      suggestions: [
        "Which projects use this stack?",
        "Download Resume",
        "Check Ideal Calc",
      ],
    },
  },
  PROJECTS_OVERVIEW: {
    pt: {
      text: "Aqui estão os principais projetos em destaque no portfólio:\n\n1. 📊 Ideal Calc: Calculadora estatística interativa cruzando 12 filtros demográficos com microdados oficiais do IBGE (Censo 2022 / PNAD 2023).\n2. 🎮 Soul Fighter: Memory Game: Jogo da memória temático de LoL com JavaScript vanilla e card-flip dinâmico.\n3. 📚 PEX Wiki: Hub de projetos acadêmicos e ODS da ONU para alunos de Ciência da Computação (SPA em Vanilla JS).\n4. 📱 Mobile Demo: Aplicação mobile em React Native.",
      actions: [
        { label: "Abrir Ideal Calc ↗", url: "https://idealcalc.app/" },
        { label: "Jogar Soul Fighter ↗", url: "https://zastergun.github.io/Soul-Fighter-Memory-Game/" },
        { label: "Visitar PEX Wiki ↗", url: "https://pex-wiki.vercel.app/" },
      ],
      suggestions: [
        "Me fale sobre o Ideal Calc",
        "Me fale sobre a PEX Wiki",
        "Qual é a sua stack?",
      ],
    },
    en: {
      text: "Here are the featured projects highlighted in Aster's portfolio:\n\n1. 📊 Ideal Calc: Interactive demographic calculator crossing 12 filters with official Brazilian IBGE microdata.\n2. 🎮 Soul Fighter: Memory Game: LoL-themed card game built in vanilla JS with custom animations.\n3. 📚 PEX Wiki: Academic knowledge base for Computer Science students with UN SDG mapping (SPA in Vanilla JS).\n4. 📱 Mobile Demo: React Native mobile showcase application.",
      actions: [
        { label: "Open Ideal Calc ↗", url: "https://idealcalc.app/" },
        { label: "Play Soul Fighter ↗", url: "https://zastergun.github.io/Soul-Fighter-Memory-Game/" },
        { label: "Visit PEX Wiki ↗", url: "https://pex-wiki.vercel.app/" },
      ],
      suggestions: [
        "Tell me about Ideal Calc",
        "Tell me about PEX Wiki",
        "What is his tech stack?",
      ],
    },
  },
  PROJECT_IDEAL_CALC: {
    pt: {
      text: "O Ideal Calc é uma aplicação estatística que processa microdados públicos do IBGE (Censo 2022 e PNAD Contínua 2023). Permite cruzar 12 variáveis simultâneas (faixa etária, escolaridade, renda, estado civil, região, etc.) para calcular a probabilidade real de encontrar um parceiro com determinadas características no Brasil.\n\nPossui cálculo em tempo real no cliente, geração de card viral para compartilhamento e metodologia auditável.",
      actions: [
        { label: "Acessar Ideal Calc ↗", url: "https://idealcalc.app/" },
        { label: "Código no GitHub ↗", url: "https://github.com/zAstergun/ideal-calculator" },
      ],
      suggestions: [
        "Ver outros projetos",
        "Qual a stack do Aster?",
        "Como entrar em contato?",
      ],
    },
    en: {
      text: "Ideal Calc is a statistical web application that processes official IBGE microdata (2022 Census & 2023 PNAD). It crosses 12 demographic variables simultaneously to calculate the probability of finding a partner with chosen traits in Brazil.\n\nFeatures client-side instant calculation, viral card generation, and audit-ready data sources.",
      actions: [
        { label: "Launch Ideal Calc ↗", url: "https://idealcalc.app/" },
        { label: "GitHub Repository ↗", url: "https://github.com/zAstergun/ideal-calculator" },
      ],
      suggestions: [
        "Show other projects",
        "What is Aster's stack?",
        "Contact info",
      ],
    },
  },
  PROJECT_SOUL_FIGHTER: {
    pt: {
      text: "O Soul Fighter: Memory Game é um jogo da memória web ambientado no torneio Soul Fighter de League of Legends. Foi construído com JavaScript Vanilla, empregando lógica de embaralhamento determinístico, flip cards 3D com CSS e design responsivo com identidade visual rica e imersiva.",
      actions: [
        { label: "Jogar Online ↗", url: "https://zastergun.github.io/Soul-Fighter-Memory-Game/" },
        { label: "Código no GitHub ↗", url: "https://github.com/zAstergun/Soul-Fighter-Memory-Game" },
      ],
      suggestions: [
        "Ver outros projetos",
        "Fale sobre o Ideal Calc",
        "Qual a stack do Aster?",
      ],
    },
    en: {
      text: "Soul Fighter: Memory Game is a browser game set in Riot Games' Soul Fighter universe. Built with pure Vanilla JavaScript, it implements shuffle algorithms, 3D card flips with CSS, and responsive styling matching the game's official visual aesthetic.",
      actions: [
        { label: "Play Game ↗", url: "https://zastergun.github.io/Soul-Fighter-Memory-Game/" },
        { label: "GitHub Code ↗", url: "https://github.com/zAstergun/Soul-Fighter-Memory-Game" },
      ],
      suggestions: [
        "Show other projects",
        "Tell me about Ideal Calc",
        "What is Aster's stack?",
      ],
    },
  },
  PROJECT_PEX_WIKI: {
    pt: {
      text: "A PEX Wiki é um hub acadêmico criado para os alunos de Ciência da Computação da UniAmérica. Centraliza a documentação dos Projetos de Extensão (PEX), alinhados aos 17 Objetivos de Desenvolvimento Sustentável (ODS) da ONU.\n\nDesenvolvido com roteamento SPA em Vanilla JS, tema 'Blurple Gamer' em Dark Mode e checklists interativos de conformidade.",
      actions: [
        { label: "Visitar PEX Wiki ↗", url: "https://pex-wiki.vercel.app/" },
        { label: "Código no GitHub ↗", url: "https://github.com/zAstergun/pex-wiki" },
      ],
      suggestions: [
        "O que o Aster faz na faculdade?",
        "Ver outros projetos",
        "Como entrar em contato?",
      ],
    },
    en: {
      text: "PEX Wiki is an academic platform built for Computer Science students at UniAmérica. It centralizes documentation for Extension Projects (PEX), aligned with the 17 UN Sustainable Development Goals (SDGs).\n\nBuilt as a fast SPA in Vanilla JS, featuring a 'Blurple Gamer' dark mode and interactive compliance checklists.",
      actions: [
        { label: "Visit PEX Wiki ↗", url: "https://pex-wiki.vercel.app/" },
        { label: "GitHub Code ↗", url: "https://github.com/zAstergun/pex-wiki" },
      ],
      suggestions: [
        "What does Aster do in college?",
        "Show other projects",
        "Contact info",
      ],
    },
  },
  PROJECT_MOBILE_DEMO: {
    pt: {
      text: "O App Mobile Demo é uma prova de conceito para mobile construída com React Native, explorando navegação por gestos, renderização otimizada de listas e consistência visual entre Android e iOS.",
      actions: [
        { label: "Código no GitHub ↗", url: "https://github.com/zAstergun/app-mobile-demo" },
      ],
      suggestions: [
        "Ver outros projetos",
        "Qual a stack técnica?",
        "Baixar Currículo",
      ],
    },
    en: {
      text: "The App Mobile Demo is a mobile proof-of-concept crafted with React Native, exploring gesture-driven navigation, list rendering optimizations, and multi-platform consistency across Android and iOS.",
      actions: [
        { label: "GitHub Code ↗", url: "https://github.com/zAstergun/app-mobile-demo" },
      ],
      suggestions: [
        "Show other projects",
        "What is his tech stack?",
        "Download Resume",
      ],
    },
  },
  BLOG_HACKATHONS: {
    pt: {
      text: "Na seção de Blog & Hackathons, o Aster documenta processos de engenharia, participações em maratonas de código, desafios e lições aprendidas em projetos colaborativos. A intenção é expor não apenas o código final, mas a tomada de decisão técnica.",
      suggestions: [
        "Quais são os projetos?",
        "Qual a stack técnica?",
        "Quem é o Aster?",
      ],
    },
    en: {
      text: "In the Blog & Hackathons section, Aster documents engineering decisions, hackathon sprints, coding challenges, and lessons learned in collaborative work. The goal is to highlight not just final code, but engineering problem solving.",
      suggestions: [
        "What are his projects?",
        "What is his tech stack?",
        "Who is Aster?",
      ],
    },
  },
  EDUCATION: {
    pt: {
      text: "O Aster está no 5º semestre de Ciência da Computação no Centro Universitário União das Américas (UniAmérica).\n\nAlém das disciplinas regulares, ele atua ativamente na governança técnica e liderança da comunidade acadêmica: coordena repositórios de projetos de extensão, padroniza documentações, revisa Pull Requests e auxilia no nivelamento técnico de outros estudantes.",
      suggestions: [
        "Quais são os projetos dele?",
        "Baixar Currículo",
        "Como entrar em contato?",
      ],
    },
    en: {
      text: "Aster is currently in his 5th semester of Computer Science at Centro Universitário União das Américas (UniAmérica).\n\nBeyond academics, he actively leads the student developer community: coordinating extension project repositories, establishing documentation standards, reviewing PRs, and mentoring fellow peers.",
      suggestions: [
        "What are his projects?",
        "Download Resume",
        "Contact info",
      ],
    },
  },
  RESUME_CV: {
    pt: {
      text: "Você pode conferir ou baixar o currículo completo do Aster nos formatos mais convenientes:\n\n• PDF (formatado para recrutadores)\n• DOCX (editável)\n• Markdown e JSON (estruturados)",
      actions: [
        { label: "Baixar PDF 📄", url: "/Currículo_Aster_Frontend.pdf", type: "download" },
        { label: "Baixar DOCX 📘", url: "/Currículo_Aster_Frontend.docx", type: "download" },
        { label: "Ver Markdown 📄", url: "/Currículo_Aster_Frontend.md", type: "download" },
      ],
      suggestions: [
        "Qual é a stack técnica?",
        "Quais são os projetos?",
        "Como entrar em contato?",
      ],
    },
    en: {
      text: "You can download Aster's full resume in multiple formats:\n\n• PDF (tailored for recruiters)\n• DOCX (editable)\n• Markdown & JSON (structured data)",
      actions: [
        { label: "Download PDF 📄", url: "/Currículo_Aster_Frontend.pdf", type: "download" },
        { label: "Download DOCX 📘", url: "/Currículo_Aster_Frontend.docx", type: "download" },
        { label: "View Markdown 📄", url: "/Currículo_Aster_Frontend.md", type: "download" },
      ],
      suggestions: [
        "What is his tech stack?",
        "What are his projects?",
        "Contact info",
      ],
    },
  },
  CONTACT_SOCIAL: {
    pt: {
      text: "Você pode se conectar com o Aster pelos seguintes canais oficiais:\n\n• GitHub: github.com/zAstergun\n• Email: hello@asterdev.me\n• LinkedIn: Disponível no app 'Sobre Mim' do celular",
      actions: [
        { label: "GitHub: zAstergun ↗", url: "https://github.com/zAstergun" },
        { label: "Enviar Email ✉️", url: "mailto:hello@asterdev.me" },
      ],
      suggestions: [
        "Baixar Currículo",
        "Quais são os projetos?",
        "Quem é o Aster?",
      ],
    },
    en: {
      text: "You can reach Aster through these official channels:\n\n• GitHub: github.com/zAstergun\n• Email: hello@asterdev.me\n• LinkedIn: Available in the 'About Me' phone app",
      actions: [
        { label: "GitHub: zAstergun ↗", url: "https://github.com/zAstergun" },
        { label: "Send Email ✉️", url: "mailto:hello@asterdev.me" },
      ],
      suggestions: [
        "Download Resume",
        "What are his projects?",
        "Who is Aster?",
      ],
    },
  },
  BOT_CAPABILITIES: {
    pt: {
      text: "Eu sou um assistente conversacional movido por um Classificador de Intenções Heurístico direto no seu navegador. Você pode me perguntar sobre:\n\n1. Trajetória e perfil do Aster (origem na engenharia reversa, Ironman, estudos)\n2. Projetos (Ideal Calc, Soul Fighter, PEX Wiki, Mobile Demo)\n3. Stack tecnológica e ferramentas\n4. Faculdade UniAmérica e liderança de comunidade\n5. Currículo e formas de contato",
      suggestions: [
        "Quem é o Aster?",
        "Quais são os projetos?",
        "Qual é a sua stack?",
        "Como funciona o classificador?",
      ],
    },
    en: {
      text: "I am a client-side conversational assistant powered by a Heuristic Intent Classifier. You can ask me about:\n\n1. Aster's background (reverse engineering origins, Ironman, studies)\n2. Projects (Ideal Calc, Soul Fighter, PEX Wiki, Mobile Demo)\n3. Tech stack and tooling\n4. College & community leadership\n5. Resume and contact channels",
      suggestions: [
        "Who is Aster?",
        "What are his projects?",
        "What is his tech stack?",
        "How does the classifier work?",
      ],
    },
  },
  HOW_CLASSIFIER_WORKS: {
    pt: {
      text: "Eu não dependo de chamadas para APIs externas ou servidores pesados! Fui construído com um Classificador de Intenções Heurístico em TypeScript puro executado 100% no cliente:\n\n1. 🔤 Normalização: Remoção de diacríticos/acentos, case folding e limpeza de pontuação.\n2. 🧩 Extração de N-Grams: Geração de uni-grams, bi-grams e tri-grams da frase.\n3. ⚖️ Matriz de Pesos: Combinação de padrões regex ponderados com palavras-chave de alta relevância e termos negativos de desambiguação.\n4. 🎯 Score e Confiança: Seleção determinística da melhor intenção com resposta instantânea (<1ms).",
      suggestions: [
        "Quem é o Aster?",
        "Quais são os projetos?",
        "Qual a stack técnica?",
      ],
    },
    en: {
      text: "I do not rely on remote external APIs or heavy servers! I was built with a pure TypeScript Heuristic Intent Classifier running 100% in your browser:\n\n1. 🔤 Normalization: Diacritics stripping, lowercasing, and punctuation cleanup.\n2. 🧩 N-Gram Extraction: Tokenization into unigrams, bigrams, and trigrams.\n3. ⚖️ Weight Matrix: Combining weighted regex patterns, domain keywords, and negative exclusion terms.\n4. 🎯 Deterministic Scoring: Selecting the best intent in <1ms latency.",
      suggestions: [
        "Who is Aster?",
        "What are his projects?",
        "What is his tech stack?",
      ],
    },
  },
  FAREWELL: {
    pt: {
      text: "Valeu por passar por aqui! Se precisar tirar mais dúvidas sobre o Aster ou os projetos, é só mandar mensagem. Até mais! 🚀",
      suggestions: [
        "Ver projetos",
        "Baixar Currículo",
        "Como entrar em contato?",
      ],
    },
    en: {
      text: "Thanks for stopping by! If you need any more info about Aster or his work, just message here. See you around! 🚀",
      suggestions: [
        "Show projects",
        "Download Resume",
        "Contact info",
      ],
    },
  },
  FALLBACK: {
    pt: {
      text: "Não consegui identificar com certeza o que você quis dizer, mas posso responder tudo sobre o Aster e os projetos dele! Tente escolher uma das opções abaixo ou formule a pergunta com outras palavras:",
      suggestions: [
        "Quem é o Aster?",
        "Quais são os projetos?",
        "Qual é a sua stack?",
        "Como entrar em contato?",
        "Baixar Currículo",
      ],
    },
    en: {
      text: "I couldn't quite match that with confidence, but I can answer everything about Aster and his work! Pick one of the topics below or ask with different words:",
      suggestions: [
        "Who is Aster?",
        "What are his projects?",
        "What is his tech stack?",
        "How to contact him?",
        "Download Resume",
      ],
    },
  },
};

// ─── Core Classifier Function ─────────────────────────────────────────────

export function classifyIntent(
  userInput: string,
  lang: "pt" | "en" | string = "pt"
): ClassifierResult {
  const normalized = normalizeText(userInput);

  if (!normalized) {
    const isEn = lang === "en";
    const res = RESPONSES.GREETING[isEn ? "en" : "pt"];
    return {
      intent: "GREETING",
      confidence: 1.0,
      matchedTokens: [],
      response: res.text,
      actions: res.actions,
      suggestions: res.suggestions,
    };
  }

  const tokens = extractTokens(normalized);
  const tokenSet = new Set(tokens);

  let bestIntent: IntentId = "FALLBACK";
  let highestScore = 0;
  let bestMatchedTokens: string[] = [];

  for (const def of INTENT_DEFINITIONS) {
    let score = 0;
    const currentMatched: string[] = [];

    // Check negative keywords (if matched, heavily penalize this intent)
    if (def.negativeKeywords) {
      for (const neg of def.negativeKeywords) {
        const normNeg = normalizeText(neg);
        if (tokenSet.has(normNeg)) {
          score -= 4;
        }
      }
    }

    // Check regex patterns
    for (const pattern of def.patterns) {
      if (pattern.test(normalized)) {
        score += 8;
        currentMatched.push(`pattern:${pattern.source}`);
        break; // Match first pattern
      }
    }

    // Check weighted keywords / n-grams
    for (const kw of def.keywords) {
      const normKw = normalizeText(kw.term);
      if (tokenSet.has(normKw)) {
        score += kw.weight;
        currentMatched.push(normKw);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestIntent = def.id;
      bestMatchedTokens = currentMatched;
    }
  }

  // Threshold: if score is too low (< 3.0), trigger FALLBACK
  const minThreshold = 3.0;
  if (highestScore < minThreshold) {
    bestIntent = "FALLBACK";
  }

  // Calculate normalized confidence (clamped between 0.0 and 1.0)
  const confidence = Math.min(1.0, Math.max(0.1, Number((highestScore / 12).toFixed(2))));

  // Resolve response by language
  const isEn = lang === "en";
  const localized = RESPONSES[bestIntent] || RESPONSES.FALLBACK;
  const res = isEn ? localized.en : localized.pt;

  return {
    intent: bestIntent,
    confidence,
    matchedTokens: bestMatchedTokens,
    response: res.text,
    actions: res.actions,
    suggestions: res.suggestions,
  };
}
