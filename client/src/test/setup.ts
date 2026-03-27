import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock LocalStorage
const localStorageMock = (function () {
  let store: any = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Crypto
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => require('crypto').randomBytes(arr.length),
    subtle: {
        digest: () => Promise.resolve(new ArrayBuffer(32))
    }
  }
});

// Mock Window Scroll
window.scrollTo = vi.fn();

// --- NEW: Mock matchMedia ---
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});