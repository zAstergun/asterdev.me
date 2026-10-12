import { describe, it, expect } from "vitest";
import { classifyIntent, normalizeText } from "./heuristicClassifier";

describe("Heuristic Intent Classifier", () => {
  it("normalizes text by stripping accents, symbols, and extra spaces", () => {
    expect(normalizeText("Olá, você está aí?!")).toBe("ola voce esta ai");
    expect(normalizeText("  IDEAL---CALC  2024! ")).toBe("ideal-calc 2024");
    expect(normalizeText("Ciência da Computação")).toBe("ciencia da computacao");
  });

  it("classifies greetings correctly", () => {
    const res = classifyIntent("oi!");
    expect(res.intent).toBe("GREETING");
    expect(res.confidence).toBeGreaterThan(0.5);
  });

  it("classifies questions about Aster", () => {
    const res = classifyIntent("Quem é o Aster?");
    expect(res.intent).toBe("ABOUT_ASTER");
    expect(res.response).toContain("Desenvolvedor Frontend");
  });

  it("classifies reverse engineering origin", () => {
    const res = classifyIntent("Como começou a programar cheats e servidores?");
    expect(res.intent).toBe("REVERSE_ENGINEERING");
    expect(res.response).toContain("engenharia reversa");
  });

  it("classifies ironman triathlon", () => {
    const res = classifyIntent("Me conta sobre o treino de ironman");
    expect(res.intent).toBe("IRONMAN_TRIATHLON");
    expect(res.response).toContain("Ironman");
  });

  it("classifies tech stack questions", () => {
    const res = classifyIntent("Qual a sua stack e linguagens?");
    expect(res.intent).toBe("TECH_STACK");
    expect(res.response).toContain("React");
  });

  it("classifies Ideal Calc project", () => {
    const res = classifyIntent("O que é o Ideal Calc?");
    expect(res.intent).toBe("PROJECT_IDEAL_CALC");
    expect(res.actions).toBeDefined();
    expect(res.actions?.[0].url).toContain("idealcalc.app");
  });

  it("classifies Soul Fighter project", () => {
    const res = classifyIntent("Como funciona o Soul Fighter memory game?");
    expect(res.intent).toBe("PROJECT_SOUL_FIGHTER");
    expect(res.actions?.[0].url).toContain("Soul-Fighter-Memory-Game");
  });

  it("classifies PEX Wiki project", () => {
    const res = classifyIntent("O que tem na PEX Wiki?");
    expect(res.intent).toBe("PROJECT_PEX_WIKI");
  });

  it("classifies resume/CV requests", () => {
    const res = classifyIntent("Quero baixar o currículo em PDF");
    expect(res.intent).toBe("RESUME_CV");
    expect(res.actions).toBeDefined();
  });

  it("classifies contact requests", () => {
    const res = classifyIntent("Como posso entrar em contato pelo email ou linkedin?");
    expect(res.intent).toBe("CONTACT_SOCIAL");
  });

  it("classifies explanation of the heuristic classifier", () => {
    const res = classifyIntent("Como esse classificador heurístico funciona?");
    expect(res.intent).toBe("HOW_CLASSIFIER_WORKS");
  });

  it("falls back gracefully on unknown input", () => {
    const res = classifyIntent("abracadabra xpto zzz 999");
    expect(res.intent).toBe("FALLBACK");
    expect(res.suggestions.length).toBeGreaterThan(0);
  });

  it("supports English responses when lang is en", () => {
    const res = classifyIntent("who is aster", "en");
    expect(res.intent).toBe("ABOUT_ASTER");
    expect(res.response).toContain("Frontend Developer");
  });
});
