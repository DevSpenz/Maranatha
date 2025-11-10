import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // IMPORTANT: This function must be called with the Service Role Key 
  // or a verified JWT from an admin user for security.
  // For simplicity in this development tool, we rely on the caller providing the Service Role Key.
  
  try {
    // Create a Supabase client with the Service Role Key
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // SQL to truncate tables. CASCADE ensures related records (like payments) are also deleted.
    // We exclude 'profiles' and 'auth.users' to keep the current user logged in.
    const { error } = await supabaseServiceRole.rpc('truncate_tables', {
        table_names: [
            'beneficiary_payments', 
            'disbursements', 
            'donations', 
            'beneficiaries', 
            'groups'
        ]
    });

    if (error) {
      console.error('Database Truncate Error:', error);
      return new Response(JSON.stringify({ error: 'Failed to truncate tables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'All application data reset successfully.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});