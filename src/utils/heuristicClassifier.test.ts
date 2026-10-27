import { describe, it, expect } from "vitest";
import { classifyIntent, normalizeText } from "./heuristicClassifier";
import { BOT_LANGUAGES, resolveBotLanguage } from "./botI18n";

describe("Heuristic Intent Classifier", () => {
  it("normalizes text by stripping accents, symbols, and extra spaces", () => {
    expect(normalizeText("Olá, você está aí?!")).toBe("ola voce esta ai");
    expect(normalizeText("  IDEAL---CALC  2024! ")).toBe("ideal-calc 2024");
    expect(normalizeText("Ciência da Computação")).toBe("ciencia da computacao");
  });

  it("classifies greetings correctly in Portuguese", () => {
    const res = classifyIntent("oi!", "br");
    expect(res.intent).toBe("GREETING");
    expect(res.confidence).toBeGreaterThan(0.5);
  });

  it("classifies questions about Aster in Portuguese", () => {
    const res = classifyIntent("Quem é o Aster?", "br");
    expect(res.intent).toBe("ABOUT_ASTER");
    expect(res.response).toContain("Desenvolvedor Frontend");
  });

  it("classifies reverse engineering origin", () => {
    const res = classifyIntent("Como começou a programar cheats e servidores?", "br");
    expect(res.intent).toBe("REVERSE_ENGINEERING");
    expect(res.response).toContain("engenharia reversa");
  });

  it("classifies ironman triathlon", () => {
    const res = classifyIntent("Me conta sobre o treino de ironman", "br");
    expect(res.intent).toBe("IRONMAN_TRIATHLON");
    expect(res.response).toContain("Ironman");
  });

  it("classifies tech stack questions", () => {
    const res = classifyIntent("Qual a sua stack e linguagens?", "br");
    expect(res.intent).toBe("TECH_STACK");
    expect(res.response).toContain("React");
  });

  it("classifies Ideal Calc project", () => {
    const res = classifyIntent("O que é o Ideal Calc?", "br");
    expect(res.intent).toBe("PROJECT_IDEAL_CALC");
    expect(res.actions).toBeDefined();
    expect(res.actions?.[0].url).toContain("idealcalc.asterdev.me");
  });

  it("classifies Soul Fighter project", () => {
    const res = classifyIntent("Como funciona o Soul Fighter memory game?", "br");
    expect(res.intent).toBe("PROJECT_SOUL_FIGHTER");
    expect(res.actions?.[0].url).toContain("Soul-Fighter-Memory-Game");
  });

  it("classifies PEX Wiki project", () => {
    const res = classifyIntent("O que tem na PEX Wiki?", "br");
    expect(res.intent).toBe("PROJECT_PEX_WIKI");
  });

  it("classifies resume/CV requests", () => {
    const res = classifyIntent("Quero baixar o currículo em PDF", "br");
    expect(res.intent).toBe("RESUME_CV");
    expect(res.actions).toBeDefined();
  });

  it("classifies contact requests", () => {
    const res = classifyIntent("Como posso entrar em contato pelo email ou linkedin?", "br");
    expect(res.intent).toBe("CONTACT_SOCIAL");
  });

  it("classifies explanation of the heuristic classifier", () => {
    const res = classifyIntent("Como esse classificador heurístico funciona?", "br");
    expect(res.intent).toBe("HOW_CLASSIFIER_WORKS");
  });

  it("falls back gracefully on unknown input", () => {
    const res = classifyIntent("abracadabra xpto zzz 999", "br");
    expect(res.intent).toBe("FALLBACK");
    expect(res.suggestions.length).toBeGreaterThan(0);
  });

  // ─── Multilingual Verification ─────────────────────────────

  it("supports English (en)", () => {
    const res = classifyIntent("who is aster", "en");
    expect(res.intent).toBe("ABOUT_ASTER");
    expect(res.response).toContain("Frontend Developer");
  });

  it("supports Spanish (es)", () => {
    const res = classifyIntent("¿Quién es Aster?", "es");
    expect(res.intent).toBe("ABOUT_ASTER");
    expect(res.response).toContain("Desarrollador Frontend");
  });

  it("supports French (fr)", () => {
    const res = classifyIntent("Quels sont ses projets ?", "fr");
    expect(res.intent).toBe("PROJECTS_OVERVIEW");
    expect(res.response).toContain("projets");
  });

  it("supports German (de)", () => {
    const res = classifyIntent("Welcher Tech-Stack?", "de");
    expect(res.intent).toBe("TECH_STACK");
    expect(res.response).toContain("Frontend");
  });

  it("supports Italian (it)", () => {
    const res = classifyIntent("Chi è Aster?", "it");
    expect(res.intent).toBe("ABOUT_ASTER");
    expect(res.response).toContain("sviluppatore Frontend");
  });

  it("supports Russian (ru)", () => {
    const res = classifyIntent("Кто такой Aster?", "ru");
    expect(res.intent).toBe("ABOUT_ASTER");
    expect(res.response).toContain("Aster — фронтенд-разработчик");
  });

  it("supports Japanese (jp)", () => {
    const res = classifyIntent("Asterとは誰ですか？", "jp");
    expect(res.intent).toBe("ABOUT_ASTER");
    expect(res.response).toContain("フロントエンド開発者");
  });

  it("supports Chinese (cn)", () => {
    const res = classifyIntent("Aster 是谁？", "cn");
    expect(res.intent).toBe("ABOUT_ASTER");
    expect(res.response).toContain("前端工程师");
  });

  it("supports Korean (kr)", () => {
    const res = classifyIntent("기술 스택은 무엇인가요?", "kr");
    expect(res.intent).toBe("TECH_STACK");
    expect(res.response).toContain("프론트엔드");
  });

  it("supports Arabic (ar)", () => {
    const res = classifyIntent("ما هي مشاريعه؟", "ar");
    expect(res.intent).toBe("PROJECTS_OVERVIEW");
    expect(res.response).toContain("المشاريع");
  });

  it("resolves all 15 supported languages correctly", () => {
    for (const lang of BOT_LANGUAGES) {
      expect(resolveBotLanguage(lang)).toBe(lang);
    }
  });
});
