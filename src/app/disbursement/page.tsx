import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DisbursementForm } from "@/components/forms/DisbursementForm";
import { DollarSign, TrendingDown, Users } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";

// Mock Disbursement Summary Data
const mockDisbursementSummary = [
  { title: "Main Cash Balance (KES)", value: "KSh 20,000", Icon: DollarSign, description: "Available for allocation" },
  { title: "Total Disbursed YTD", value: "KSh 950,000", Icon: TrendingDown, description: "Funds moved to groups" },
  { title: "Groups with Zero Balance", value: "2", Icon: Users, description: "Requires immediate allocation" },
];


export default function DisbursementPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Fund Disbursement</h1>
        
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {mockDisbursementSummary.map((summary) => (
            <MetricCard
              key={summary.title}
              title={summary.title}
              value={summary.value}
              description={summary.description}
              Icon={summary.Icon}
            />
          ))}
        </div>

        <Separator />
        
        {/* New Disbursement Form */}
        <DisbursementForm />

        <Separator />

        {/* Disbursement History Table Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Disbursement History</CardTitle>
            <CardDescription>
              A record of all funds allocated from the main account to beneficiary groups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Disbursement History Table Placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}