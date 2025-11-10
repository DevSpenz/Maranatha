import { supabase } from "@/integrations/supabase/client";
import { Beneficiary, Group, BeneficiaryPayment } from "@/types";
import { fetchGroups } from "./groups";

interface PaymentRunResult {
    totalPaid: number;
    paymentsCount: number;
}

/**
 * Fetches all active beneficiaries for a given group.
 */
async function fetchActiveBeneficiariesInGroup(groupId: string): Promise<Beneficiary[]> {
    const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name')
        .eq('group_id', groupId)
        .eq('status', 'active');

    if (error) {
        console.error("Error fetching active beneficiaries:", error);
        throw new Error("Failed to retrieve active beneficiaries for payment calculation.");
    }
    return data as Beneficiary[];
}

/**
 * Handles an equal split payment run for a selected group.
 * The total amount is split equally among all active beneficiaries in that group.
 */
export async function createEqualSplitPaymentRun(paymentData: { 
    groupId: string, 
    totalAmountKes: number, 
    notes?: string, 
    user_id: string,
}) {
    const { groupId, totalAmountKes, notes, user_id } = paymentData;

    // 1. Fetch the group and active beneficiaries
    const [groups, activeBeneficiaries] = await Promise.all([
        fetchGroups(),
        fetchActiveBeneficiariesInGroup(groupId),
    ]);
    
    const group = groups.find(g => g.id === groupId);

    if (!group) {
        throw new Error("Group not found.");
    }

    if (activeBeneficiaries.length === 0) {
        throw new Error(`Group '${group.name}' has no active beneficiaries to receive payment.`);
    }

    if (totalAmountKes > group.currentBalanceKes) {
        throw new Error(`Insufficient funds. Group balance is ${group.currentBalanceKes.toLocaleString()} KES.`);
    }

    // 2. Calculate payment details
    const paymentsCount = activeBeneficiaries.length;
    // Use Math.floor to ensure the group balance is not overdrawn due to floating point issues
    const amountPerBeneficiary = Math.floor(totalAmountKes / paymentsCount); 
    
    if (amountPerBeneficiary <= 0) {
        throw new Error("The total amount is too small to distribute equally among active beneficiaries.");
    }

    const totalPaid = amountPerBeneficiary * paymentsCount;
    const paymentRunId = crypto.randomUUID(); // Unique ID for this batch of payments

    const paymentsToInsert: any[] = activeBeneficiaries.map(b => ({
        user_id: user_id,
        group_id: groupId,
        beneficiary_id: b.id,
        amount_kes: amountPerBeneficiary,
        payment_run_id: paymentRunId,
        notes: notes || `Equal split payment run. Share: ${amountPerBeneficiary} KES.`,
        date_paid: new Date().toISOString().split('T')[0],
    }));

    // 3. Execute inserts and group balance update
    
    // Insert all payment records
    const { error: insertError } = await supabase
        .from('beneficiary_payments')
        .insert(paymentsToInsert);

    if (insertError) {
        console.error("Error inserting beneficiary payments:", insertError);
        throw new Error("Failed to record beneficiary payments.");
    }

    // Update the group balance (subtract the total paid amount)
    const { error: updateError } = await supabase.rpc('update_group_balance_on_payment', {
        group_id_input: groupId,
        amount_kes_input: totalPaid,
    });

    if (updateError) {
        console.error("Error updating group balance after payment:", updateError);
        // Critical failure: payments recorded but balance not updated.
        throw new Error("Payments recorded, but failed to update group balance.");
    }
    
    return { totalPaid, paymentsCount } as PaymentRunResult;
}

/**
 * Fetches all payments made to a specific beneficiary.
 */
export async function fetchBeneficiaryPayments(beneficiaryId: string): Promise<BeneficiaryPayment[]> {
    const { data, error } = await supabase
        .from('beneficiary_payments')
        .select(`
            id, 
            group_id, 
            beneficiary_id, 
            amount_kes, 
            payment_run_id, 
            notes, 
            date_paid, 
            created_at,
            groups (name)
        `)
        .eq('beneficiary_id', beneficiaryId)
        .order('date_paid', { ascending: false });

    if (error) {
        console.error("Error fetching beneficiary payments:", error);
        throw new Error("Failed to load beneficiary payment history.");
    }

    return data.map(p => ({
        id: p.id,
        groupId: p.group_id,
        groupName: (p.groups as { name: string }).name,
        beneficiaryId: p.beneficiary_id,
        amountKes: parseFloat(p.amount_kes.toString()),
        paymentRunId: p.payment_run_id || undefined,
        notes: p.notes || undefined,
        datePaid: new Date(p.date_paid),
        recordedAt: new Date(p.created_at),
    })) as BeneficiaryPayment[];
}