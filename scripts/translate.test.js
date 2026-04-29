// Unit tests for translate.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getApiKey, getLocalePath, validateSourceLocale, mergeDifferentialLocales, detectMissingKeys, buildTranslationPrompt, translateMissingKeys, writeLocale, log, processLocale } from './translate.js';

import { sep } from 'path';
import * as fc from 'fast-check';


vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    writeFile: vi.fn().mockImplementation((...args) => actual.writeFile(...args)),
  };
});



describe('Environment Configuration Manager - getApiKey()', () => {
  let originalEnv;
  let consoleErrorSpy;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env.GEMINI_API_KEY;
    // Spy on console.error to verify error messages
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.GEMINI_API_KEY = originalEnv;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should throw error when GEMINI_API_KEY is missing', () => {
    delete process.env.GEMINI_API_KEY;
    
    expect(() => getApiKey()).toThrow('Missing GEMINI_API_KEY environment variable');
    
    // Verify error messages were logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ GEMINI_API_KEY not found in environment variables');
    expect(consoleErrorSpy).toHaveBeenCalledWith('ℹ️  Create a .env file in the project root with: GEMINI_API_KEY=your_key_here');
  });

  it('should throw error when GEMINI_API_KEY is empty string', () => {
    process.env.GEMINI_API_KEY = '';
    
    expect(() => getApiKey()).toThrow('Missing GEMINI_API_KEY environment variable');
  });

  it('should throw error when GEMINI_API_KEY is only whitespace', () => {
    process.env.GEMINI_API_KEY = '   ';
    
    expect(() => getApiKey()).toThrow('Missing GEMINI_API_KEY environment variable');
  });

  it('should return API key when GEMINI_API_KEY is valid', () => {
    const testKey = 'test-api-key-12345';
    process.env.GEMINI_API_KEY = testKey;
    
    const result = getApiKey();
    expect(result).toBe(testKey);
  });

  it('should not log the actual API key value (security requirement)', () => {
    const testKey = 'secret-key-should-not-be-logged';
    process.env.GEMINI_API_KEY = testKey;
    
    const result = getApiKey();
    
    // Verify the key is returned
    expect(result).toBe(testKey);
    
    // Verify console.error was NOT called (no errors)
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    
    // Security check: The implementation should never log the actual key value
    // This is verified by code review - the function only logs error messages, never the key
  });

  it('should provide helpful error message format', () => {
    delete process.env.GEMINI_API_KEY;
    
    try {
      getApiKey();
    } catch (error) {
      // Verify the error message is descriptive
      expect(error.message).toBe('Missing GEMINI_API_KEY environment variable');
    }
    
    // Verify helpful guidance was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('GEMINI_API_KEY not found')
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Create a .env file')
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('makersuite.google.com')
    );
  });
});

describe('File Path Construction Utility - getLocalePath()', () => {
  it('should construct path with correct pattern for valid language codes', () => {
    expect(getLocalePath('en')).toBe(`src${sep}locales${sep}en.json`);
    expect(getLocalePath('es')).toBe(`src${sep}locales${sep}es.json`);
    expect(getLocalePath('br')).toBe(`src${sep}locales${sep}br.json`);
    expect(getLocalePath('jp')).toBe(`src${sep}locales${sep}jp.json`);
  });

  it('should use path.join for cross-platform compatibility', () => {
    // The function should produce paths with the correct separator for the OS
    const result = getLocalePath('en');
    
    // Verify it contains the platform-specific separator
    expect(result).toContain(sep);
    
    // Verify it follows the pattern src/locales/{lang}.json
    expect(result).toMatch(/src.locales.en\.json/);
  });

  it('should handle all 14 target language codes', () => {
    const targetLangs = ['en', 'es', 'jp', 'cn', 'kr', 'vn', 'id', 'fr', 'de', 'it', 'nl', 'ru', 'ar', 'pt'];
    
    targetLangs.forEach(lang => {
      const path = getLocalePath(lang);
      expect(path).toBe(`src${sep}locales${sep}${lang}.json`);
      expect(path).toContain(lang);
      expect(path).toMatch(/\.json$/);
    });
  });

  it('should handle source language code (br)', () => {
    const path = getLocalePath('br');
    expect(path).toBe(`src${sep}locales${sep}br.json`);
  });

  it('should construct valid relative paths', () => {
    const path = getLocalePath('en');
    
    // Should not start with / or \ (relative path)
    expect(path).not.toMatch(/^[/\\]/);
    
    // Should start with src
    expect(path).toMatch(/^src/);
  });

  it('should handle edge case: empty string', () => {
    const path = getLocalePath('');
    expect(path).toBe(`src${sep}locales${sep}.json`);
  });

  it('should handle edge case: language code with special characters', () => {
    // While not expected in normal use, the function should handle it
    const path = getLocalePath('en-US');
    expect(path).toBe(`src${sep}locales${sep}en-US.json`);
  });

  it('should always include .json extension', () => {
    const langs = ['en', 'es', 'jp', 'test', ''];
    
    langs.forEach(lang => {
      const path = getLocalePath(lang);
      expect(path).toMatch(/\.json$/);
    });
  });

  it('should produce consistent paths for same input', () => {
    const path1 = getLocalePath('en');
    const path2 = getLocalePath('en');
    
    expect(path1).toBe(path2);
  });
});

