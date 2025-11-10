"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/components/auth/SessionContextProvider';

const PUBLIC_ROUTES = ['/login'];

export function useAuthGuard() {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (user && isPublicRoute) {
      // User is logged in and trying to access a public route (like /login), redirect to dashboard
      router.replace('/');
    } else if (!user && !isPublicRoute) {
      // User is not logged in and trying to access a protected route, redirect to login
      router.replace('/login');
    }
  }, [user, isLoading, pathname, router]);

  return { user, isLoading };
}