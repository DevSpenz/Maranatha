"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DisbursementForm } from "@/components/forms/DisbursementForm";
import { DollarSign, TrendingDown, Users, Loader2 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "./columns";
import { Disbursement } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { fetchDisbursements } from "@/lib/data/disbursements";
import { toast } from "sonner";

// Initial state for summary cards while loading
const initialDisbursementSummary = [
  { title: "Main Cash Balance (KES)", value: "...", Icon: DollarSign, description: "Available for allocation" },
  { title: "Total Disbursed YTD", value: "...", Icon: TrendingDown, description: "Funds moved to groups" },
  { title: "Groups with Zero Balance", value: "...", Icon: Users, description: "Requires immediate allocation" },
];

// NOTE: Summary metrics will remain mocked for now until we implement the Cashbook logic.
const mockDisbursementSummary = [
  { title: "Main Cash Balance (KES)", value: "KSh 20,000", Icon: DollarSign, description: "Available for allocation" },
  { title: "Total Disbursed YTD", value: "KSh 950,000", Icon: TrendingDown, description: "Funds moved to groups" },
  { title: "Groups with Zero Balance", value: "2", Icon: Users, description: "Requires immediate allocation" },
];


export default function DisbursementPage() {
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(initialDisbursementSummary);

  const loadDisbursements = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedDisbursements = await fetchDisbursements();
      setDisbursements(fetchedDisbursements);
      
      // For now, use mock summary data until cashbook logic is implemented
      setSummary(mockDisbursementSummary); 

    } catch (error) {
      toast.error("Failed to load disbursement history.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisbursements();
  }, [loadDisbursements]);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Fund Disbursement</h1>
        
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {summary.map((s) => (
            <MetricCard
              key={s.title}
              title={s.title}
              value={s.value}
              description={s.description}
              Icon={s.Icon}
            />
          ))}
        </div>

        <Separator />
        
        {/* New Disbursement Form */}
        <DisbursementForm onDisbursementCreated={loadDisbursements} />

        <Separator />

        {/* Disbursement History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Disbursement History</CardTitle>
            <CardDescription>
              A record of all funds allocated from the main account to beneficiary groups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <DataTable columns={columns} data={disbursements} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}