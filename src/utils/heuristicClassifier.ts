// ─── Heuristic Intent Classifier for Aster.Dev ────────────────────────────
// Pure TypeScript client-side classifier with full support for 15 languages:
// br, pt, en, es, fr, de, it, nl, ru, ar, jp, cn, kr, vn, id.

import { resolveBotLanguage, BOT_RESPONSES, type BotLanguage } from "./botI18n";

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
    .replace(/[-_]+/g, "-") // normalize dashes/underscores
    .replace(/[^\p{L}\p{N}\s-]/gu, " ") // keep Unicode letters & numbers across scripts (Arabic, CJK, Cyrillic, Latin)
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTokens(normalized: string): string[] {
  if (!normalized) return [];
  const words = normalized.split(" ").filter((w) => w.length > 0);
  const ngrams: string[] = [...words];

  // Word-level bigrams and trigrams
  for (let i = 0; i < words.length - 1; i++) {
    ngrams.push(`${words[i]} ${words[i + 1]}`);
  }
  for (let i = 0; i < words.length - 2; i++) {
    ngrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }

  // Character-level ngrams for non-segmented languages (CJK: Japanese, Chinese, Korean)
  const compact = normalized.replace(/\s+/g, "");
  if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/u.test(compact)) {
    for (let len = 2; len <= 4; len++) {
      for (let i = 0; i <= compact.length - len; i++) {
        ngrams.push(compact.substring(i, i + len));
      }
    }
  }

  return ngrams;
}

// ─── Multilingual Intent Definitions ──────────────────────────────────────

