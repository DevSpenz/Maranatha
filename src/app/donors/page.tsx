import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";

export default function DonorsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Donor Management</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Record New Donation
          </Button>
        </div>

        {/* New Donation Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Record New Donation</CardTitle>
            <CardDescription>
              Enter the details of the donation received in Swedish Krona (KR) and the exchange rate to KES.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="donorName">Donor Name</Label>
                <Input id="donorName" placeholder="e.g., Swedish Aid" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sekAmount">Amount (KR)</Label>
                <Input id="sekAmount" type="number" placeholder="e.g., 10000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchangeRate">Exchange Rate (1 KR = X KES)</Label>
                <Input id="exchangeRate" type="number" step="0.01" placeholder="e.g., 12.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date Received</Label>
                <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2 md:col-span-2 lg:col-span-3 flex items-end justify-end">
                <Button type="submit">Save Donation</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Donation History Table Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>
              A list of all recorded donations and their corresponding KES value and exchange rate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Donation History Table Placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}