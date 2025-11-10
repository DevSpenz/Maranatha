"use client";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { DollarSign, Users, Wallet, BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useCallback } from "react";
import { fetchFinancialSummary, fetchCashbookEntries } from "@/lib/data/cashbook";
import { formatKes } from "@/lib/utils";
import { toast } from "sonner";
import { fetchGroups } from "@/lib/data/groups";
import { Group, CashbookEntry } from "@/types";
import { useSession } from "@/components/auth/SessionContextProvider";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";

// Initial state for metrics
const initialMetrics = [
  {
    title: "Total Funds Received (KES)",
    value: "...",
    description: "Total donations recorded",
    Icon: DollarSign,
  },
  {
    title: "Total Funds Disbursed (KES)",
    value: "...",
    description: "Total funds allocated to groups",
    Icon: Wallet,
  },
  {
    title: "Active Beneficiaries",
    value: "...",
    description: "Total active beneficiaries across all groups",
    Icon: Users,
  },
  {
    title: "Main Cash Balance",
    value: "...",
    description: "Funds available for allocation",
    Icon: BookOpen,
  },
];

export default function Home() {
  const { user } = useSession();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [groups, setGroups] = useState<Group[]>([]);
  const [recentActivity, setRecentActivity] = useState<CashbookEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return; // Should not happen often due to AuthWrapper, but good practice

    setIsLoadingData(true);
    try {
      const [summary, fetchedGroups, cashbookEntries] = await Promise.all([
        fetchFinancialSummary(),
        fetchGroups(),
        fetchCashbookEntries(),
      ]);
      
      // Calculate total beneficiaries by summing up counts from all groups
      const totalBeneficiaries = fetchedGroups.reduce((sum, g) => sum + g.beneficiaryCount, 0);

      setMetrics([
        {
          title: "Total Funds Received (KES)",
          value: formatKes(summary.totalDonationsKes),
          description: "Total donations recorded",
          Icon: DollarSign,
        },
        {
          title: "Total Funds Disbursed (KES)",
          value: formatKes(summary.totalDisbursementsKes),
          description: "Total funds allocated to groups",
          Icon: Wallet,
        },
        {
          title: "Active Beneficiaries",
          value: totalBeneficiaries.toLocaleString(),
          description: "Total active beneficiaries across all groups",
          Icon: Users,
        },
        {
          title: "Main Cash Balance",
          value: formatKes(summary.mainCashBalance),
          description: "Funds available for allocation",
          Icon: BookOpen,
        },
      ]);
      
      setGroups(fetchedGroups);
      // Take the top 5 recent entries (already sorted descending by date in fetchCashbookEntries)
      setRecentActivity(cashbookEntries.slice(0, 5)); 

    } catch (error) {
      toast.error("Failed to load dashboard data.");
      console.error(error);
    } finally {
      setIsLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  if (isLoadingData) {
    // Show a loading state while fetching data
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            Icon={metric.Icon}
          />
        ))}
      </div>

      {/* Recent Activities & Financial Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              The 5 most recent donations and disbursements recorded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityTable data={recentActivity} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Financial Summary</CardTitle>
            <CardDescription>
              Key balances from the Cashbook.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Main Cash Balance:</span>
              <span className="text-sm font-semibold">{metrics.find(m => m.title === "Main Cash Balance")?.value || formatKes(0)}</span>
            </div>
            <Separator />
            {groups.slice(0, 3).map(group => (
              <div key={group.id} className="flex justify-between">
                <span className="text-sm font-medium">{group.name} Balance:</span>
                <span className="text-sm font-semibold">{formatKes(group.currentBalanceKes)}</span>
              </div>
            ))}
            {groups.length > 3 && (
              <div className="text-xs text-muted-foreground">...and {groups.length - 3} more groups</div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Group Balance:</span>
              <span>{formatKes(groups.reduce((sum, g) => sum + g.currentBalanceKes, 0))}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}