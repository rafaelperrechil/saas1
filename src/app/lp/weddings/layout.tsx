import '../../globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QualiSight - Gestão de Casamentos',
  description: 'Sistema de gestão de qualidade para casamentos e eventos',
};

export default function WeddingsLayout({ children }: { children: React.ReactNode }) {
  return <div className={inter.className}>{children}</div>;
}
