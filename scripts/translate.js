// Differential i18n Automation Script
// Translates missing keys from br.json (source) to 14 target languages using Google Gemini API

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration Constants
const SOURCE_LANG = 'br';
const TARGET_LANGS = ['en', 'es', 'jp', 'cn', 'kr', 'vn', 'id', 'fr', 'de', 'it', 'nl', 'ru', 'ar', 'pt'];
const LOCALES_DIR = 'src/locales';
const TECHNICAL_JARGON = ['Frontend', 'Mobile', 'UI/UX', 'React Native'];

/**
 * Environment Configuration Manager
 * Securely loads and validates the Gemini API key from environment variables
 * 
 * @returns {string} The validated API key
 * @throws {Error} If the API key is missing or empty
 */
export function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.error('ℹ️  Create a .env file in the project root with: GEMINI_API_KEY=your_key_here');
    console.error('ℹ️  Get your API key from: https://makersuite.google.com/app/apikey');
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }
  
  // Security: Never log the actual API key value
  return apiKey;
}

/**
 * File Path Construction Utility
 * Constructs locale file paths using cross-platform path joining
 * 
 * @param {string} lang - Language code (e.g., 'en', 'es', 'br')
 * @returns {string} Cross-platform file path (e.g., 'src/locales/en.json')
 */
export function getLocalePath(lang) {
  return join(LOCALES_DIR, `${lang}.json`);
}

/**
 * Locale File Loader
 * Reads and parses locale JSON files with validation
 * 
 * @param {string} filePath - Path to the locale file
 * @returns {Promise<{ui: Object, items: Object} | null>} Parsed locale data or null if file doesn't exist
 */
