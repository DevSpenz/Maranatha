import { supabase } from "@/integrations/supabase/client";
import { fetchGroups } from "./groups";
import { CashbookEntry } from "@/types";

interface FinancialSummary {
    totalDonationsKes: number;
    totalDisbursementsKes: number;
    mainCashBalance: number;
    totalGroupBalance: number;
    totalSystemBalance: number;
}

export interface IncomeStatementData {
    totalDonationsKes: number;
    totalDisbursementsKes: number;
    netSurplus: number;
}

export interface BalanceSheetData {
    mainCashBalance: number;
    totalGroupBalance: number;
    totalAssets: number;
    accumulatedFundBalance: number; // Should equal totalAssets in this simplified model
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

/**
 * Fetches aggregated data required for the Income Statement (Revenue vs. Expenses).
 */
export async function fetchIncomeStatementData(): Promise<IncomeStatementData> {
    const summary = await fetchFinancialSummary();
    
    const totalDonationsKes = summary.totalDonationsKes;
    const totalDisbursementsKes = summary.totalDisbursementsKes;
    
    // Net Surplus is calculated as Revenue (Donations) minus Expenses (Disbursements)
    // Note: In this simplified model, disbursements are treated as expenses for the purpose of Net Income calculation, 
    // although technically they are internal fund transfers. We use this structure until true operational expenses are tracked.
    const netSurplus = totalDonationsKes - totalDisbursementsKes;

    return {
        totalDonationsKes,
        totalDisbursementsKes,
        netSurplus,
    };
}

/**
 * Fetches aggregated data required for the Balance Sheet (Assets, Liabilities, Equity).
 */
export async function fetchBalanceSheetData(): Promise<BalanceSheetData> {
    const summary = await fetchFinancialSummary();

    const totalAssets = summary.mainCashBalance + summary.totalGroupBalance;
    
    // In this simplified model (no liabilities, no opening balance), 
    // Accumulated Fund Balance (Equity) equals Total Assets (Total System Cash).
    const accumulatedFundBalance = totalAssets;

    return {
        mainCashBalance: summary.mainCashBalance,
        totalGroupBalance: summary.totalGroupBalance,
        totalAssets,
        accumulatedFundBalance,
    };
}


/**
 * Fetches all donations and disbursements and merges them into a single chronological cashbook.
 */
export async function fetchCashbookEntries(): Promise<CashbookEntry[]> {
    const [donationsResult, disbursementsResult] = await Promise.all([
        supabase.from('donations').select('id, donor_name, kes_amount, date_received, recorded_at'),
        supabase.from('disbursements').select(`
            id, 
            amount_kes, 
            date_disbursed, 
            created_at,
            groups (name)
        `),
    ]);

    if (donationsResult.error) {
        console.error("Error fetching donations for cashbook:", donationsResult.error);
        throw new Error("Failed to load cashbook inflows.");
    }
    if (disbursementsResult.error) {
        console.error("Error fetching disbursements for cashbook:", disbursementsResult.error);
        throw new Error("Failed to load cashbook outflows.");
    }

    const inflows: CashbookEntry[] = donationsResult.data.map(d => ({
        id: d.id,
        date: new Date(d.date_received),
        description: `Donation received from ${d.donor_name}`,
        type: 'inflow' as const,
        amountKes: parseFloat(d.kes_amount.toString()),
        sourceOrTarget: d.donor_name,
    }));

    const outflows: CashbookEntry[] = disbursementsResult.data.map(d => ({
        id: d.id,
        date: new Date(d.date_disbursed),
        description: `Funds disbursed to group ${(d.groups as { name: string }).name}`,
        type: 'outflow' as const,
        amountKes: parseFloat(d.amount_kes.toString()),
        sourceOrTarget: (d.groups as { name: string }).name,
    }));

    // Merge and sort chronologically
    const cashbook = [...inflows, ...outflows].sort((a, b) => 
        b.date.getTime() - a.date.getTime() // Sort descending by date
    );

    return cashbook;
}