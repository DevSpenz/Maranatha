import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, DollarSign, Percent } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { GroupForm } from "@/components/forms/GroupForm";

// Mock Group Summary Data
const mockGroupSummary = [
  { title: "Total Groups", value: "5", Icon: Users, description: "Currently active groups" },
  { title: "Total Group Funds (KES)", value: "KSh 0", Icon: DollarSign, description: "Funds available for disbursement" },
  { title: "Average Disbursement Ratio", value: "20%", Icon: Percent, description: "Average ratio across all groups" },
];

interface GroupSummaryCardProps {
  title: string;
  value: string;
  description: string;
  Icon: React.ElementType;
}

const GroupSummaryCard: React.FC<GroupSummaryCardProps> = ({ title, value, description, Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);


export default function GroupsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Group Management</h1>
          {/* Removed 'Create New Group' button since the form is displayed below */}
        </div>

        {/* Group Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {mockGroupSummary.map((summary) => (
            <GroupSummaryCard
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

        {/* Group List Table Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Active Groups</CardTitle>
            <CardDescription>
              Manage group ratios, beneficiaries, and view balances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Group List Table Placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}