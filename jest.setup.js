import '@testing-library/jest-dom';
import 'isomorphic-fetch';
import React from 'react';

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
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(() => null),
  };
});

// Mock para fetch global
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

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
