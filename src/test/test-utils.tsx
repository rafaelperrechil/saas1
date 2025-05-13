import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

export const mockSession: Session = {
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

interface AllTheProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

export const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
  session = mockSession,
}) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { session?: Session | null }
) => {
  const { session, ...rest } = options || {};
  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders session={session}>{children}</AllTheProviders>,
    ...rest,
  });
};

export * from '@testing-library/react';
export { customRender as render };

export async function renderWithSession(
  ui: React.ReactElement,
  options?: { session?: Session | null }
) {
  return customRender(ui, options);
}