const INTENT_DEFINITIONS: IntentDefinition[] = [
  {
    id: "GREETING",
    patterns: [
      /^(oi|ola|opa|e ai|eai|fala|hey|hello|hi|salve|oie|bom dia|boa tarde|boa noite)\b/,
      /^(hola|buenos dias|buenas tardes|buenas noches)\b/,
      /^(bonjour|salut|bon apres-midi|bonsoir)\b/,
      /^(hallo|guten morgen|guten tag|guten abend|moin)\b/,
      /^(ciao|buongiorno|buonasera)\b/,
      /^(hallo|goedemorgen|goedenavond)\b/,
      /^(привет|здравствуйте|добрый день|добрый вечер|хай)\b/u,
      /^(مرحبا|اهلا|سلام|صباح الخير|مساء الخير)\b/u,
      /^(こんにちは|こんばんは|おはよう|やあ)\b/u,
      /^(你好|您好|早上好|下午好|晚上好|嗨)\b/u,
      /^(안녕하세요|안녕|반갑습니다)\b/u,
      /^(xin chao|chao ban)\b/,
      /^(halo|selamat pagi|selamat siang|selamat sore|selamat malam)\b/,
    ],
    keywords: [
      // Portuguese & Spanish
      { term: "ola", weight: 3 },
      { term: "oi", weight: 3 },
      { term: "opa", weight: 3 },
      { term: "hola", weight: 3 },
      { term: "buenos dias", weight: 3 },
      // English
      { term: "hello", weight: 3 },
      { term: "hi", weight: 3 },
      { term: "hey", weight: 3 },
      // French & Italian & German & Dutch
      { term: "bonjour", weight: 3 },
      { term: "salut", weight: 3 },
      { term: "ciao", weight: 3 },
      { term: "guten tag", weight: 3 },
      // Russian & Arabic
      { term: "привет", weight: 3 },
      { term: "здравствуйте", weight: 3 },
      { term: "مرحبا", weight: 3 },
      { term: "اهلا", weight: 3 },
      // Japanese, Chinese, Korean, Vietnamese, Indonesian
      { term: "こんにちは", weight: 4 },
      { term: "你好", weight: 4 },
      { term: "안녕하세요", weight: 4 },
      { term: "xin chao", weight: 4 },
      { term: "halo", weight: 3 },
    ],
    negativeKeywords: ["ideal", "calc", "projeto", "projects", "stack", "curriculo", "resume", "cv"],
  },
  {
    id: "HOW_CLASSIFIER_WORKS",
    patterns: [
      /como (voce|o bot|esse bot|o classificador) (funciona|foi feito|opera)/,
      /how does (this|the) (bot|classifier) work/,
      /como funciona el (bot|clasificador)/,
      /comment fonctionne (le bot|le classificateur)/,
      /wie funktioniert der (bot|klassifikator)/,
      /come funziona il (bot|classificatore)/,
      /как работает (бот|классификатор)/u,
      /كيف يعمل (البوت|المصنف)/u,
      /(ボット|分類器)の仕組み/u,
      /(机器人|分类器)如何运作/u,
      /(봇|분류기) 작동 원리/u,
    ],
    keywords: [
      { term: "classificador", weight: 6 },
      { term: "heuristico", weight: 6 },
      { term: "heuristica", weight: 6 },
      { term: "classifier", weight: 6 },
      { term: "heuristic", weight: 6 },
      { term: "clasificador", weight: 6 },
      { term: "heuristique", weight: 6 },
      { term: "klassifikator", weight: 6 },
      { term: "classificatore", weight: 6 },
      { term: "классификатор", weight: 6 },
      { term: "эвристический", weight: 6 },
      { term: "مصنف", weight: 6 },
      { term: "ارتقائي", weight: 6 },
      { term: "分類器", weight: 6 },
      { term: "ヒューリスティック", weight: 6 },
      { term: "分类器", weight: 6 },
      { term: "启发式", weight: 6 },
      { term: "분류기", weight: 6 },
      { term: "휴리스틱", weight: 6 },
      { term: "phân loại", weight: 6 },
      { term: "pengklasifikasi", weight: 6 },
    ],
  },
  {
    id: "BOT_CAPABILITIES",
    patterns: [
      /o que (voce|o bot) (sabe|faz|pode fazer|consegue responder)/,
      /what can (you|this bot) do/,
      /que puedes hacer/,
      /que pouvez vous faire/,
      /was kannst du tun/,
      /cosa puoi fare/,
      /что ты умеешь/u,
      /ماذا يمكنك ان تفعل/u,
      /何ができますか/u,
      /你能做什么/u,
      /무엇을 할 수 있나요/u,
      /ban co the lam gi/,
      /apa yang bisa kamu lakukan/,
      /^(ajuda|help|ayuda|aide|hilfe|aiuto|hulp|помощь|مساعدة|ヘルプ|帮助|도움말|tro giup|bantuan)$/i,
    ],
    keywords: [
      { term: "ajuda", weight: 4 },
      { term: "help", weight: 4 },
      { term: "ayuda", weight: 4 },
      { term: "aide", weight: 4 },
      { term: "hilfe", weight: 4 },
      { term: "aiuto", weight: 4 },
      { term: "помощь", weight: 4 },
      { term: "مساعدة", weight: 4 },
      { term: "ヘルプ", weight: 4 },
      { term: "帮助", weight: 4 },
      { term: "도움말", weight: 4 },
      { term: "tro giup", weight: 4 },
      { term: "bantuan", weight: 4 },
      { term: "capacidades", weight: 4 },
    ],
  },
  {
    id: "REVERSE_ENGINEERING",
    patterns: [
      /engenharia reversa/,
      /reverse engineering/,
      /ingenieria inversa/,
      /retro-ingenierie/,
      /обратная разработка|реверс-инжиниринг/u,
      /الهندسة العكسية/u,
      /リバースエンジニアリング/u,
      /逆向工程/u,
      /리버스 엔지니어링/u,
      /ky thuat dich nguoc/,
      /rekayasa balik/,
      /como comecou a programar/,
      /how did (he|you) start coding/,
    ],
    keywords: [
      { term: "engenharia reversa", weight: 7 },
      { term: "reverse engineering", weight: 7 },
      { term: "ingenieria inversa", weight: 7 },
      { term: "cheats", weight: 6 },
      { term: "cheat", weight: 6 },
      { term: "servidores de jogos", weight: 5 },
      { term: "game servers", weight: 5 },
      { term: "baixo nivel", weight: 4 },
      { term: "low level", weight: 4 },
      { term: "реверс", weight: 6 },
      { term: "العكسية", weight: 6 },
      { term: "リバース", weight: 6 },
      { term: "逆向", weight: 6 },
      { term: "리버스", weight: 6 },
    ],
  },
  {
    id: "IRONMAN_TRIATHLON",
    patterns: [
      /ironman/,
      /triathlon|triatlo|triatlon/,
      /триатлон/u,
      /ترياثلون/u,
      /トライアスロン/u,
      /铁人三项/u,
      /철인3종|철인 3종/u,
    ],
    keywords: [
      { term: "ironman", weight: 8 },
      { term: "triathlon", weight: 8 },
      { term: "triatlo", weight: 7 },
      { term: "triatlon", weight: 7 },
      { term: "триатлон", weight: 8 },
      { term: "ترياثلون", weight: 8 },
      { term: "トライアスロン", weight: 8 },
      { term: "铁人三项", weight: 8 },
      { term: "철인3종", weight: 8 },
      { term: "natacao", weight: 3 },
      { term: "ciclismo", weight: 3 },
      { term: "corrida", weight: 3 },
      { term: "marathon", weight: 3 },
    ],
  },
  {
    id: "PROJECT_IDEAL_CALC",
    patterns: [
      /ideal calc|idealcalc/,
      /calculadora (ideal|estatistica)/,
      /statistical calculator/,
      /ibge|censo 2022|pnad/,
    ],
    keywords: [
      { term: "ideal calc", weight: 8 },
      { term: "idealcalc", weight: 8 },
      { term: "ibge", weight: 7 },
      { term: "calculadora", weight: 4 },
      { term: "calculator", weight: 4 },
      { term: "calculatrice", weight: 4 },
      { term: "rechner", weight: 4 },
      { term: "calcolatrice", weight: 4 },
      { term: "rekenmachine", weight: 4 },
      { term: "калькулятор", weight: 5 },
      { term: "حاسبة", weight: 5 },
      { term: "計算機", weight: 5 },
      { term: "计算器", weight: 5 },
      { term: "계산기", weight: 5 },
      { term: "may tinh", weight: 4 },
      { term: "kalkulator", weight: 4 },
      { term: "censo", weight: 4 },
      { term: "pnad", weight: 4 },
    ],
  },
  {
    id: "PROJECT_SOUL_FIGHTER",
    patterns: [
      /soul fighter|soulfighter/,
      /jogo da memoria|juego de memoria|jeu de memoire|gedachtnisspiel|gioco di memoria/,
      /memory game/,
      /игра на память/u,
      /لعبة الذاكرة/u,
      /記憶ゲーム/u,
      /记忆游戏/u,
      /기억력 게임/u,
      /tro choi tri nho/,
      /game memori/,
    ],
    keywords: [
      { term: "soul fighter", weight: 8 },
      { term: "soulfighter", weight: 8 },
      { term: "memory game", weight: 7 },
      { term: "jogo da memoria", weight: 7 },
      { term: "juego de memoria", weight: 7 },
      { term: "jeu de memoire", weight: 7 },
      { term: "league of legends", weight: 5 },
      { term: "lol", weight: 4 },
      { term: "игра на память", weight: 7 },
      { term: "لعبة الذاكرة", weight: 7 },
      { term: "記憶ゲーム", weight: 7 },
      { term: "记忆游戏", weight: 7 },
      { term: "기억력 게임", weight: 7 },
      { term: "tro choi tri nho", weight: 7 },
      { term: "game memori", weight: 7 },
    ],
  },
  {
    id: "PROJECT_PEX_WIKI",
    patterns: [
      /pex wiki|pex-wiki/,
      /projetos? de extensao|extension projects/,
      /ods da onu|un sdgs|ods/,
    ],
    keywords: [
      { term: "pex wiki", weight: 8 },
      { term: "pex-wiki", weight: 8 },
      { term: "pex", weight: 6 },
      { term: "ods", weight: 5 },
      { term: "sdg", weight: 5 },
      { term: "blurple", weight: 5 },
      { term: "uniamerica", weight: 5 },
    ],
  },
  {
    id: "PROJECT_MOBILE_DEMO",
    patterns: [
      /app mobile demo|mobile demo/,
      /projeto mobile|mobile showcase|aplicacion movil demo/,
    ],
    keywords: [
      { term: "mobile demo", weight: 8 },
      { term: "app demo", weight: 6 },
      { term: "react native", weight: 5 },
      { term: "mobile", weight: 3 },
      { term: "movil", weight: 3 },
    ],
  },
  {
    id: "PROJECTS_OVERVIEW",
    patterns: [
      /quais (sao )?(os )?(seus )?projetos/,
      /what (are|is) (his|your|the) projects/,
      /cuales son (los|sus) proyectos/,
      /quels sont (les|ses) projets/,
      /welche projekte/,
      /quali sono i progetti/,
      /wat zijn de projecten/,
      /какие (есть )?проекты/u,
      /ما هي المشاريع/u,
      /どんなプロジェクト/u,
      /有哪些项目/u,
      /어떤 프로젝트/u,
      /cac du an/,
      /apa saja proyek/,
    ],
    keywords: [
      { term: "projetos", weight: 6 },
      { term: "projects", weight: 6 },
      { term: "proyectos", weight: 6 },
      { term: "projets", weight: 6 },
      { term: "projekte", weight: 6 },
      { term: "progetti", weight: 6 },
      { term: "projecten", weight: 6 },
      { term: "проекты", weight: 6 },
      { term: "المشاريع", weight: 6 },
      { term: "مشاريعه", weight: 7 },
      { term: "مشاريع", weight: 6 },
      { term: "プロジェクト", weight: 6 },
      { term: "项目", weight: 6 },
      { term: "프로젝트", weight: 6 },
      { term: "du an", weight: 6 },
      { term: "proyek", weight: 6 },
      { term: "portfolio", weight: 5 },
      { term: "portafolio", weight: 5 },
    ],
    negativeKeywords: ["ideal", "soul", "pex", "mobile demo"],
  },
  {
    id: "TECH_STACK",
    patterns: [
      /qual (e )?(a )?(sua )?stack/,
      /what is (his|your|the) (tech )?stack/,
      /cual es (su|el) stack/,
      /quel est (son|le) stack/,
      /welcher tech-stack/,
      /qual e il suo stack/,
      /wat is zijn stack/,
      /какой стек/u,
      /ما هو المكدس/u,
      /技術スタック/u,
      /技术栈/u,
      /기술 스택/u,
      /stack cong nghe/,
      /tech stack/,
    ],
    keywords: [
      { term: "stack", weight: 6 },
      { term: "tecnologias", weight: 6 },
      { term: "technologies", weight: 6 },
      { term: "technologien", weight: 6 },
      { term: "tecnologie", weight: 6 },
      { term: "стек", weight: 6 },
      { term: "технологии", weight: 6 },
      { term: "التقنيات", weight: 6 },
      { term: "技術スタック", weight: 7 },
      { term: "技术栈", weight: 7 },
      { term: "기술 스택", weight: 7 },
      { term: "cong nghe", weight: 6 },
      { term: "teknologi", weight: 6 },
      { term: "linguagens", weight: 4 },
      { term: "languages", weight: 4 },
      { term: "frameworks", weight: 4 },
      { term: "react", weight: 3 },
      { term: "typescript", weight: 3 },
      { term: "tailwind", weight: 3 },
    ],
  },
  {
    id: "EDUCATION",
    patterns: [
      /onde (o aster )?estuda|qual faculdade/,
      /where does (he|aster) study|what university/,
      /donde estudia|universidad/,
      /ou etudie-t-il|universite/,
      /wo studiert er|universitat/,
      /dove studia|universita/,
      /где учится|университет/u,
      /اين يدرس|الجامعة/u,
      /大学|学歴/u,
      /大学|就读/u,
      /어디서 공부|대학교/u,
      /hoc o dau|dai hoc/,
      /kuliah di mana|universitas/,
    ],
    keywords: [
      { term: "faculdade", weight: 6 },
      { term: "uniamerica", weight: 8 },
      { term: "ciencia da computacao", weight: 6 },
      { term: "computer science", weight: 6 },
      { term: "ciencias de la computacion", weight: 6 },
      { term: "universidade", weight: 5 },
      { term: "university", weight: 5 },
      { term: "universidad", weight: 5 },
      { term: "universite", weight: 5 },
      { term: "universitat", weight: 5 },
      { term: "университет", weight: 6 },
      { term: "الجامعة", weight: 6 },
      { term: "大学", weight: 6 },
      { term: "대학교", weight: 6 },
      { term: "dai hoc", weight: 6 },
      { term: "universitas", weight: 6 },
    ],
  },
  {
    id: "RESUME_CV",
    patterns: [
      /curriculo|resume|cv|curriculum|lebenslauf/,
      /резюме/u,
      /السيرة الذاتية/u,
      /履歴書/u,
      /简历/u,
      /이력서/u,
      /so yeu ly lich/,
      /baixar curriculo|download resume|descargar curriculum|telecharger cv/,
    ],
    keywords: [
      { term: "curriculo", weight: 7 },
      { term: "cv", weight: 7 },
      { term: "resume", weight: 7 },
      { term: "curriculum", weight: 7 },
      { term: "lebenslauf", weight: 7 },
      { term: "резюме", weight: 7 },
      { term: "السيرة الذاتية", weight: 7 },
      { term: "履歴書", weight: 7 },
      { term: "简历", weight: 7 },
      { term: "이력서", weight: 7 },
      { term: "so yeu ly lich", weight: 7 },
      { term: "pdf", weight: 4 },
      { term: "docx", weight: 4 },
    ],
  },
  {
    id: "CONTACT_SOCIAL",
    patterns: [
      /contato|contact|contacto|kontakt|contatto/,
      /контакты/u,
      /الاتصال|تواصل/u,
      /連絡先/u,
      /联系/u,
      /연락처/u,
      /lien he/,
      /como (posso )?(entrar em )?contato/,
      /how to contact/,
      /como contactar/,
    ],
    keywords: [
      { term: "contato", weight: 7 },
      { term: "contact", weight: 7 },
      { term: "contacto", weight: 7 },
      { term: "kontakt", weight: 7 },
      { term: "contatto", weight: 7 },
      { term: "контакты", weight: 7 },
      { term: "اتصال", weight: 7 },
      { term: "連絡先", weight: 7 },
      { term: "联系", weight: 7 },
      { term: "연락처", weight: 7 },
      { term: "lien he", weight: 7 },
      { term: "kontak", weight: 7 },
      { term: "email", weight: 6 },
      { term: "linkedin", weight: 6 },
      { term: "github", weight: 5 },
    ],
  },
  {
    id: "BLOG_HACKATHONS",
    patterns: [
      /hackathon|hackathons/,
      /blog|devlog|artigos|articles/,
      /хакатон/u,
      /هاكاثون/u,
      /ハッカソン/u,
      /黑客松/u,
      /해커톤/u,
    ],
    keywords: [
      { term: "hackathon", weight: 8 },
      { term: "hackathons", weight: 8 },
      { term: "blog", weight: 7 },
      { term: "devlog", weight: 6 },
      { term: "хакатон", weight: 8 },
      { term: "هاكاثون", weight: 8 },
      { term: "ハッカソン", weight: 8 },
      { term: "黑客松", weight: 8 },
      { term: "해커톤", weight: 8 },
    ],
  },
  {
    id: "ABOUT_ASTER",
    patterns: [
      /quem e (o )?aster|quem e voce/,
      /who is (aster|you)|who are you|about aster/,
      /quien es (aster|tu)|sobre aster/,
      /qui est (aster|vous)/,
      /wer ist aster/,
      /chi e aster/,
      /wie is aster/,
      /кто такой (астер|aster)/u,
      /من هو (استر|aster)/u,
      /(アスター|aster)とは/u,
      /(aster|阿斯特)\s*是谁|关于\s*(aster|阿斯特)/u,
      /aster\s*는\s*누구/u,
      /aster la ai/,
      /siapa aster/,
    ],
    keywords: [
      { term: "quem e aster", weight: 8 },
      { term: "who is aster", weight: 8 },
      { term: "quien es aster", weight: 8 },
      { term: "qui est aster", weight: 8 },
      { term: "wer ist aster", weight: 8 },
      { term: "chi e aster", weight: 8 },
      { term: "wie is aster", weight: 8 },
      { term: "кто такой", weight: 6 },
      { term: "кто такой aster", weight: 8 },
      { term: "кто такой астер", weight: 8 },
      { term: "من هو", weight: 6 },
      { term: "من هو aster", weight: 8 },
      { term: "من هو استر", weight: 8 },
      { term: "asterとは", weight: 8 },
      { term: "アスターとは", weight: 8 },
      { term: "aster 是谁", weight: 8 },
      { term: "aster是谁", weight: 8 },
      { term: "是谁", weight: 6 },
      { term: "aster는 누구", weight: 8 },
      { term: "aster la ai", weight: 8 },
      { term: "siapa aster", weight: 8 },
      { term: "sobre o aster", weight: 7 },
      { term: "about aster", weight: 7 },
      { term: "biografia", weight: 5 },
      { term: "biography", weight: 5 },
      { term: "aster", weight: 2 },
    ],
  },
  {
    id: "FAREWELL",
    patterns: [
      /^(tchau|adeus|ate mais|ate logo|falou|valeu|obrigado|obrigada)\b/,
      /^(bye|goodbye|see you|thanks|thank you)\b/,
      /^(adios|hasta luego|gracias)\b/,
      /^(au revoir|merci)\b/,
      /^(tschuss|auf wiedersehen|danke)\b/,
      /^(arrivederci|grazie)\b/,
      /^(tot ziens|bedankt)\b/,
      /^(пока|до свидания|спасибо)\b/u,
      /^(مع السلامة|شكرا|وداعا)\b/u,
      /^(さようなら|またね|ありがとう)\b/u,
      /^(再见|谢谢)\b/u,
      /^(안녕히|감사합니다|고마워)\b/u,
      /^(tam biet|cam on)\b/,
      /^(selamat tinggal|terima kasih)\b/,
    ],
    keywords: [
      { term: "tchau", weight: 5 },
      { term: "bye", weight: 5 },
      { term: "valeu", weight: 4 },
      { term: "obrigado", weight: 4 },
      { term: "thanks", weight: 4 },
      { term: "gracias", weight: 4 },
      { term: "merci", weight: 4 },
      { term: "danke", weight: 4 },
      { term: "grazie", weight: 4 },
      { term: "спасибо", weight: 4 },
      { term: "شكرا", weight: 4 },
      { term: "ありがとう", weight: 4 },
      { term: "谢谢", weight: 4 },
      { term: "감사", weight: 4 },
      { term: "cam on", weight: 4 },
      { term: "terima kasih", weight: 4 },
    ],
  },
];

