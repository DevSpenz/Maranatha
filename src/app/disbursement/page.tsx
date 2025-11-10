import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DisbursementForm } from "@/components/forms/DisbursementForm";
import { DollarSign, TrendingDown, Users } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "./columns";
import { Disbursement } from "@/types";

// Mock Disbursement Summary Data
const mockDisbursementSummary = [
  { title: "Main Cash Balance (KES)", value: "KSh 20,000", Icon: DollarSign, description: "Available for allocation" },
  { title: "Total Disbursed YTD", value: "KSh 950,000", Icon: TrendingDown, description: "Funds moved to groups" },
  { title: "Groups with Zero Balance", value: "2", Icon: Users, description: "Requires immediate allocation" },
];

// Mock Disbursement History Data
const mockDisbursements: Disbursement[] = [
    {
        id: "disp1",
        groupId: "g1",
        groupName: "Primary Education Support",
        amountKes: 100000,
        notes: "Q3 2024 initial allocation.",
        dateDisbursed: new Date(2024, 6, 10),
        recordedBy: "Admin User",
    },
    {
        id: "disp2",
        groupId: "g2",
        groupName: "Vocational Training",
        amountKes: 50000,
        notes: "Monthly stipend for July.",
        dateDisbursed: new Date(2024, 6, 10),
        recordedBy: "Admin User",
    },
    {
        id: "disp3",
        groupId: "g1",
        groupName: "Primary Education Support",
        amountKes: 20000,
        notes: "Emergency school supplies purchase.",
        dateDisbursed: new Date(2024, 6, 25),
        recordedBy: "Finance Officer",
    },
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

        {/* Disbursement History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Disbursement History</CardTitle>
            <CardDescription>
              A record of all funds allocated from the main account to beneficiary groups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockDisbursements} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}