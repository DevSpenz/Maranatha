"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "@/app/beneficiaries/columns";
import { Beneficiary, Group } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { fetchBeneficiaries } from "@/lib/data/beneficiaries";
import { toast } from "sonner";
import { BeneficiaryFormDialog } from "@/components/dialogs/BeneficiaryFormDialog";
import { BeneficiaryPaymentDialog } from "@/components/dialogs/BeneficiaryPaymentDialog"; // Import new dialog

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Only fetch beneficiaries, as group name is now joined in the data layer
      const fetchedBeneficiaries = await fetchBeneficiaries();
      setBeneficiaries(fetchedBeneficiaries);
    } catch (error) {
      toast.error("Failed to load beneficiary data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pass an empty map since the columns now use groupName directly, 
  // but the function signature requires it for compatibility with the DataTable pattern.
  const groupMap: Record<string, string> = {}; 

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Beneficiary Management</h1>
        <div className="flex gap-2">
            <BeneficiaryPaymentDialog onSuccess={loadData} />
            <BeneficiaryFormDialog onSuccess={loadData} />
        </div>
      </div>

      <Separator />

      {/* Beneficiary List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Beneficiaries ({beneficiaries.length})</CardTitle>
          <CardDescription>
            Filter and manage the status of all beneficiaries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
              <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          ) : (
              <DataTable 
                columns={columns(groupMap, loadData)} 
                data={beneficiaries} 
                searchKey="fullName" // Enable filtering by full name
              />
          )}
        </CardContent>
      </Card>
    </div>
  );
}