// ─── Core Classifier Function ─────────────────────────────────────────────

export function classifyIntent(
  userInput: string,
  lang?: string
): ClassifierResult {
  const targetLang = resolveBotLanguage(lang);
  const normalized = normalizeText(userInput);

  if (!normalized) {
    const res = BOT_RESPONSES.GREETING[targetLang];
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

    // Check negative keywords (if matched, penalize this intent)
    if (def.negativeKeywords) {
      for (const neg of def.negativeKeywords) {
        const normNeg = normalizeText(neg);
        if (tokenSet.has(normNeg) || normalized.includes(normNeg)) {
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

    // Check weighted keywords (exact token match or substring inclusion for CJK)
    for (const kw of def.keywords) {
      const normKw = normalizeText(kw.term);
      if (tokenSet.has(normKw) || normalized.includes(normKw)) {
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

  // Normalized confidence (0.1 to 1.0)
  const confidence = Math.min(1.0, Math.max(0.1, Number((highestScore / 12).toFixed(2))));

  // Get response in the user's active language
  const localizedGroup = BOT_RESPONSES[bestIntent] || BOT_RESPONSES.FALLBACK;
  const res = localizedGroup[targetLang] || localizedGroup.en || localizedGroup.br;

  return {
    intent: bestIntent,
    confidence,
    matchedTokens: bestMatchedTokens,
    response: res.text,
    actions: res.actions,
    suggestions: res.suggestions,
  };
}
