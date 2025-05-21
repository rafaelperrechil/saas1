import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Confira nossos planos disponíveis',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
