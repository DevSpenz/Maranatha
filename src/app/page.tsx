"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DollarSign, Users, Wallet, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Loader2 } from "lucide-react";

// Mock Data for demonstration
const mockMetrics = [
  {
    title: "Total Funds Received (KES)",
    value: "KSh 1,200,000",
    description: "+20.1% from last month",
    Icon: DollarSign,
  },
  {
    title: "Total Funds Disbursed (KES)",
    value: "KSh 950,000",
    description: "80% of total funds allocated",
    Icon: Wallet,
  },
  {
    title: "Active Beneficiaries",
    value: "150",
    description: "+10 new beneficiaries this quarter",
    Icon: Users,
  },
  {
    title: "Current Exchange Rate (SEK/KES)",
    value: "1 SEK = 12.00 KES",
    description: "Rate recorded on latest donation",
    Icon: TrendingUp,
  },
];

export default function Home() {
  const { isLoading, user } = useAuthGuard();

  if (isLoading || !user) {
    // Show a loading state while checking auth or if redirecting
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        
        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockMetrics.map((metric) => (
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
              <CardTitle>Recent Disbursements</CardTitle>
              <CardDescription>
                Latest fund allocations to groups and beneficiaries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                {/* Placeholder for a table or list of recent transactions */}
                Recent transaction list placeholder
              </div>
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
                <span className="text-sm font-semibold">KSh 20,000</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-medium">Group A Balance:</span>
                <span className="text-sm font-semibold">KSh 0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Group B Balance:</span>
                <span className="text-sm font-semibold">KSh 0</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total System Balance:</span>
                <span>KSh 20,000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}