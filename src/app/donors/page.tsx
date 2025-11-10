import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";
import { DonationForm } from "@/components/forms/DonationForm";
import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "./columns";
import { Donation } from "@/types";

// Mock Data for Donation History
const mockDonations: Donation[] = [
    {
        id: "d1",
        donorName: "Swedish Church Aid",
        sekAmount: 50000,
        exchangeRate: 12.10,
        kesAmount: 50000 * 12.10,
        dateReceived: new Date(2024, 6, 15), // July 15th
        recordedAt: new Date(2024, 6, 16),
    },
    {
        id: "d2",
        donorName: "Private Donor A",
        sekAmount: 10000,
        exchangeRate: 11.95,
        kesAmount: 10000 * 11.95,
        dateReceived: new Date(2024, 5, 20), // June 20th
        recordedAt: new Date(2024, 5, 21),
    },
    {
        id: "d3",
        donorName: "EU Grant Fund",
        sekAmount: 40000,
        exchangeRate: 12.05,
        kesAmount: 40000 * 12.05,
        dateReceived: new Date(2024, 4, 1), // May 1st
        recordedAt: new Date(2024, 4, 2),
    },
];

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

        {/* Donation History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>
              A list of all recorded donations and their corresponding KES value and exchange rate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockDonations} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}