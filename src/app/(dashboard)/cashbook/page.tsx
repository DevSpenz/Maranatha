"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, BookOpen, TrendingUp, Loader2 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useState, useEffect, useCallback } from "react";
import { fetchFinancialSummary, fetchCashbookEntries } from "@/lib/data/cashbook";
import { formatKes } from "@/lib/utils";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/DataTable";
import { cashbookColumns } from "@/app/cashbook/cashbook-columns";
import { CashbookEntry } from "@/types";
import { GeneralLedgerView } from "@/components/cashbook/GeneralLedgerView"; // Import the new component

// Initial state for summary cards while loading
const initialCashbookSummary = [
  { title: "Total Cash In (YTD)", value: "...", Icon: DollarSign, description: "Total donations received" },
  { title: "Total Cash Out (YTD)", value: "...", Icon: TrendingUp, description: "Total funds disbursed to groups" },
  { title: "Main Cash Balance", value: "...", Icon: BookOpen, description: "Funds available for allocation" },
];

export default function CashbookPage() {
  const [summary, setSummary] = useState(initialCashbookSummary);
  const [cashbookEntries, setCashbookEntries] = useState<CashbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [financialSummary, entries] = await Promise.all([
        fetchFinancialSummary(),
        fetchCashbookEntries(),
      ]);
      
      setSummary([
        { 
            title: "Total Cash In (YTD)", 
            value: formatKes(financialSummary.totalDonationsKes), 
            Icon: DollarSign, 
            description: "Total donations received" 
        },
        { 
            title: "Total Cash Out (YTD)", 
            value: formatKes(financialSummary.totalDisbursementsKes), 
            Icon: TrendingUp, 
            description: "Total funds disbursed to groups" 
        },
        { 
            title: "Main Cash Balance", 
            value: formatKes(financialSummary.mainCashBalance), 
            Icon: BookOpen, 
            description: "Funds available for allocation" 
        },
      ]);
      
      setCashbookEntries(entries);

    } catch (error) {
      toast.error("Failed to load cashbook data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cashbook & Ledger</h1>
      
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
      
      {/* Tabs for Cashbook and General Ledger */}
      <Tabs defaultValue="cashbook" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="cashbook">Cashbook</TabsTrigger>
          <TabsTrigger value="ledger">General Ledger</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cashbook" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cashbook Entries</CardTitle>
              <CardDescription>
                Detailed record of all cash inflows (Donations) and outflows (Disbursements).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
              ) : (
                  <DataTable columns={cashbookColumns} data={cashbookEntries} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ledger" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Ledger View</CardTitle>
              <CardDescription>
                View the running balance of the Main Cash Account (unallocated funds).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
              ) : (
                  <GeneralLedgerView cashbookEntries={cashbookEntries} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}