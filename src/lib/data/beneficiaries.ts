import { supabase } from "@/integrations/supabase/client";
import { Beneficiary } from "@/types";

/**
 * Helper function to map database row to Beneficiary type.
 */
const mapBeneficiary = (b: any): Beneficiary => ({
    id: b.id,
    sponsorNumber: b.sponsor_number,
    fullName: b.full_name,
    idNumber: b.id_number || undefined,
    dateOfBirth: new Date(b.date_of_birth),
    phoneNumber: b.phone_number,
    gender: b.gender as Beneficiary['gender'],
    guardianName: b.guardian_name,
    guardianPhone: b.guardian_phone,
    guardianId: b.guardian_id || undefined,
    status: b.status as Beneficiary['status'],
    groupId: b.group_id,
});

/**
 * Fetches all beneficiaries from the database.
 * Maps snake_case database fields to camelCase frontend types.
 */
export async function fetchBeneficiaries(): Promise<Beneficiary[]> {
    const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, sponsor_number, full_name, id_number, date_of_birth, phone_number, gender, guardian_name, guardian_phone, guardian_id, status, group_id')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching beneficiaries:", error);
        throw new Error("Failed to load beneficiary data.");
    }

    return data.map(mapBeneficiary) as Beneficiary[];
}

/**
 * Fetches a single beneficiary by ID.
 */
export async function fetchBeneficiaryById(beneficiaryId: string): Promise<Beneficiary | null> {
    const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, sponsor_number, full_name, id_number, date_of_birth, phone_number, gender, guardian_name, guardian_phone, guardian_id, status, group_id')
        .eq('id', beneficiaryId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching single beneficiary:", error);
        throw new Error("Failed to load beneficiary details.");
    }
    
    if (!data) return null;

    return mapBeneficiary(data);
}


/**
 * Creates a new beneficiary entry in the database.
 */
export async function createBeneficiary(beneficiaryData: Omit<Beneficiary, 'id' | 'dateOfBirth'> & { dateOfBirth: Date, user_id: string }) {
    const { error } = await supabase
        .from('beneficiaries')
        .insert({
            user_id: beneficiaryData.user_id,
            group_id: beneficiaryData.groupId,
            sponsor_number: beneficiaryData.sponsorNumber,
            full_name: beneficiaryData.fullName,
            id_number: beneficiaryData.idNumber,
            date_of_birth: beneficiaryData.dateOfBirth.toISOString().split('T')[0],
            phone_number: beneficiaryData.phoneNumber,
            gender: beneficiaryData.gender,
            guardian_name: beneficiaryData.guardianName,
            guardian_phone: beneficiaryData.guardianPhone,
            guardian_id: beneficiaryData.guardianId,
            status: beneficiaryData.status,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating beneficiary:", error);
        throw new Error("Failed to register beneficiary.");
    }
}

/**
 * Deletes a beneficiary by their ID.
 */
export async function deleteBeneficiary(beneficiaryId: string) {
    const { error } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', beneficiaryId);

    if (error) {
        console.error("Error deleting beneficiary:", error);
        throw new Error("Failed to delete beneficiary.");
    }
}