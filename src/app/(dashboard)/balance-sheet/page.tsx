import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Scale } from "lucide-react";

export default function BalanceSheetPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
          <Scale className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Statement of Financial Position</CardTitle>
          <CardDescription>
            Summary of the organization's assets, liabilities, and equity at a specific point in time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            Balance Sheet Report Placeholder
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