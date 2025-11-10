"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "./columns";
import { Donation } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { fetchDonations } from "@/lib/data/donations";
import { toast } from "sonner";
import { DonationFormDialog } from "@/components/dialogs/DonationFormDialog";

export default function DonorsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDonations = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedDonations = await fetchDonations();
      setDonations(fetchedDonations);
    } catch (error) {
      toast.error("Failed to load donation history.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Donor Management</h1>
          <DonationFormDialog onSuccess={loadDonations} />
        </div>

        <Separator />

        {/* Donation History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>
              A list of all recorded donations and their corresponding KES value and exchange rate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <DataTable columns={columns} data={donations} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}