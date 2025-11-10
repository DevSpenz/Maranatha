import { supabase } from "@/integrations/supabase/client";
import { Group } from "@/types";

/**
 * Fetches all groups from the database.
 * Maps snake_case database fields to camelCase frontend types.
 */
export async function fetchGroups(): Promise<Group[]> {
    const { data, error } = await supabase
        .from('groups')
        .select('id, name, description, disbursement_ratio, current_balance_kes, beneficiary_count')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching groups:", error);
        throw new Error("Failed to load group data.");
    }

    return data.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description || '',
        disbursementRatio: parseFloat(g.disbursement_ratio.toString()),
        currentBalanceKes: parseFloat(g.current_balance_kes.toString()),
        beneficiaryCount: g.beneficiary_count,
    })) as Group[];
}

/**
 * Creates a new group entry in the database.
 */
export async function createGroup(groupData: { name: string, description?: string, disbursementRatio: number, user_id: string }) {
    const { data, error } = await supabase
        .from('groups')
        .insert({
            user_id: groupData.user_id,
            name: groupData.name,
            description: groupData.description,
            disbursement_ratio: groupData.disbursementRatio,
            current_balance_kes: 0,
            beneficiary_count: 0,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating group:", error);
        throw new Error("Failed to create group.");
    }

    return data;
}