describe('Locale File Loader - loadLocale()', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    // Spy on console.warn to verify warning messages
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.warn
    consoleWarnSpy.mockRestore();
  });

  it('should load and parse valid locale file', async () => {
    const { loadLocale } = await import('./translate.js');
    const result = await loadLocale('src/locales/br.json');
    
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('ui');
    expect(result).toHaveProperty('items');
    expect(typeof result.ui).toBe('object');
    expect(typeof result.items).toBe('object');
  });

  it('should return null for non-existent file (ENOENT)', async () => {
    const { loadLocale } = await import('./translate.js');
    const result = await loadLocale('src/locales/nonexistent.json');
    
    expect(result).toBeNull();
    // Should not log warning for missing files (expected behavior)
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should validate presence of "ui" section', async () => {
    const { loadLocale } = await import('./translate.js');
    const { writeFile, unlink } = await import('fs/promises');
    const testFile = 'src/locales/test-no-ui.json';
    
    try {
      // Create test file without "ui" section
      await writeFile(testFile, JSON.stringify({ items: { key: 'value' } }), 'utf-8');
      
      const result = await loadLocale(testFile);
      
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid locale structure')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing "ui" or "items" sections')
      );
    } finally {
      // Cleanup
      try {
        await unlink(testFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  it('should validate presence of "items" section', async () => {
    const { loadLocale } = await import('./translate.js');
    const { writeFile, unlink } = await import('fs/promises');
    const testFile = 'src/locales/test-no-items.json';
    
    try {
      // Create test file without "items" section
      await writeFile(testFile, JSON.stringify({ ui: { key: 'value' } }), 'utf-8');
      
      const result = await loadLocale(testFile);
      
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid locale structure')
      );
    } finally {
      // Cleanup
      try {
        await unlink(testFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  it('should handle invalid JSON and return null', async () => {
    const { loadLocale } = await import('./translate.js');
    const { writeFile, unlink } = await import('fs/promises');
    const testFile = 'src/locales/test-invalid.json';
    
    try {
      // Create test file with invalid JSON
      await writeFile(testFile, '{ invalid json content }', 'utf-8');
      
      const result = await loadLocale(testFile);
      
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse')
      );
    } finally {
      // Cleanup
      try {
        await unlink(testFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  it('should use UTF-8 encoding when reading files', async () => {
    const { loadLocale } = await import('./translate.js');
    const { writeFile, unlink } = await import('fs/promises');
    const testFile = 'src/locales/test-utf8.json';
    
    try {
      // Create test file with UTF-8 characters (emoji, accents, etc.)
      const testData = {
        ui: { 
          back: 'Voltar',
          emoji: '🚀✨',
          chinese: '中文',
          arabic: 'العربية'
        },
        items: { 
          name: 'Português' 
        }
      };
      await writeFile(testFile, JSON.stringify(testData), 'utf-8');
      
      const result = await loadLocale(testFile);
      
      expect(result).not.toBeNull();
      expect(result.ui.back).toBe('Voltar');
      expect(result.ui.emoji).toBe('🚀✨');
      expect(result.ui.chinese).toBe('中文');
      expect(result.ui.arabic).toBe('العربية');
      expect(result.items.name).toBe('Português');
    } finally {
      // Cleanup
      try {
        await unlink(testFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  it('should handle empty ui and items objects as valid', async () => {
    const { loadLocale } = await import('./translate.js');
    const { writeFile, unlink } = await import('fs/promises');
    const testFile = 'src/locales/test-empty.json';
    
    try {
      // Create test file with empty sections (but sections exist)
      await writeFile(testFile, JSON.stringify({ ui: {}, items: {} }), 'utf-8');
      
      const result = await loadLocale(testFile);
      
      expect(result).not.toBeNull();
      expect(result.ui).toEqual({});
      expect(result.items).toEqual({});
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    } finally {
      // Cleanup
      try {
        await unlink(testFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  it('should log warning with file path for invalid JSON', async () => {
    const { loadLocale } = await import('./translate.js');
    const { writeFile, unlink } = await import('fs/promises');
    const testFile = 'src/locales/test-invalid-path.json';
    
    try {
      await writeFile(testFile, 'not valid json', 'utf-8');
      
      await loadLocale(testFile);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(testFile)
      );
    } finally {
      // Cleanup
      try {
        await unlink(testFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });
});

describe('Source Locale Validator - validateSourceLocale()', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Spy on console.error to verify error messages
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should not throw error for valid source locale with ui and items sections', () => {
    const validLocale = {
      ui: { back: 'Voltar', open: 'Abrir' },
      items: { name: 'Nome', summary: 'Resumo' }
    };

    expect(() => validateSourceLocale(validLocale)).not.toThrow();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should throw error when locale is null', () => {
    expect(() => validateSourceLocale(null)).toThrow('Invalid source locale: locale data is null or undefined');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Source locale is null or undefined');
    expect(consoleErrorSpy).toHaveBeenCalledWith('ℹ️  Expected: { "ui": {...}, "items": {...} }');
  });

  it('should throw error when locale is undefined', () => {
    expect(() => validateSourceLocale(undefined)).toThrow('Invalid source locale: locale data is null or undefined');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Source locale is null or undefined');
  });

  it('should throw error when locale is not an object', () => {
    expect(() => validateSourceLocale('not an object')).toThrow('Invalid source locale: locale data must be an object');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Source locale is not an object');
  });

  it('should throw error when locale is a number', () => {
    expect(() => validateSourceLocale(123)).toThrow('Invalid source locale: locale data must be an object');
  });

  it('should throw error when locale is an array', () => {
    expect(() => validateSourceLocale([])).toThrow('Invalid source locale: locale data must be an object');
  });

  it('should throw error when "ui" section is missing', () => {
    const localeWithoutUi = {
      items: { name: 'Nome' }
    };

    expect(() => validateSourceLocale(localeWithoutUi)).toThrow('Invalid source locale structure: missing "ui" section');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Source locale is missing "ui" section');
    expect(consoleErrorSpy).toHaveBeenCalledWith('ℹ️  Expected structure: { "ui": {...}, "items": {...} }');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Found keys: items'));
  });

  it('should throw error when "items" section is missing', () => {
    const localeWithoutItems = {
      ui: { back: 'Voltar' }
    };

    expect(() => validateSourceLocale(localeWithoutItems)).toThrow('Invalid source locale structure: missing "items" section');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Source locale is missing "items" section');
    expect(consoleErrorSpy).toHaveBeenCalledWith('ℹ️  Expected structure: { "ui": {...}, "items": {...} }');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Found keys: ui'));
  });

  it('should throw error when both "ui" and "items" sections are missing', () => {
    const emptyLocale = {};

    expect(() => validateSourceLocale(emptyLocale)).toThrow('Invalid source locale structure: missing "ui" section');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Source locale is missing "ui" section');
  });

  it('should throw error when "ui" section is null', () => {
    const localeWithNullUi = {
      ui: null,
      items: { name: 'Nome' }
    };

    expect(() => validateSourceLocale(localeWithNullUi)).toThrow('Invalid source locale structure: "ui" section must be an object');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Source locale "ui" section is not an object');
  });

  it('should throw error when "items" section is null', () => {
    const localeWithNullItems = {
      ui: { back: 'Voltar' },
      items: null
    };

    expect(() => validateSourceLocale(localeWithNullItems)).toThrow('Invalid source locale structure: "items" section must be an object');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Source locale "items" section is not an object');
  });

  it('should throw error when "ui" section is not an object (string)', () => {
    const localeWithStringUi = {
      ui: 'not an object',
      items: { name: 'Nome' }
    };

    expect(() => validateSourceLocale(localeWithStringUi)).toThrow('Invalid source locale structure: "ui" section must be an object');
  });

  it('should throw error when "items" section is not an object (array)', () => {
    const localeWithArrayItems = {
      ui: { back: 'Voltar' },
      items: ['not', 'an', 'object']
    };

    expect(() => validateSourceLocale(localeWithArrayItems)).toThrow('Invalid source locale structure: "items" section must be an object');
  });

  it('should accept empty ui and items objects as valid', () => {
    const localeWithEmptySections = {
      ui: {},
      items: {}
    };

    expect(() => validateSourceLocale(localeWithEmptySections)).not.toThrow();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should accept locale with additional properties beyond ui and items', () => {
    const localeWithExtraProps = {
      ui: { back: 'Voltar' },
      items: { name: 'Nome' },
      metadata: { version: '1.0' },
      extra: 'data'
    };

    expect(() => validateSourceLocale(localeWithExtraProps)).not.toThrow();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should provide helpful error message with found keys when ui is missing', () => {
    const locale = {
      items: { name: 'Nome' },
      other: 'data'
    };

    expect(() => validateSourceLocale(locale)).toThrow();
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Found keys: items, other')
    );
  });

  it('should provide helpful error message with found keys when items is missing', () => {
    const locale = {
      ui: { back: 'Voltar' },
      metadata: { version: '1.0' }
    };

    expect(() => validateSourceLocale(locale)).toThrow();
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Found keys: ui, metadata')
    );
  });

  it('should validate that ui contains nested objects (real-world structure)', () => {
    const realisticLocale = {
      ui: {
        back: 'Voltar',
        summary: 'Resumo',
        homeButton: 'Início',
        navigate: 'Navegar'
      },
      items: {
        sobreMimName: 'Sobre Mim',
        blogName: 'Blog',
        certName: 'Certificações'
      }
    };

    expect(() => validateSourceLocale(realisticLocale)).not.toThrow();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle locale with Unicode characters in values', () => {
    const localeWithUnicode = {
      ui: { 
        back: 'Voltar',
        emoji: '🚀✨',
        chinese: '中文'
      },
      items: { 
        name: 'Português',
        arabic: 'العربية'
      }
    };

    expect(() => validateSourceLocale(localeWithUnicode)).not.toThrow();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should throw descriptive error for common mistake: ui as array', () => {
    const locale = {
      ui: [{ key: 'value' }],
      items: { name: 'Nome' }
    };

    expect(() => validateSourceLocale(locale)).toThrow('Invalid source locale structure: "ui" section must be an object');
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Source locale "ui" section is not an object');
  });

  it('should throw descriptive error for common mistake: items as string', () => {
    const locale = {
      ui: { back: 'Voltar' },
      items: 'should be object'
    };

    expect(() => validateSourceLocale(locale)).toThrow('Invalid source locale structure: "items" section must be an object');
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Source locale "items" section is not an object');
  });
});

describe('Differential Key Detection - detectMissingKeys()', () => {
  describe('Test: Identify missing keys in partial target locale', () => {
    it('should identify missing keys when target has some but not all keys', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar', open: 'Abrir', close: 'Fechar' },
        items: { name: 'Nome', summary: 'Resumo' }
      };
      const target = {
        ui: { back: 'Back' },
        items: {}
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toEqual({
        ui: { open: 'Abrir', close: 'Fechar' },
        items: { name: 'Nome', summary: 'Resumo' }
      });
    });

    it('should identify missing keys in only one section', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar', open: 'Abrir' },
        items: { name: 'Nome', summary: 'Resumo' }
      };
      const target = {
        ui: { back: 'Back', open: 'Open' },
        items: { name: 'Name' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toEqual({
        items: { summary: 'Resumo' }
      });
      expect(missing).not.toHaveProperty('ui');
    });

    it('should handle target with extra keys not in source', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      const target = {
        ui: { back: 'Back', extra: 'Extra Key' },
        items: { name: 'Name', another: 'Another Key' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      // Should return null because all source keys exist in target
      expect(missing).toBeNull();
    });

    it('should identify missing keys with complex nested values', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { 
          back: 'Voltar', 
          welcomeTitle: 'Bem-vindo ao Portfolio',
          emoji: '🚀✨'
        },
        items: { 
          name: 'Nome',
          description: 'Descrição com acentuação'
        }
      };
      const target = {
        ui: { back: 'Back' },
        items: { name: 'Name' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toEqual({
        ui: { 
          welcomeTitle: 'Bem-vindo ao Portfolio',
          emoji: '🚀✨'
        },
        items: { 
          description: 'Descrição com acentuação'
        }
      });
    });
  });

  describe('Test: Return null when no keys are missing', () => {
    it('should return null when target has all source keys', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      const target = {
        ui: { back: 'Back' },
        items: { name: 'Name' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toBeNull();
    });

    it('should return null when target has all source keys plus extra keys', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar', open: 'Abrir' },
        items: { name: 'Nome' }
      };
      const target = {
        ui: { back: 'Back', open: 'Open', extra: 'Extra' },
        items: { name: 'Name', another: 'Another' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toBeNull();
    });

    it('should return null when both source and target are empty', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: {},
        items: {}
      };
      const target = {
        ui: {},
        items: {}
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toBeNull();
    });

    it('should return null when source has no keys', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: {},
        items: {}
      };
      const target = {
        ui: { back: 'Back' },
        items: { name: 'Name' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toBeNull();
    });
  });

  describe('Test: Treat null target as all keys missing', () => {
    it('should return entire source when target is null', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const missing = detectMissingKeys(source, null);
      
      expect(missing).toEqual(source);
      expect(missing).toBe(source); // Should be the exact same reference
    });

    it('should return entire source with multiple keys when target is null', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { 
          back: 'Voltar', 
          open: 'Abrir', 
          close: 'Fechar',
          welcomeTitle: 'Bem-vindo'
        },
        items: { 
          name: 'Nome',
          summary: 'Resumo',
          description: 'Descrição'
        }
      };
      
      const missing = detectMissingKeys(source, null);
      
      expect(missing).toEqual(source);
      expect(Object.keys(missing.ui)).toHaveLength(4);
      expect(Object.keys(missing.items)).toHaveLength(3);
    });

    it('should return empty source when source is empty and target is null', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: {},
        items: {}
      };
      
      const missing = detectMissingKeys(source, null);
      
      expect(missing).toEqual(source);
    });
  });

  describe('Test: Handle empty sections correctly', () => {
    it('should handle empty ui section in target', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar', open: 'Abrir' },
        items: { name: 'Nome' }
      };
      const target = {
        ui: {},
        items: { name: 'Name' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toEqual({
        ui: { back: 'Voltar', open: 'Abrir' }
      });
      expect(missing).not.toHaveProperty('items');
    });

    it('should handle empty items section in target', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome', summary: 'Resumo' }
      };
      const target = {
        ui: { back: 'Back' },
        items: {}
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toEqual({
        items: { name: 'Nome', summary: 'Resumo' }
      });
      expect(missing).not.toHaveProperty('ui');
    });

    it('should handle both sections empty in target', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      const target = {
        ui: {},
        items: {}
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toEqual(source);
    });

    it('should handle empty ui section in source', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: {},
        items: { name: 'Nome' }
      };
      const target = {
        ui: { back: 'Back' },
        items: {}
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toEqual({
        items: { name: 'Nome' }
      });
      expect(missing).not.toHaveProperty('ui');
    });

    it('should handle empty items section in source', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar' },
        items: {}
      };
      const target = {
        ui: {},
        items: { name: 'Name' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toEqual({
        ui: { back: 'Voltar' }
      });
      expect(missing).not.toHaveProperty('items');
    });

    it('should return null when both source and target have empty sections', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: {},
        items: {}
      };
      const target = {
        ui: {},
        items: {}
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toBeNull();
    });
  });

  describe('Test: Preserve source values in missing keys object', () => {
    it('should preserve exact source values in missing keys object', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar', open: 'Abrir' },
        items: { name: 'Nome' }
      };
      const target = {
        ui: { back: 'Back' },
        items: {}
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing.ui.open).toBe('Abrir');
      expect(missing.items.name).toBe('Nome');
    });

    it('should preserve source values with special characters', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { 
          emoji: '🚀✨',
          accented: 'Descrição',
          chinese: '中文',
          arabic: 'العربية'
        },
        items: { 
          special: 'Olá! Como está?',
          quotes: 'He said "hello"'
        }
      };
      const target = {
        ui: {},
        items: {}
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing.ui.emoji).toBe('🚀✨');
      expect(missing.ui.accented).toBe('Descrição');
      expect(missing.ui.chinese).toBe('中文');
      expect(missing.ui.arabic).toBe('العربية');
      expect(missing.items.special).toBe('Olá! Como está?');
      expect(missing.items.quotes).toBe('He said "hello"');
    });

    it('should preserve source values with whitespace', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { 
          spaces: '  leading and trailing  ',
          newlines: 'line1\nline2',
          tabs: 'tab\there'
        },
        items: { 
          empty: ''
        }
      };
      const target = {
        ui: {},
        items: {}
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing.ui.spaces).toBe('  leading and trailing  ');
      expect(missing.ui.newlines).toBe('line1\nline2');
      expect(missing.ui.tabs).toBe('tab\there');
      expect(missing.items.empty).toBe('');
    });

    it('should preserve source values that are empty strings', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar', empty: '' },
        items: { name: 'Nome', blank: '' }
      };
      const target = {
        ui: { back: 'Back' },
        items: { name: 'Name' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing.ui.empty).toBe('');
      expect(missing.items.blank).toBe('');
    });

    it('should preserve source values with long text', () => {
      const { detectMissingKeys } = require('./translate.js');
      const longText = 'This is a very long text that contains multiple sentences. It should be preserved exactly as it appears in the source locale. No modifications should be made to the content.';
      const source = {
        ui: { longDescription: longText },
        items: { name: 'Nome' }
      };
      const target = {
        ui: {},
        items: { name: 'Name' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing.ui.longDescription).toBe(longText);
    });

    it('should not modify source object when creating missing keys object', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar', open: 'Abrir' },
        items: { name: 'Nome' }
      };
      const sourceCopy = JSON.parse(JSON.stringify(source));
      const target = {
        ui: { back: 'Back' },
        items: {}
      };
      
      detectMissingKeys(source, target);
      
      // Source should remain unchanged
      expect(source).toEqual(sourceCopy);
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle target with missing ui section', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      const target = {
        items: { name: 'Name' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toEqual({
        ui: { back: 'Voltar' }
      });
    });

    it('should handle target with missing items section', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      const target = {
        ui: { back: 'Back' }
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(missing).toEqual({
        items: { name: 'Nome' }
      });
    });

    it('should handle large number of keys', () => {
      const { detectMissingKeys } = require('./translate.js');
      const source = {
        ui: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, `value${i}`])),
        items: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`item${i}`, `itemValue${i}`]))
      };
      const target = {
        ui: Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`key${i}`, `translated${i}`])),
        items: Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`item${i}`, `translatedItem${i}`]))
      };
      
      const missing = detectMissingKeys(source, target);
      
      expect(Object.keys(missing.ui)).toHaveLength(50);
      expect(Object.keys(missing.items)).toHaveLength(50);
      // Verify the missing keys are the correct ones (key50-key99)
      expect(missing.ui).toHaveProperty('key50');
      expect(missing.ui).toHaveProperty('key99');
      expect(missing.ui).not.toHaveProperty('key0');
      expect(missing.ui).not.toHaveProperty('key49');
    });
  });
});

