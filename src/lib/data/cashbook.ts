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

export interface TrialBalanceData {
    totalDonationsCredit: number;
    totalDisbursementsDebit: number;
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
}

// Helper function to apply date filters to a query builder
function applyDateFilter(query: any, dateColumn: string, startDate?: Date, endDate?: Date) {
    if (startDate) {
        query = query.gte(dateColumn, startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
        query = query.lte(dateColumn, endDate.toISOString().split('T')[0]);
    }
    return query;
}

/**
 * Fetches and calculates the overall financial summary metrics.
 * If startDate and endDate are provided, it calculates the summary for that period.
 * NOTE: MainCashBalance and TotalGroupBalance are always calculated as of today, 
 * regardless of the date range, as they represent current balances.
 */
export async function fetchFinancialSummary(startDate?: Date, endDate?: Date): Promise<FinancialSummary> {
    // 1. Calculate Total Donations (Cash In) within the period
    let donationQuery = supabase
        .from('donations')
        .select('kes_amount');
    
    donationQuery = applyDateFilter(donationQuery, 'date_received', startDate, endDate);

    const { data: donationData, error: donationError } = await donationQuery;

    if (donationError) {
        console.error("Error fetching donations for summary:", donationError);
        throw new Error("Failed to calculate total donations.");
    }

    const totalDonationsKes = donationData.reduce((sum, d) => sum + parseFloat(d.kes_amount.toString()), 0);

    // 2. Calculate Total Disbursements (Cash Out to Groups) within the period
    let disbursementQuery = supabase
        .from('disbursements')
        .select('amount_kes');
        
    disbursementQuery = applyDateFilter(disbursementQuery, 'date_disbursed', startDate, endDate);

    const { data: disbursementData, error: disbursementError } = await disbursementQuery;

    if (disbursementError) {
        console.error("Error fetching disbursements for summary:", disbursementError);
        throw new Error("Failed to calculate total disbursements.");
    }

    const totalDisbursementsKes = disbursementData.reduce((sum, d) => sum + parseFloat(d.amount_kes.toString()), 0);

    // 3. Calculate Main Cash Balance (Funds not yet allocated to groups) - ALWAYS CURRENT BALANCE
    // This requires fetching ALL donations and ALL disbursements up to today.
    const { data: allDonations } = await supabase.from('donations').select('kes_amount');
    const { data: allDisbursements } = await supabase.from('disbursements').select('amount_kes');
    
    const totalAllDonations = allDonations?.reduce((sum, d) => sum + parseFloat(d.kes_amount.toString()), 0) || 0;
    const totalAllDisbursements = allDisbursements?.reduce((sum, d) => sum + parseFloat(d.amount_kes.toString()), 0) || 0;
    
    const mainCashBalance = totalAllDonations - totalAllDisbursements;


    // 4. Calculate Total Group Balance (Sum of all group balances) - ALWAYS CURRENT BALANCE
    const groups = await fetchGroups(); 
    const totalGroupBalance = groups.reduce((sum, g) => sum + g.currentBalanceKes, 0);

    // 5. Calculate Total System Balance (Should theoretically equal Total Donations Kes)
    const totalSystemBalance = mainCashBalance + totalGroupBalance;

    return {
        totalDonationsKes, // Filtered by date range
        totalDisbursementsKes, // Filtered by date range
        mainCashBalance, // Current balance (unfiltered)
        totalGroupBalance, // Current balance (unfiltered)
        totalSystemBalance, // Current balance (unfiltered)
    };
}

/**
 * Fetches aggregated data required for the Income Statement (Revenue vs. Expenses).
 */
export async function fetchIncomeStatementData(startDate?: Date, endDate?: Date): Promise<IncomeStatementData> {
    // We use the filtered totals from the summary for the Income Statement
    const summary = await fetchFinancialSummary(startDate, endDate);
    
    const totalDonationsKes = summary.totalDonationsKes;
    const totalDisbursementsKes = summary.totalDisbursementsKes;
    
    // Net Surplus is calculated as Revenue (Donations) minus Expenses (Disbursements)
    const netSurplus = totalDonationsKes - totalDisbursementsKes;

    return {
        totalDonationsKes,
        totalDisbursementsKes,
        netSurplus,
    };
}

/**
 * Fetches aggregated data required for the Balance Sheet (Assets, Liabilities, Equity).
 * Balance Sheet is always calculated as of today, so date filters are ignored here.
 */
export async function fetchBalanceSheetData(): Promise<BalanceSheetData> {
    const summary = await fetchFinancialSummary(); // Fetches current balances

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
 * Fetches aggregated data required for the Trial Balance.
 * In this simplified system, we treat Donations as Credits and Disbursements as Debits 
 * to the main cash account, plus the resulting Net Surplus/Deficit.
 */
export async function fetchTrialBalanceData(startDate?: Date, endDate?: Date): Promise<TrialBalanceData> {
    const summary = await fetchFinancialSummary(startDate, endDate);

    // In a simplified cash-based system:
    // Total Donations (Inflow) = Credit
    const totalDonationsCredit = summary.totalDonationsKes;
    
    // Total Disbursements (Outflow) = Debit
    const totalDisbursementsDebit = summary.totalDisbursementsKes;
    
    // The difference (Net Surplus/Deficit) is the balancing figure, 
    // which represents the change in the Main Cash Account balance over the period.
    const netSurplus = totalDonationsCredit - totalDisbursementsDebit;

    let netSurplusDebit = 0;
    let netSurplusCredit = 0;

    if (netSurplus > 0) {
        // If there is a surplus (Credit > Debit), the balancing entry must be a DEBIT
        // to make the totals equal.
        netSurplusDebit = netSurplus;
    } else if (netSurplus < 0) {
        // If there is a deficit (Debit > Credit), the balancing entry must be a CREDIT
        // to make the totals equal.
        netSurplusCredit = Math.abs(netSurplus);
    }

    // Total Debits = Disbursements + Net Surplus (if surplus, it's a debit entry)
    const totalDebits = totalDisbursementsDebit + netSurplusDebit;
    
    // Total Credits = Donations + Net Deficit (if deficit, it's a credit entry)
    const totalCredits = totalDonationsCredit + netSurplusCredit;

    return {
        totalDonationsCredit,
        totalDisbursementsDebit,
        totalDebits,
        totalCredits,
        isBalanced: Math.round(totalDebits * 100) === Math.round(totalCredits * 100), // Use rounding for floating point safety
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