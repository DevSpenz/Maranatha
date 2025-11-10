"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Percent, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "@/app/groups/columns";
import { Group } from "@/types";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useState, useEffect, useCallback } from "react";
import { fetchGroups } from "@/lib/data/groups";
import { toast } from "sonner";
import { GroupFormDialog } from "@/components/dialogs/GroupFormDialog";

// Initial state for summary cards while loading
const initialGroupSummary = [
  { title: "Total Groups", value: "...", Icon: Users, description: "Currently active groups" },
  { title: "Total Group Funds (KES)", value: "...", Icon: DollarSign, description: "Funds available for disbursement" },
  { title: "Average Disbursement Ratio", value: "...", Icon: Percent, description: "Average ratio across all groups" },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(initialGroupSummary);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedGroups = await fetchGroups();
      setGroups(fetchedGroups);
      
      // Calculate summary metrics
      const totalBalance = fetchedGroups.reduce((sum, g) => sum + g.currentBalanceKes, 0);
      const totalRatio = fetchedGroups.reduce((sum, g) => sum + g.disbursementRatio, 0);
      const avgRatio = fetchedGroups.length > 0 ? (totalRatio / fetchedGroups.length).toFixed(0) : '0';

      setSummary([
        { ...initialGroupSummary[0], value: fetchedGroups.length.toString() },
        { 
            ...initialGroupSummary[1], 
            value: `KSh ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` 
        },
        { ...initialGroupSummary[2], value: `${avgRatio}%` },
      ]);

    } catch (error) {
      toast.error("Failed to load group data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Group Management</h1>
        <GroupFormDialog onSuccess={loadGroups} />
      </div>

      {/* Group Summary Cards */}
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
      
      {/* Group List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Groups</CardTitle>
          <CardDescription>
            Manage group ratios, beneficiaries, and view balances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
              <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          ) : (
              <DataTable columns={columns(loadGroups)} data={groups} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}