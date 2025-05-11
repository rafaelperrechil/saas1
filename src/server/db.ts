import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
npm test

> saas-platform@0.1.0 test     
> jest --config jest.config.cjs

 FAIL  src/app/reset-password/page.test.tsx
  ● Test suite failed to run

    Cannot find module '@testing-library/dom' from 'node_modules/@testing-library/react/dist/pure.js'

    Require stack:
      node_modules/@testing-library/react/dist/pure.js
      node_modules/@testing-library/react/dist/index.js
      src/app/reset-password/page.test.tsx

      13 | const mockUseSearchParamsNoToken = () => ({ get: () => null });
      14 |
    > 15 | // Mock global que retorna token válido por padrão
         |                 ^
      16 | jest.mock('next/navigation', () => {
      17 |   const actual = jest.requireActual('next/navigation');      
      18 |   return {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (node_modules/@testing-library/react/dist/pure.js:46:12)
      at Object.<anonymous> (node_modules/@testing-library/react/dist/index.js:7:13)
      at Object.<anonymous> (src/app/reset-password/page.test.tsx:15:17)

 FAIL  src/app/login/page.test.tsx
  ● Test suite failed to run

    Cannot find module '@testing-library/dom' from 'node_modules/@testing-library/react/dist/pure.js'

    Require stack:
      node_modules/@testing-library/react/dist/pure.js
      node_modules/@testing-library/react/dist/index.js
      src/app/login/page.test.tsx

      34 |         'auth.login.error.invalid': 'E-mail ou senha inválidos',
      35 |         'auth.login.error.generic': 'Erro ao fazer login',   
    > 36 |         'auth.login.hero.line1': 'Bem-vindo!',
         |                 ^
      37 |         'auth.login.hero.line2': 'Acesse sua conta',
      38 |         'auth.login.hero.line3': 'e aproveite todos os recursos',
      39 |       };

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (node_modules/@testing-library/react/dist/pure.js:46:12)
      at Object.<anonymous> (node_modules/@testing-library/react/dist/index.js:7:13)
      at Object.<anonymous> (src/app/login/page.test.tsx:36:17)

 FAIL  src/app/register/page.test.tsx
  ● Test suite failed to run

    Cannot find module '@testing-library/dom' from 'node_modules/@testing-library/react/dist/pure.js'

    Require stack:
      node_modules/@testing-library/react/dist/pure.js
      node_modules/@testing-library/react/dist/index.js
      src/app/register/page.test.tsx

      45 |     i18n: { changeLanguage: () => new Promise(() => {}) },   
      46 |   }),
    > 47 | }));
         |               ^
      48 |
      49 | describe('RegisterPage', () => {
      50 |   beforeEach(() => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (node_modules/@testing-library/react/dist/pure.js:46:12)
      at Object.<anonymous> (node_modules/@testing-library/react/dist/index.js:7:13)
      at Object.<anonymous> (src/app/register/page.test.tsx:47:17)      

Test Suites: 3 failed, 3 total
Tests:       0 total
Snapshots:   0 total
Time:        1.643 s
Ran all test suites.