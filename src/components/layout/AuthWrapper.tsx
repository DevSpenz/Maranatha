"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ['/login'];

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isLoading } = useAuthGuard();
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not loading and user is required but missing, the guard handles redirection.
  // If user is present or it's a public route, render children.
  if (user || isPublicRoute) {
    return <>{children}</>;
  }

  // If we reach here, it means the guard is redirecting, so we render nothing or a minimal spinner
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}