export async function loadLocale(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Validate presence of required sections
    if (!data.ui || !data.items) {
      console.warn(`⚠️  Invalid locale structure in ${filePath}: missing "ui" or "items" sections`);
      return null;
    }
    
    return data;
  } catch (error) {
    // File doesn't exist - this is expected for new locales
    if (error.code === 'ENOENT') {
      return null;
    }
    
    // Invalid JSON or other errors - log warning and treat as empty
    console.warn(`⚠️  Failed to parse ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Source Locale Validator
 * Validates that the source locale has the required structure
 * 
 * @param {Object | null} locale - The source locale data to validate
 * @throws {Error} If the locale is null, missing required sections, or has invalid structure
 */
export function validateSourceLocale(locale) {
  // Check if locale is null or undefined
  if (!locale) {
    console.error('❌ Source locale is null or undefined');
    console.error('ℹ️  Expected: { "ui": {...}, "items": {...} }');
    throw new Error('Invalid source locale: locale data is null or undefined');
  }
  
  // Check if locale is an object (but not an array)
  if (typeof locale !== 'object' || Array.isArray(locale)) {
    console.error('❌ Source locale is not an object');
    console.error('ℹ️  Expected: { "ui": {...}, "items": {...} }');
    throw new Error('Invalid source locale: locale data must be an object');
  }
  
  // Check for presence of "ui" section (must exist as a property)
  if (!('ui' in locale)) {
    console.error('❌ Source locale is missing "ui" section');
    console.error('ℹ️  Expected structure: { "ui": {...}, "items": {...} }');
    console.error(`ℹ️  Found keys: ${Object.keys(locale).join(', ')}`);
    throw new Error('Invalid source locale structure: missing "ui" section');
  }
  
  // Check for presence of "items" section (must exist as a property)
  if (!('items' in locale)) {
    console.error('❌ Source locale is missing "items" section');
    console.error('ℹ️  Expected structure: { "ui": {...}, "items": {...} }');
    console.error(`ℹ️  Found keys: ${Object.keys(locale).join(', ')}`);
    throw new Error('Invalid source locale structure: missing "items" section');
  }
  
  // Check that "ui" is an object (not null, not array)
  if (typeof locale.ui !== 'object' || locale.ui === null || Array.isArray(locale.ui)) {
    console.error('❌ Source locale "ui" section is not an object');
    console.error('ℹ️  Expected: { "ui": {...}, "items": {...} }');
    throw new Error('Invalid source locale structure: "ui" section must be an object');
  }
  
  // Check that "items" is an object (not null, not array)
  if (typeof locale.items !== 'object' || locale.items === null || Array.isArray(locale.items)) {
    console.error('❌ Source locale "items" section is not an object');
    console.error('ℹ️  Expected: { "ui": {...}, "items": {...} }');
    throw new Error('Invalid source locale structure: "items" section must be an object');
  }
}

/**
 * Differential Key Detector
 * Identifies keys present in source but missing in target locale
 * 
 * @param {{ui: Object, items: Object}} source - The source locale data (br.json)
 * @param {{ui: Object, items: Object} | null} target - The target locale data or null if file doesn't exist
 * @returns {{ui?: Object, items?: Object} | null} Missing keys object with same structure as source, or null if no missing keys
 */
export function detectMissingKeys(source, target) {
  // Edge case: If target is null (new file), all source keys are missing
  if (!target) {
    return source;
  }
  
  const missingKeys = {};
  const sections = ['ui', 'items'];
  
  // Iterate through each section
  for (const section of sections) {
    // Get source keys for this section
    const sourceKeys = Object.keys(source[section] || {});
    
    // Get target keys for this section (handle missing section)
    const targetKeys = Object.keys(target[section] || {});
    
    // Find keys that exist in source but not in target
    const missingInSection = sourceKeys.filter(key => !targetKeys.includes(key));
    
    // Build missing keys object for this section
    if (missingInSection.length > 0) {
      missingKeys[section] = {};
      for (const key of missingInSection) {
        missingKeys[section][key] = source[section][key];
      }
    }
  }
  
  // Return null if no missing keys found in any section
  if (Object.keys(missingKeys).length === 0) {
    return null;
  }
  
  return missingKeys;
}

/**
 * Translation Prompt Builder
 * Constructs an optimized prompt for Gemini API translation with technical jargon preservation
 * 
 * @param {{ui?: Object, items?: Object}} missingKeys - The missing keys object with source language values
 * @param {string} targetLang - The target language code (e.g., 'en', 'es', 'jp')
 * @returns {string} Formatted prompt string for Gemini API
 */
export function buildTranslationPrompt(missingKeys, targetLang) {
  return `Translate the following JSON from Portuguese (Brazil) to ${targetLang}.

CRITICAL RULES:
1. Maintain the EXACT JSON structure (ui and items sections)
2. Translate ONLY the values, NEVER the keys
3. Preserve these technical terms UNCHANGED: "Frontend", "Mobile", "UI/UX", "React Native"
4. Return ONLY valid JSON, no markdown, no explanations

JSON to translate:
${JSON.stringify(missingKeys, null, 2)}`;
}

/**
 * AI Translation Function
 * Uses Gemini API to translate missing keys into the target language
 * 
 * @param {{ui?: Object, items?: Object}} missingKeys - The missing keys to translate
 * @param {string} targetLang - Target language code
 * @param {GoogleGenerativeAI} genAI - Initialized Gemini API client
 * @returns {Promise<{ui?: Object, items?: Object} | null>} Translated keys or null on failure
 */
export async function translateMissingKeys(missingKeys, targetLang, genAI) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const prompt = buildTranslationPrompt(missingKeys, targetLang);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    log('ERROR', `Translation failed for ${targetLang}`, { error: error.message });
    return null;
  }
}

/**
 * Safe Merge Engine
 * Merges translated keys into existing ones while ensuring existing translations are preserved
 * 
 * @param {Object | null} existing - Existing locale data
 * @param {Object} translated - New translated data
 * @returns {Object} Merged locale data
 */
export function mergeDifferentialLocales(existing, translated) {
  if (!existing) return translated || { ui: {}, items: {} };
  
  return {
    ui: Object.assign({}, translated?.ui || {}, existing?.ui || {}),
    items: Object.assign({}, translated?.items || {}, existing?.items || {})
  };
}



/**
 * Locale File Writer
 * Persists locale data to disk with consistent formatting
 * 
 * @param {string} filePath - Path to save the file
 * @param {Object} data - Locale data to save
 * @returns {Promise<boolean>} True on success, false on failure
 */
export async function writeLocale(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2) + '\n';
    await writeFile(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    log('ERROR', `Failed to write file ${filePath}`, { error: error.message });
    return false;
  }
}

/**
 * Progress Logger
 * Consistent logging utility with emoji prefixes
 * 
 * @param {string} level - Log level (START, INFO, SUCCESS, COMPLETE, ERROR, WARNING)
 * @param {string} message - Message to log
 * @param {Object} [context] - Optional context data
 */
export function log(level, message, context = null) {
  const emojis = {
    START: '🚀',
    INFO: 'ℹ️',
    SUCCESS: '✨',
    COMPLETE: '✅',
    ERROR: '❌',
    WARNING: '⚠️'
  };
  
  const prefix = emojis[level] || '•';
  const logFn = level === 'ERROR' ? console.error : console.log;
  
  if (context) {
    logFn(`${prefix} ${message}`, context);
  } else {
    logFn(`${prefix} ${message}`);
  }
}

/**
 * Single Locale Processor
 * Orchestrates the translation flow for a specific language
 */
export async function processLocale(lang, source, genAI) {
  const filePath = getLocalePath(lang);
  log('START', `Processing language: ${lang}`);
  
  const existing = await loadLocale(filePath);
  const missingKeys = detectMissingKeys(source, existing);
  
  if (!missingKeys) {
    log('COMPLETE', `Language ${lang} is already synchronized`);
    return true;
  }
  
  if (!existing) {
    log('INFO', `Creating new locale file for ${lang}`);
  }
  
  const translated = await translateMissingKeys(missingKeys, lang, genAI);
  if (!translated) return false;
  
  const merged = mergeDifferentialLocales(existing, translated);

  const success = await writeLocale(filePath, merged);
  
  if (success) {
    log('SUCCESS', `Synchronized ${lang} with ${Object.keys(missingKeys.ui || {}).length + Object.keys(missingKeys.items || {}).length} new keys`);
  }
  
  return success;
}

/**
 * Main Orchestrator
 */
async function main() {
  try {
    const apiKey = getApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const sourcePath = getLocalePath(SOURCE_LANG);
    const source = await loadLocale(sourcePath);
    validateSourceLocale(source);
    
    log('INFO', `Starting translation orchestration for ${TARGET_LANGS.length} languages`);
    
    let successCount = 0;
    for (const lang of TARGET_LANGS) {
      const success = await processLocale(lang, source, genAI);
      if (success) successCount++;
    }
    
    log('COMPLETE', `Orchestration finished. Successfully processed ${successCount}/${TARGET_LANGS.length} languages.`);
  } catch (error) {
    log('ERROR', `Critical failure: ${error.message}`);
    process.exit(1);
  }
}

// Execute orchestrator
if (process.env.NODE_ENV !== 'test') {
  main();
}

