import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";
import { DonationForm } from "@/components/forms/DonationForm";

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
        <DonationForm />

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