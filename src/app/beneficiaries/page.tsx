import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";
import { BeneficiaryForm } from "@/components/forms/BeneficiaryForm";

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

        {/* Beneficiary List Table Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Beneficiaries</CardTitle>
            <CardDescription>
              Filter and manage the status of all beneficiaries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Beneficiary List Table Placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}