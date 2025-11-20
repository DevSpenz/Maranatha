"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/components/auth/SessionContextProvider';

export default function LoginPage() {
  const { user, isLoading } = useSession();

  // Determine the redirect URL dynamically
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      // Use the current origin for client-side redirection
      return `${window.location.origin}/`;
    }
    // Fallback for server-side rendering (though this component is client-only)
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000/';
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Maranatha FMS Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="light"
            view="sign_in"
            redirectTo={getRedirectUrl()}
          />
        </CardContent>
      </Card>
    </div>
  );
}