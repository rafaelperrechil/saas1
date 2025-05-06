import { Metadata } from 'next';
import { getTranslation } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslation();
  return {
    title: t('account.billing.title'),
    description: t('account.billing.subtitle'),
  };
}
