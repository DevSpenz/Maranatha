import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Percent } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { GroupForm } from "@/components/forms/GroupForm";
import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "./columns";
import { Group } from "@/types";
import { MetricCard } from "@/components/dashboard/MetricCard"; // Reusing MetricCard for consistency

// Mock Group Summary Data
const mockGroupSummary = [
  { title: "Total Groups", value: "5", Icon: Users, description: "Currently active groups" },
  { title: "Total Group Funds (KES)", value: "KSh 16,500", Icon: DollarSign, description: "Funds available for disbursement" },
  { title: "Average Disbursement Ratio", value: "20%", Icon: Percent, description: "Average ratio across all groups" },
];

// Mock Group Data for the table
const mockGroups: Group[] = [
    {
        id: "g1",
        name: "Primary Education Support",
        description: "Funds allocated for school fees and basic supplies for primary students.",
        disbursementRatio: 20,
        currentBalanceKes: 10000,
        beneficiaryCount: 50,
    },
    {
        id: "g2",
        name: "Vocational Training",
        description: "Funds for skill development and apprenticeship programs.",
        disbursementRatio: 30,
        currentBalanceKes: 5000,
        beneficiaryCount: 25,
    },
    {
        id: "g3",
        name: "Medical Aid",
        description: "Emergency medical support and health checkups.",
        disbursementRatio: 15,
        currentBalanceKes: 1500,
        beneficiaryCount: 10,
    },
    {
        id: "g4",
        name: "General Overhead",
        description: "Administrative costs and operational expenses.",
        disbursementRatio: 5,
        currentBalanceKes: 0,
        beneficiaryCount: 0,
    },
    {
        id: "g5",
        name: "Emergency Relief",
        description: "Funds reserved for unforeseen crises.",
        disbursementRatio: 30,
        currentBalanceKes: 0,
        beneficiaryCount: 0,
    },
];


export default function GroupsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Group Management</h1>
        </div>

        {/* Group Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {mockGroupSummary.map((summary) => (
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
        
        {/* New Group Creation Form */}
        <GroupForm />

        <Separator />

        {/* Group List Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Groups</CardTitle>
            <CardDescription>
              Manage group ratios, beneficiaries, and view balances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockGroups} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}