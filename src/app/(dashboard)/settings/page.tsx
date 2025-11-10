import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { DataResetButton } from "@/components/admin/DataResetButton";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      </div>
      
      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-destructive/50">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                    Administrative actions that permanently affect the database. Use with caution.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DataResetButton />
            </CardContent>
        </Card>
        
        {/* Placeholder for other settings */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                    Future configuration options will appear here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">No general settings configured yet.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}