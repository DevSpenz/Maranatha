import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";
import { BeneficiaryForm } from "@/components/forms/BeneficiaryForm";
import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "./columns";
import { Beneficiary } from "@/types";

// Mock Data for Beneficiaries
const mockBeneficiaries: Beneficiary[] = [
    {
        id: "b1",
        sponsorNumber: "SPN-001",
        fullName: "Aisha Mohamed",
        idNumber: "30123456",
        dateOfBirth: new Date(2010, 1, 15),
        phoneNumber: "0712345678",
        gender: 'female',
        guardianName: "Fatuma Mohamed",
        guardianPhone: "0720000000",
        guardianId: "12345678",
        status: 'active',
        groupId: "g1", // Primary Education Support
    },
    {
        id: "b2",
        sponsorNumber: "SPN-002",
        fullName: "David Ochieng",
        idNumber: "31987654",
        dateOfBirth: new Date(2005, 8, 22),
        phoneNumber: "0734567890",
        gender: 'male',
        guardianName: "Peter Ochieng",
        guardianPhone: "0721111111",
        guardianId: "87654321",
        status: 'active',
        groupId: "g2", // Vocational Training
    },
    {
        id: "b3",
        sponsorNumber: "SPN-003",
        fullName: "Grace Wanjiku",
        idNumber: "32001122",
        dateOfBirth: new Date(2000, 3, 10),
        phoneNumber: "0745678901",
        gender: 'female',
        guardianName: "Mary Wanjiku",
        guardianPhone: "0722222222",
        guardianId: "99887766",
        status: 'graduated',
        groupId: "g2", // Vocational Training
    },
];

export default function BeneficiariesPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Beneficiary Management</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Register New Beneficiary
          </Button>
        </div>

        {/* New Beneficiary Registration Form Card */}
        <BeneficiaryForm />

        <Separator />

        {/* Beneficiary List Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Beneficiaries</CardTitle>
            <CardDescription>
              Filter and manage the status of all beneficiaries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockBeneficiaries} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}