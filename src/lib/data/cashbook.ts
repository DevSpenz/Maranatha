import { supabase } from "@/integrations/supabase/client";
import { fetchGroups } from "./groups";

interface FinancialSummary {
    totalDonationsKes: number;
    totalDisbursementsKes: number;
    mainCashBalance: number;
    totalGroupBalance: number;
    totalSystemBalance: number;
}

/**
 * Fetches and calculates the overall financial summary metrics.
 */
export async function fetchFinancialSummary(): Promise<FinancialSummary> {
    // 1. Calculate Total Donations (Cash In)
    const { data: donationData, error: donationError } = await supabase
        .from('donations')
        .select('kes_amount');

    if (donationError) {
        console.error("Error fetching donations for summary:", donationError);
        throw new Error("Failed to calculate total donations.");
    }

    const totalDonationsKes = donationData.reduce((sum, d) => sum + parseFloat(d.kes_amount.toString()), 0);

    // 2. Calculate Total Disbursements (Cash Out to Groups)
    const { data: disbursementData, error: disbursementError } = await supabase
        .from('disbursements')
        .select('amount_kes');

    if (disbursementError) {
        console.error("Error fetching disbursements for summary:", disbursementError);
        throw new Error("Failed to calculate total disbursements.");
    }

    const totalDisbursementsKes = disbursementData.reduce((sum, d) => sum + parseFloat(d.amount_kes.toString()), 0);

    // 3. Calculate Main Cash Balance (Funds not yet allocated to groups)
    const mainCashBalance = totalDonationsKes - totalDisbursementsKes;

    // 4. Calculate Total Group Balance (Sum of all group balances)
    const groups = await fetchGroups(); 
    const totalGroupBalance = groups.reduce((sum, g) => sum + g.currentBalanceKes, 0);

    // 5. Calculate Total System Balance (Should theoretically equal Total Donations Kes)
    const totalSystemBalance = mainCashBalance + totalGroupBalance;

    return {
        totalDonationsKes,
        totalDisbursementsKes,
        mainCashBalance,
        totalGroupBalance,
        totalSystemBalance,
    };
}