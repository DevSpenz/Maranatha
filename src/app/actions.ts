"use server";

import { toast } from "sonner";

/**
 * Securely calls the Supabase Edge Function to reset all application data tables.
 * This should only be used in development/testing environments.
 */
export async function resetAllData() {
    // NOTE: In a real application, the SUPABASE_PROJECT_ID and SUPABASE_SERVICE_ROLE_KEY 
    // would be loaded from environment variables. We use the hardcoded ID here 
    // as per the provided context, but the key must be handled securely on the server.
    
    const SUPABASE_PROJECT_ID = "ypkcviedfxpfgcsxrjhc";
    const EDGE_FUNCTION_NAME = "reset-data";
    
    // WARNING: The Service Role Key is highly sensitive and should NEVER be exposed to the client.
    // It is assumed that this Server Action runs in a secure environment where 
    // process.env.SUPABASE_SERVICE_ROLE_KEY is available.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

    if (!serviceRoleKey) {
        console.error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.");
        return { success: false, message: "Configuration error: Service key missing." };
    }

    const url = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/${EDGE_FUNCTION_NAME}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`, // Use Service Role Key for authorization
            },
            // Send an empty body if the function expects one, or omit if not needed
            body: JSON.stringify({}), 
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Edge Function Error Response:", result);
            return { success: false, message: result.error || "Failed to reset data via Edge Function." };
        }

        return { success: true, message: result.message };

    } catch (error) {
        console.error("Network or Fetch Error during data reset:", error);
        return { success: false, message: "Network error during data reset." };
    }
}