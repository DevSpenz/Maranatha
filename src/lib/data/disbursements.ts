import { supabase } from "@/integrations/supabase/client";
import { Disbursement, Group } from "@/types";
import { fetchGroups } from "./groups"; // Need to import fetchGroups to get ratios

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
 * NOTE: This function is for manual, single-group disbursements.
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

/**
 * Handles proportional disbursement of a total KES amount to all groups based on their Krona Ratios.
 * This function performs multiple inserts and updates.
 */
export async function createProportionalDisbursement(disbursementData: { 
    totalAmountKes: number, 
    notes?: string, 
    user_id: string,
    recordedBy: string,
}) {
    const { totalAmountKes, notes, user_id, recordedBy } = disbursementData;

    // 1. Fetch all active groups and calculate the total Krona ratio
    const groups = await fetchGroups();
    const totalKronaRatio = groups.reduce((sum, g) => sum + g.kronaRatio, 0);

    if (totalKronaRatio <= 0) {
        throw new Error("Cannot disburse: Total Krona Ratio across all groups is zero.");
    }
    
    const disbursementsToInsert: any[] = [];
    const groupUpdates: { groupId: string, amount: number }[] = [];
    let totalDisbursed = 0;

    // 2. Calculate proportional share for each group
    for (const group of groups) {
        if (group.kronaRatio > 0) {
            const proportion = group.kronaRatio / totalKronaRatio;
            // Use Math.floor to ensure we don't over-disburse the total amount, 
            // leaving any remainder in the main cash balance.
            const amountToDisburse = Math.floor(totalAmountKes * proportion); 
            
            if (amountToDisburse > 0) {
                disbursementsToInsert.push({
                    user_id: user_id,
                    group_id: group.id,
                    amount_kes: amountToDisburse,
                    notes: notes || `Proportional disbursement based on KR ratio. Group share: ${group.kronaRatio} KR.`,
                    date_disbursed: new Date().toISOString().split('T')[0],
                    recorded_by: recordedBy,
                });
                groupUpdates.push({ groupId: group.id, amount: amountToDisburse });
                totalDisbursed += amountToDisburse;
            }
        }
    }

    if (disbursementsToInsert.length === 0) {
        throw new Error("No groups received a disbursement amount greater than zero.");
    }

    // 3. Execute all inserts and updates (ideally in a transaction, but using Promise.all for Supabase)
    
    // Insert all disbursement records
    const { error: insertError } = await supabase
        .from('disbursements')
        .insert(disbursementsToInsert);

    if (insertError) {
        console.error("Error inserting proportional disbursements:", insertError);
        throw new Error("Failed to record proportional disbursements.");
    }

    // Update all group balances using RPC calls
    const updatePromises = groupUpdates.map(update => 
        supabase.rpc('update_group_balance_on_disbursement', {
            group_id_input: update.groupId,
            amount_kes_input: update.amount,
        })
    );

    const updateResults = await Promise.all(updatePromises);
    const updateErrors = updateResults.filter(res => res.error);

    if (updateErrors.length > 0) {
        console.error("Errors updating group balances after proportional disbursement:", updateErrors);
        // NOTE: This is a critical failure point. In a real system, we would need to log this 
        // and potentially reverse the disbursement inserts.
        throw new Error("Proportional disbursement recorded, but failed to update one or more group balances.");
    }
    
    return { totalDisbursed };
}