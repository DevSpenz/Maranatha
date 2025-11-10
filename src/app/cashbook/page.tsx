import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, BookOpen, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";

// Mock Cashbook Summary Data
const mockCashbookSummary = [
  { title: "Total Cash In (YTD)", value: "KSh 1,200,000", Icon: DollarSign, description: "Total donations received" },
  { title: "Total Cash Out (YTD)", value: "KSh 950,000", Icon: TrendingUp, description: "Total funds disbursed" },
  { title: "Current Cash Balance", value: "KSh 250,000", Icon: BookOpen, description: "Main account balance" },
];

export default function CashbookPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Cashbook & Ledger</h1>
        
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {mockCashbookSummary.map((summary) => (
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
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Cashbook Table/View Placeholder
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ledger" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>General Ledger</CardTitle>
                <CardDescription>
                  View transactions grouped by account (e.g., Donations, Group A Funds, Main Cash).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  General Ledger View Placeholder
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}