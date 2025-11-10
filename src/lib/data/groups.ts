import { supabase } from "@/integrations/supabase/client";
import { Group } from "@/types";

/**
 * Helper function to map database row to Group type.
 */
const mapGroup = (g: any): Group => ({
    id: g.id,
    name: g.name,
    description: g.description || '',
    disbursementRatio: parseFloat(g.disbursement_ratio.toString()),
    kronaRatio: parseFloat(g.krona_ratio.toString()),
    currentBalanceKes: parseFloat(g.current_balance_kes.toString()),
    beneficiaryCount: g.beneficiary_count,
});

/**
 * Fetches all groups from the database.
 * Maps snake_case database fields to camelCase frontend types.
 */
export async function fetchGroups(): Promise<Group[]> {
    const { data, error } = await supabase
        .from('groups')
        .select('id, name, description, disbursement_ratio, krona_ratio, current_balance_kes, beneficiary_count')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching groups:", error);
        throw new Error("Failed to load group data.");
    }

    return data.map(mapGroup) as Group[];
}

/**
 * Fetches a single group by ID.
 */
export async function fetchGroupById(groupId: string): Promise<Group | null> {
    const { data, error } = await supabase
        .from('groups')
        .select('id, name, description, disbursement_ratio, krona_ratio, current_balance_kes, beneficiary_count')
        .eq('id', groupId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching single group:", error);
        throw new Error("Failed to load group details.");
    }
    
    if (!data) return null;

    return mapGroup(data);
}

/**
 * Creates a new group entry in the database.
 */
export async function createGroup(groupData: { name: string, description?: string, disbursementRatio: number, kronaRatio: number, user_id: string }) {
    const { data, error } = await supabase
        .from('groups')
        .insert({
            user_id: groupData.user_id,
            name: groupData.name,
            description: groupData.description,
            disbursement_ratio: groupData.disbursementRatio,
            krona_ratio: groupData.kronaRatio, // Include new field
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

/**
 * Updates an existing group entry in the database.
 */
export async function updateGroup(groupId: string, groupData: { name: string, description?: string, kronaRatio: number }) {
    const { error } = await supabase
        .from('groups')
        .update({
            name: groupData.name,
            description: groupData.description,
            krona_ratio: groupData.kronaRatio,
            // disbursement_ratio is left untouched/ignored as krona_ratio is the new standard
        })
        .eq('id', groupId)
        .select()
        .single();

    if (error) {
        console.error("Error updating group:", error);
        throw new Error("Failed to update group.");
    }
}

/**
 * Deletes a group by its ID.
 */
export async function deleteGroup(groupId: string) {
    const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

    if (error) {
        console.error("Error deleting group:", error);
        throw new Error("Failed to delete group.");
    }
}