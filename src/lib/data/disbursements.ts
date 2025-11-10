import { supabase } from "@/integrations/supabase/client";
import { Disbursement } from "@/types";

/**
 * Fetches all disbursements from the database, joining with groups to get the group name.
 * Maps snake_case database fields to camelCase frontend types.
 */
export async function fetchDisbursements(): Promise<Disbursement[]> {
    const { data, error } = await supabase
        .from('disbursements')
        .select(`
            id, 
            group_id, 
            amount_kes, 
            notes, 
            date_disbursed, 
            recorded_by,
            groups (name)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching disbursements:", error);
        throw new Error("Failed to load disbursement data.");
    }

    return data.map(d => ({
        id: d.id,
        groupId: d.group_id,
        groupName: (d.groups as { name: string }).name,
        amountKes: parseFloat(d.amount_kes.toString()),
        notes: d.notes || undefined,
        dateDisbursed: new Date(d.date_disbursed),
        recordedBy: d.recorded_by || 'System',
    })) as Disbursement[];
}

/**
 * Creates a new disbursement entry and updates the corresponding group's balance.
 */
export async function createDisbursement(disbursementData: { 
    groupId: string, 
    amountKes: number, 
    notes?: string, 
    user_id: string,
    recordedBy: string,
}) {
    // 1. Insert the new disbursement record
    const { error: insertError } = await supabase
        .from('disbursements')
        .insert({
            user_id: disbursementData.user_id,
            group_id: disbursementData.groupId,
            amount_kes: disbursementData.amountKes,
            notes: disbursementData.notes,
            date_disbursed: new Date().toISOString().split('T')[0], // Use today's date for simplicity
            recorded_by: disbursementData.recordedBy,
        });

    if (insertError) {
        console.error("Error creating disbursement:", insertError);
        throw new Error("Failed to record disbursement.");
    }

    // 2. Update the group's current balance
    // We use a function call to ensure atomic update (though Supabase doesn't support transactions easily, this is the standard pattern)
    const { error: updateError } = await supabase.rpc('update_group_balance_on_disbursement', {
        group_id_input: disbursementData.groupId,
        amount_kes_input: disbursementData.amountKes,
    });

    if (updateError) {
        console.error("Error updating group balance:", updateError);
        // NOTE: In a real system, we would need a rollback mechanism here.
        throw new Error("Disbursement recorded, but failed to update group balance.");
    }
}