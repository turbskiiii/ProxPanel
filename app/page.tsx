import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">{t('dashboard.title')}</h1>
      <p className="mt-4 text-lg">{t('dashboard.welcome', { name: 'User' })}</p>
    </main>
  );
}