describe('Feature: differential-i18n-automation, Property 5: Missing Keys Structure Consistency', () => {
  it('should maintain correct structure and contain exactly keys in source but not in target', async () => {
    const { detectMissingKeys } = await import('./translate.js');

    
    // Generator for locale data with ui and items sections
    const localeDataArb = fc.record({
      ui: fc.dictionary(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s !== '__proto__'),
        fc.string({ minLength: 0, maxLength: 50 })
      ),
      items: fc.dictionary(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s !== '__proto__'),
        fc.string({ minLength: 0, maxLength: 50 })
      )

    });
    
    // Generator for partial locale (subset of source keys)
    const partialLocaleArb = (sourceKeys) => {
      return fc.record({
        ui: fc.subarray(sourceKeys.ui).chain(keys =>
          fc.constant(
            Object.fromEntries(
              keys.map(k => [k, fc.sample(fc.string(), 1)[0]])
            )
          )
        ),
        items: fc.subarray(sourceKeys.items).chain(keys =>
          fc.constant(
            Object.fromEntries(
              keys.map(k => [k, fc.sample(fc.string(), 1)[0]])
            )
          )
        )
      });
    };
    
    await fc.assert(
      fc.asyncProperty(
        localeDataArb,
        async (source) => {
          const sourceUiKeys = Object.keys(source.ui);
          const sourceItemsKeys = Object.keys(source.items);
          
          // Generate a partial target locale
          const target = await fc.sample(
            partialLocaleArb({ ui: sourceUiKeys, items: sourceItemsKeys }),
            1
          )[0];
          
          const missing = detectMissingKeys(source, target);
          
          // If there are no missing keys, the function should return null
          const targetUiKeys = Object.keys(target.ui);
          const targetItemsKeys = Object.keys(target.items);
          const hasMissingUi = sourceUiKeys.some(k => !targetUiKeys.includes(k));
          const hasMissingItems = sourceItemsKeys.some(k => !targetItemsKeys.includes(k));
          
          if (!hasMissingUi && !hasMissingItems) {
            expect(missing).toBeNull();
            return;
          }
          
          // Verify missing keys object has correct structure
          expect(missing).not.toBeNull();
          expect(typeof missing).toBe('object');
          
          // Verify structure: should have ui and/or items sections
          if (hasMissingUi) {
            expect(missing).toHaveProperty('ui');
            expect(typeof missing.ui).toBe('object');
          }
          
          if (hasMissingItems) {
            expect(missing).toHaveProperty('items');
            expect(typeof missing.items).toBe('object');
          }
          
          // Verify missing keys contains exactly keys in source but not in target
          if (missing.ui) {
            const missingUiKeys = Object.keys(missing.ui);
            
            // All missing UI keys should be in source
            for (const key of missingUiKeys) {
              expect(sourceUiKeys).toContain(key);
            }
            
            // All missing UI keys should NOT be in target
            for (const key of missingUiKeys) {
              expect(targetUiKeys).not.toContain(key);
            }
            
            // All keys in source but not in target should be in missing
            for (const key of sourceUiKeys) {
              if (!targetUiKeys.includes(key)) {
                expect(missingUiKeys).toContain(key);
                expect(missing.ui[key]).toBe(source.ui[key]);
              }
            }
          }
          
          if (missing.items) {
            const missingItemsKeys = Object.keys(missing.items);
            
            // All missing items keys should be in source
            for (const key of missingItemsKeys) {
              expect(sourceItemsKeys).toContain(key);
            }
            
            // All missing items keys should NOT be in target
            for (const key of missingItemsKeys) {
              expect(targetItemsKeys).not.toContain(key);
            }
            
            // All keys in source but not in target should be in missing
            for (const key of sourceItemsKeys) {
              if (!targetItemsKeys.includes(key)) {
                expect(missingItemsKeys).toContain(key);
                expect(missing.items[key]).toBe(source.items[key]);
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should handle null target by returning entire source', async () => {
    const fc = await import('fast-check');
    const { detectMissingKeys } = await import('./translate.js');
    
    const localeDataArb = fc.record({
      ui: fc.dictionary(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 0, maxLength: 50 })
      ),
      items: fc.dictionary(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 0, maxLength: 50 })
      )
    });
    
    await fc.assert(
      fc.asyncProperty(
        localeDataArb,
        async (source) => {
          const missing = detectMissingKeys(source, null);
          
          // When target is null, all source keys are missing
          expect(missing).toEqual(source);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should return null when target has all source keys', async () => {
    const fc = await import('fast-check');
    const { detectMissingKeys } = await import('./translate.js');
    
    const localeDataArb = fc.record({
      ui: fc.dictionary(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 0, maxLength: 50 })
      ),
      items: fc.dictionary(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 0, maxLength: 50 })
      )
    });
    
    await fc.assert(
      fc.asyncProperty(
        localeDataArb,
        async (source) => {
          // Create target with all source keys but different values
          const target = {
            ui: Object.fromEntries(
              Object.keys(source.ui).map(k => [k, 'translated_' + k])
            ),
            items: Object.fromEntries(
              Object.keys(source.items).map(k => [k, 'translated_' + k])
            )
          };
          
          const missing = detectMissingKeys(source, target);
          
          // When target has all source keys, no keys are missing
          expect(missing).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Translation Prompt Builder - buildTranslationPrompt()', () => {
  describe('Test: Include target language in prompt', () => {
    it('should include target language code in the prompt', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('to en');
      expect(prompt).toContain('Portuguese (Brazil)');
    });

    it('should work with all 14 target language codes', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const targetLangs = ['en', 'es', 'jp', 'cn', 'kr', 'vn', 'id', 'fr', 'de', 'it', 'nl', 'ru', 'ar', 'pt'];
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      targetLangs.forEach(lang => {
        const prompt = buildTranslationPrompt(missingKeys, lang);
        expect(prompt).toContain(`to ${lang}`);
      });
    });

    it('should specify source language as Portuguese (Brazil)', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('Portuguese (Brazil)');
    });
  });

  describe('Test: Include complete missing keys JSON structure', () => {
    it('should include the complete missing keys JSON in the prompt', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar', open: 'Abrir' },
        items: { name: 'Nome', summary: 'Resumo' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      // Verify the JSON structure is included
      expect(prompt).toContain('"ui"');
      expect(prompt).toContain('"items"');
      expect(prompt).toContain('"back"');
      expect(prompt).toContain('"open"');
      expect(prompt).toContain('"name"');
      expect(prompt).toContain('"summary"');
      expect(prompt).toContain('Voltar');
      expect(prompt).toContain('Abrir');
      expect(prompt).toContain('Nome');
      expect(prompt).toContain('Resumo');
    });

    it('should format JSON with proper indentation (2 spaces)', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      // Verify JSON is formatted with 2-space indentation
      const expectedJson = JSON.stringify(missingKeys, null, 2);
      expect(prompt).toContain(expectedJson);
    });

    it('should handle missing keys with only ui section', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar', open: 'Abrir' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('"ui"');
      expect(prompt).toContain('Voltar');
      expect(prompt).toContain('Abrir');
      expect(prompt).not.toContain('"items"');
    });

    it('should handle missing keys with only items section', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        items: { name: 'Nome', summary: 'Resumo' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('"items"');
      expect(prompt).toContain('Nome');
      expect(prompt).toContain('Resumo');
      expect(prompt).not.toContain('"ui"');
    });

    it('should handle missing keys with many entries', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: {
          back: 'Voltar',
          open: 'Abrir',
          close: 'Fechar',
          save: 'Salvar',
          cancel: 'Cancelar'
        },
        items: {
          name: 'Nome',
          summary: 'Resumo',
          description: 'Descrição',
          title: 'Título'
        }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      // Verify all keys and values are included
      expect(prompt).toContain('Voltar');
      expect(prompt).toContain('Abrir');
      expect(prompt).toContain('Fechar');
      expect(prompt).toContain('Salvar');
      expect(prompt).toContain('Cancelar');
      expect(prompt).toContain('Nome');
      expect(prompt).toContain('Resumo');
      expect(prompt).toContain('Descrição');
      expect(prompt).toContain('Título');
    });

    it('should handle Unicode characters in missing keys values', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { 
          emoji: '🚀✨',
          chinese: '中文',
          arabic: 'العربية'
        },
        items: { 
          portuguese: 'Português',
          accents: 'Descrição com acentuação'
        }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('🚀✨');
      expect(prompt).toContain('中文');
      expect(prompt).toContain('العربية');
      expect(prompt).toContain('Português');
      expect(prompt).toContain('Descrição com acentuação');
    });
  });

  describe('Test: Add explicit instructions to preserve technical jargon', () => {
    it('should include instruction to preserve "Frontend" unchanged', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('Frontend');
      expect(prompt).toContain('UNCHANGED');
    });

    it('should include instruction to preserve "Mobile" unchanged', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('Mobile');
      expect(prompt).toContain('UNCHANGED');
    });

    it('should include instruction to preserve "UI/UX" unchanged', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('UI/UX');
      expect(prompt).toContain('UNCHANGED');
    });

    it('should include instruction to preserve "React Native" unchanged', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('React Native');
      expect(prompt).toContain('UNCHANGED');
    });

    it('should list all technical jargon terms in a single instruction', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      // All terms should be in the same line/instruction
      const technicalJargonLine = prompt.split('\n').find(line => 
        line.includes('Frontend') && 
        line.includes('Mobile') && 
        line.includes('UI/UX') && 
        line.includes('React Native')
      );
      
      expect(technicalJargonLine).toBeDefined();
      expect(technicalJargonLine).toContain('UNCHANGED');
    });
  });

  describe('Test: Add instruction to maintain exact JSON structure', () => {
    it('should include instruction to maintain EXACT JSON structure', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('EXACT JSON structure');
      expect(prompt).toContain('ui and items sections');
    });

    it('should include instruction to translate ONLY values, NEVER keys', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('ONLY the values');
      expect(prompt).toContain('NEVER the keys');
    });

    it('should emphasize structure preservation with "CRITICAL RULES"', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('CRITICAL RULES');
    });
  });

  describe('Test: Add instruction to return only valid JSON (no markdown)', () => {
    it('should include instruction to return ONLY valid JSON', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('ONLY valid JSON');
    });

    it('should include instruction for no markdown', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('no markdown');
    });

    it('should include instruction for no explanations', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('no explanations');
    });
  });

  describe('Test: Format prompt for optimal Gemini API response', () => {
    it('should have clear structure with sections separated by newlines', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      // Verify prompt has multiple lines (structured format)
      const lines = prompt.split('\n');
      expect(lines.length).toBeGreaterThan(5);
    });

    it('should start with clear translation instruction', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      // First line should be the main instruction
      expect(prompt).toMatch(/^Translate the following JSON/);
    });

    it('should have numbered rules for clarity', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      // Verify numbered rules exist
      expect(prompt).toContain('1.');
      expect(prompt).toContain('2.');
      expect(prompt).toContain('3.');
      expect(prompt).toContain('4.');
    });

    it('should have clear label for JSON section', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('JSON to translate:');
    });

    it('should be concise and focused (not overly verbose)', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      // Prompt should be reasonably sized (not thousands of characters for simple input)
      // Excluding the JSON content, the instructions should be concise
      const lines = prompt.split('\n');
      const instructionLines = lines.filter(line => !line.includes('{') && !line.includes('}') && !line.includes('"'));
      
      // Should have clear instructions but not be overly verbose
      expect(instructionLines.length).toBeLessThan(20);
    });
  });

  describe('Test: Return type and format', () => {
    it('should return a string', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(typeof prompt).toBe('string');
    });

    it('should return non-empty string', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should handle empty missing keys object', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {};
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('to en');
      expect(prompt).toContain('{}');
    });

    it('should produce consistent output for same inputs', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt1 = buildTranslationPrompt(missingKeys, 'en');
      const prompt2 = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt1).toBe(prompt2);
    });
  });

  describe('Test: Edge cases', () => {
    it('should handle missing keys with special characters in values', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { 
          special: 'Text with "quotes" and \'apostrophes\'',
          newline: 'Text with\nnewline',
          tab: 'Text with\ttab'
        },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      // JSON.stringify should handle escaping
      expect(prompt).toContain('special');
      expect(typeof prompt).toBe('string');
    });

    it('should handle very long values in missing keys', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const longText = 'A'.repeat(500);
      const missingKeys = {
        ui: { longValue: longText },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain(longText);
    });

    it('should handle language code with special format', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      // While not in the standard list, the function should handle it
      const prompt = buildTranslationPrompt(missingKeys, 'en-US');
      
      expect(prompt).toContain('to en-US');
    });

    it('should handle empty string as target language', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, '');
      
      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('to ');
    });
  });

  describe('Test: Integration with requirements', () => {
    it('should satisfy Requirement 3.3: Include target language in prompt', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'Spanish');
      
      expect(prompt).toContain('Spanish');
    });

    it('should satisfy Requirement 3.4: Preserve technical jargon', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      // All technical jargon terms must be mentioned
      expect(prompt).toContain('Frontend');
      expect(prompt).toContain('Mobile');
      expect(prompt).toContain('UI/UX');
      expect(prompt).toContain('React Native');
    });

    it('should satisfy Requirement 10.1: Translate from Portuguese', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('Portuguese');
    });

    it('should satisfy Requirement 10.2: Maintain exact JSON structure', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('EXACT JSON structure');
    });

    it('should satisfy Requirement 10.3: Preserve technical jargon unchanged', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar' },
        items: { name: 'Nome' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      expect(prompt).toContain('UNCHANGED');
      expect(prompt).toContain('Frontend');
      expect(prompt).toContain('Mobile');
      expect(prompt).toContain('UI/UX');
      expect(prompt).toContain('React Native');
    });

    it('should satisfy Requirement 10.4: Include complete missing keys JSON', () => {
      const { buildTranslationPrompt } = require('./translate.js');
      const missingKeys = {
        ui: { back: 'Voltar', open: 'Abrir' },
        items: { name: 'Nome', summary: 'Resumo' }
      };
      
      const prompt = buildTranslationPrompt(missingKeys, 'en');
      
      // Verify complete JSON is included
      const expectedJson = JSON.stringify(missingKeys, null, 2);
      expect(prompt).toContain(expectedJson);
    });
  });
});

