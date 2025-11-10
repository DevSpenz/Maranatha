"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/components/auth/SessionContextProvider';

export default function LoginPage() {
  const { user, isLoading } = useSession();

  // The global AuthWrapper handles redirection if user is logged in.
  // We only need to check if the session is loading here to prevent flicker before AuthWrapper takes over.
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
            redirectTo={process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000/'}
          />
        </CardContent>
      </Card>
    </div>
  );
}