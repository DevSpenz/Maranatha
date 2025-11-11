import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUPABASE_PROJECT_ID = "ypkcviedfxpfgcsxrjhc";
const EDGE_FUNCTION_NAME = "generate-voucher";

/**
 * Calls the Supabase Edge Function to generate a PDF payment voucher 
 * and triggers the download in the browser.
 */
export async function generatePaymentVoucherPdf(paymentId: string, exchangeRate: number) {
    const url = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/${EDGE_FUNCTION_NAME}`;
    
    // Get the current session JWT for authentication in the Edge Function
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error("User session not found. Please log in again.");
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ paymentId, exchangeRate }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("PDF Generation Error:", errorData);
            throw new Error(errorData.error || "Failed to generate PDF voucher.");
        }

        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const filename = filenameMatch ? filenameMatch[1] : `voucher_${paymentId.substring(0, 8)}.pdf`;

        // Convert the response stream to a Blob
        const blob = await response.blob();
        
        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("PDF Voucher generated and downloaded successfully.");

    } catch (error) {
        console.error("PDF Generation failed:", error);
        toast.error(error instanceof Error ? error.message : "An unknown error occurred during PDF generation.");
        throw error;
    }
}