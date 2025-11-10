"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Loader2 } from "lucide-react";
import { BeneficiaryForm } from "@/components/forms/BeneficiaryForm";
import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "./columns";
import { Beneficiary, Group } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { fetchBeneficiaries } from "@/lib/data/beneficiaries";
import { fetchGroups } from "@/lib/data/groups";
import { toast } from "sonner";

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedBeneficiaries, fetchedGroups] = await Promise.all([
        fetchBeneficiaries(),
        fetchGroups(),
      ]);
      setBeneficiaries(fetchedBeneficiaries);
      setGroups(fetchedGroups);
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

  // Create a map for quick group name lookup in the columns file
  const groupMap: Record<string, string> = groups.reduce((acc, group) => {
    acc[group.id] = group.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Beneficiary Management</h1>
          <Button onClick={() => { /* Placeholder for future dialog/scroll */ }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Register New Beneficiary
          </Button>
        </div>

        {/* New Beneficiary Registration Form Card */}
        <BeneficiaryForm onBeneficiaryCreated={loadData} />

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
                <DataTable columns={columns(groupMap)} data={beneficiaries} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}