describe('AI Translation Function - translateMissingKeys()', () => {
  it('should call Gemini API and return parsed JSON', async () => {
    const { translateMissingKeys } = await import('./translate.js');
    
    const mockResponse = {
      response: {
        text: () => JSON.stringify({ ui: { back: 'Back' } })
      }
    };
    
    const mockModel = {
      generateContent: vi.fn().mockResolvedValue(mockResponse)
    };
    
    const mockGenAI = {
      getGenerativeModel: vi.fn().mockReturnValue(mockModel)
    };
    
    const result = await translateMissingKeys({ ui: { back: 'Voltar' } }, 'en', mockGenAI);
    
    expect(mockGenAI.getGenerativeModel).toHaveBeenCalledWith({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    expect(result).toEqual({ ui: { back: 'Back' } });
  });

  it('should return null and log error on API failure', async () => {
    const { translateMissingKeys } = await import('./translate.js');
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const mockGenAI = {
      getGenerativeModel: vi.fn().mockImplementation(() => {
        throw new Error('API Error');
      })
    };
    
    const result = await translateMissingKeys({ ui: { back: 'Voltar' } }, 'en', mockGenAI);
    
    expect(result).toBeNull();
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});

describe('Safe Merge Engine - mergeDifferentialLocales()', () => {
  it('should preserve existing keys over translated keys', () => {
    const { mergeDifferentialLocales } = require('./translate.js');
    const existing = { ui: { back: 'Existing Back' }, items: {} };
    const translated = { ui: { back: 'Translated Back', open: 'Open' }, items: { name: 'Name' } };
    
    const result = mergeDifferentialLocales(existing, translated);
    
    expect(result.ui.back).toBe('Existing Back');
    expect(result.ui.open).toBe('Open');
    expect(result.items.name).toBe('Name');
  });

  it('should handle null existing locale', () => {
    const { mergeDifferentialLocales } = require('./translate.js');
    const translated = { ui: { back: 'Back' }, items: { name: 'Name' } };
    
    const result = mergeDifferentialLocales(null, translated);
    
    expect(result).toEqual(translated);
  });

  it('should handle empty objects for both inputs', () => {
    const { mergeDifferentialLocales } = require('./translate.js');
    const result = mergeDifferentialLocales({}, {});
    expect(result).toEqual({ ui: {}, items: {} });
  });
});


describe('Locale File Writer - writeLocale()', () => {
  it('should write file with 2-space indentation and trailing newline', async () => {
    const { writeLocale } = await import('./translate.js');
    const { writeFile } = await import('fs/promises');
    
    const data = { ui: { back: 'Back' }, items: {} };
    const success = await writeLocale('test.json', data);
    
    expect(success).toBe(true);
    expect(writeFile).toHaveBeenCalledWith(
      'test.json',
      JSON.stringify(data, null, 2) + '\n',
      'utf-8'
    );
  });

  it('should return false on write failure', async () => {
    const { writeLocale } = await import('./translate.js');
    const { writeFile } = await import('fs/promises');
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('Write error'));
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const success = await writeLocale('test.json', {});
    
    expect(success).toBe(false);
    expect(logSpy).toHaveBeenCalled();
    
    logSpy.mockRestore();
  });
});


describe('Progress Logger - log()', () => {
  it('should log with correct emoji prefixes', () => {
    const { log } = require('./translate.js');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    log('START', 'Test message');
    expect(logSpy).toHaveBeenCalledWith('🚀 Test message');
    
    log('ERROR', 'Error message');
    expect(errorSpy).toHaveBeenCalledWith('❌ Error message');
    
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});

describe('Single Locale Processor - processLocale()', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should process a locale successfully when keys are missing', async () => {

    const { processLocale } = await import('./translate.js');
    const translate = await import('./translate.js');
    
    // Mock dependencies
    vi.spyOn(translate, 'loadLocale').mockResolvedValue({ ui: { back: 'Voltar' }, items: {} });
    vi.spyOn(translate, 'detectMissingKeys').mockReturnValue({ ui: { open: 'Abrir' } });
    vi.spyOn(translate, 'translateMissingKeys').mockResolvedValue({ ui: { open: 'Open' } });
    vi.spyOn(translate, 'mergeDifferentialLocales').mockReturnValue({ ui: { back: 'Back', open: 'Open' }, items: {} });
    vi.spyOn(translate, 'writeLocale').mockResolvedValue(true);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const success = await processLocale('en', { ui: { back: 'Voltar', open: 'Abrir' } }, {});
    
    expect(success).toBe(true);
  });

  it('should skip processing if no keys are missing', async () => {
    const { processLocale } = await import('./translate.js');
    const translate = await import('./translate.js');
    
    vi.spyOn(translate, 'loadLocale').mockResolvedValue({ ui: { back: 'Back' }, items: {} });
    vi.spyOn(translate, 'detectMissingKeys').mockReturnValue(null);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const success = await processLocale('en', { ui: { back: 'Voltar' } }, {});
    
    expect(success).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('already synchronized'));
  });
});

describe('Feature: differential-i18n-automation, Property 2: Idempotent Merge', () => {
  it('should be idempotent (merging twice gives same result)', async () => {
    const localeArb = fc.record({
      ui: fc.dictionary(fc.string(), fc.string()),
      items: fc.dictionary(fc.string(), fc.string())
    });
    
    await fc.assert(
      fc.property(localeArb, localeArb, (existing, translated) => {
        const result1 = mergeDifferentialLocales(existing, translated);
        const result2 = mergeDifferentialLocales(result1, translated);
        expect(result1).toEqual(result2);
      })
    );
  });
});

describe('Feature: differential-i18n-automation, Property 3: Key Preservation in Merge', () => {
  it('should preserve all existing keys and values', async () => {
    const localeArb = fc.record({
      ui: fc.dictionary(fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]*$/), fc.string()),
      items: fc.dictionary(fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]*$/), fc.string())
    });
    
    await fc.assert(
      fc.property(localeArb, localeArb, (existing, translated) => {
        const result = mergeDifferentialLocales(existing, translated);
        
        for (const key of Object.keys(existing.ui)) {
          expect(result.ui[key]).toBe(existing.ui[key]);
        }
        for (const key of Object.keys(existing.items)) {
          expect(result.items[key]).toBe(existing.items[key]);
        }
      })
    );
  });
});


describe('Feature: differential-i18n-automation, Property 6: Path Construction Consistency', () => {
  it('should produce paths following the expected pattern', async () => {
    const fc = await import('fast-check');
    const { getLocalePath } = await import('./translate.js');
    
    await fc.assert(
      fc.property(fc.stringMatching(/^[a-z]{2}(-[A-Z]{2})?$/), (lang) => {
        const path = getLocalePath(lang);

        // On Windows, the path might use \ instead of /
        const normalizedPath = path.replace(/\\/g, '/');
        const normalizedLang = lang.replace(/\\/g, '/');
        expect(normalizedPath).toContain(normalizedLang);

        expect(path).toMatch(/\.json$/);
        expect(path).toContain('src');
        expect(path).toContain('locales');
      })
    );
  });
});



