"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog";
import { toast } from "sonner";
import { resetAllData } from "@/app/actions";
import { useRouter } from "next/navigation";

export function DataResetButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    const result = await resetAllData();
    
    if (result.success) {
      toast.success("Database reset complete!", {
        description: "All application data has been cleared.",
      });
      // Force a full page refresh to reload all dashboard data
      router.refresh(); 
    } else {
      toast.error("Data Reset Failed", {
        description: result.message,
      });
      throw new Error(result.message); // Re-throw to keep dialog loading state
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        onClick={() => setIsDialogOpen(true)}
        className="w-full justify-start"
      >
        <Trash2 className="mr-2 h-4 w-4" /> Reset All Data
      </Button>

      <ConfirmationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="DANGER: Confirm Data Reset"
        description={
          <div className="space-y-2">
            <p>
              <AlertTriangle className="inline h-5 w-5 text-destructive mr-2" /> 
              Are you absolutely sure you want to reset ALL application data?
            </p>
            <p className="font-semibold text-sm">
              This action will permanently delete all Donations, Disbursements, Groups, and Beneficiaries. Your user account will remain.
            </p>
          </div>
        }
        confirmText="Yes, Delete Everything"
        onConfirm={handleReset}
      />
    </>
  );
}