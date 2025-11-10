import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp } from "lucide-react";

export default function TrialBalancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Trial Balance</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Balances Summary</CardTitle>
          <CardDescription>
            A list of all general ledger accounts and their debit or credit balances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            Trial Balance Report Placeholder
          </div>
        </CardContent>
      </Card>
      
      <Separator />
      
      <Card>
          <CardHeader>
              <CardTitle>Report Options</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-muted-foreground">
                  Date selection and export options placeholder.
              </div>
          </CardContent>
      </Card>
    </div>
  );
}