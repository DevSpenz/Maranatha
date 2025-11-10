import { supabase } from "@/integrations/supabase/client";
import { Donation } from "@/types";

/**
 * Fetches all donations from the database.
 * Maps snake_case database fields to camelCase frontend types.
 */
export async function fetchDonations(): Promise<Donation[]> {
    const { data, error } = await supabase
        .from('donations')
        .select('id, donor_name, sek_amount, exchange_rate, kes_amount, date_received, recorded_at')
        .order('date_received', { ascending: false });

    if (error) {
        console.error("Error fetching donations:", error);
        throw new Error("Failed to load donation data.");
    }

    return data.map(d => ({
        id: d.id,
        donorName: d.donor_name,
        sekAmount: parseFloat(d.sek_amount.toString()),
        exchangeRate: parseFloat(d.exchange_rate.toString()),
        kesAmount: parseFloat(d.kes_amount.toString()),
        dateReceived: new Date(d.date_received),
        recordedAt: new Date(d.recorded_at),
    })) as Donation[];
}

/**
 * Creates a new donation entry in the database.
 */
export async function createDonation(donationData: { 
    donorName: string, 
    sekAmount: number, 
    exchangeRate: number, 
    dateReceived: Date, 
    user_id: string 
}) {
    const kesAmount = donationData.sekAmount * donationData.exchangeRate;
    
    const { data, error } = await supabase
        .from('donations')
        .insert({
            user_id: donationData.user_id,
            donor_name: donationData.donorName,
            sek_amount: donationData.sekAmount,
            exchange_rate: donationData.exchangeRate,
            kes_amount: kesAmount,
            date_received: donationData.dateReceived.toISOString().split('T')[0], // Supabase expects date string
        })
        .select('kes_amount')
        .single();

    if (error) {
        console.error("Error creating donation:", error);
        throw new Error("Failed to record donation.");
    }

    return data;
}