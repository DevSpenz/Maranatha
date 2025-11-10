"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingDown, Users, Loader2 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "./columns";
import { Disbursement } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { fetchDisbursements } from "@/lib/data/disbursements";
import { fetchFinancialSummary } from "@/lib/data/cashbook";
import { fetchGroups } from "@/lib/data/groups";
import { formatKes } from "@/lib/utils";
import { toast } from "sonner";
import { DisbursementFormDialog } from "@/components/dialogs/DisbursementFormDialog";

// Initial state for summary cards while loading
const initialDisbursementSummary = [
  { title: "Main Cash Balance (KES)", value: "...", Icon: DollarSign, description: "Available for allocation" },
  { title: "Total Disbursed YTD", value: "...", Icon: TrendingDown, description: "Funds moved to groups" },
  { title: "Groups with Zero Balance", value: "...", Icon: Users, description: "Requires immediate allocation" },
];


export default function DisbursementPage() {
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(initialDisbursementSummary);

  const loadDisbursements = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedDisbursements, financialSummary, groups] = await Promise.all([
        fetchDisbursements(),
        fetchFinancialSummary(),
        fetchGroups(),
      ]);
      
      setDisbursements(fetchedDisbursements);
      
      // Calculate summary metrics
      const zeroBalanceGroups = groups.filter(g => g.currentBalanceKes <= 0).length;

      setSummary([
        { 
            title: "Main Cash Balance (KES)", 
            value: formatKes(financialSummary.mainCashBalance), 
            Icon: DollarSign, 
            description: "Available for allocation" 
        },
        { 
            title: "Total Disbursed YTD", 
            value: formatKes(financialSummary.totalDisbursementsKes), 
            Icon: TrendingDown, 
            description: "Funds moved to groups" 
        },
        { 
            title: "Groups with Zero Balance", 
            value: zeroBalanceGroups.toString(), 
            Icon: Users, 
            description: "Requires immediate allocation" 
        },
      ]);

    } catch (error) {
      toast.error("Failed to load disbursement history or summary.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisbursements();
  }, [loadDisbursements]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Fund Disbursement</h1>
          <DisbursementFormDialog onSuccess={loadDisbursements} />
      </div>
      
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
  );
}