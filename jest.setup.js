import '@testing-library/jest-dom';
import 'isomorphic-fetch';
import React from 'react';
import 'jest-environment-jsdom';

// Mock para next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock para next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => null),
}));

const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    profile: {
      id: '1',
      name: 'Test Profile',
    },
  },
};

jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    __esModule: true,
    ...originalModule,
    useSession: jest.fn(() => ({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    })),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(() => mockSession),
  };
});

// Mock para fetch global
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock do console.error para evitar logs desnecessários
console.error = jest.fn();

// Mock para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suprimir erros de console durante os testes
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
