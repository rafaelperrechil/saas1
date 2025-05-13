'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      await signOut({ redirect: false });
      router.replace('/login');
    };

    handleLogout();
  }, [router]);

  return <LoadingScreen />;
}
