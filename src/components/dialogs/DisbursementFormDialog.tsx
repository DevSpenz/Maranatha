"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DisbursementForm } from "@/components/forms/DisbursementForm";

interface DisbursementFormDialogProps {
  onSuccess: () => void;
}

export function DisbursementFormDialog({ onSuccess }: DisbursementFormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" /> Record New Disbursement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Record Fund Disbursement</DialogTitle>
          <DialogDescription>
            Allocate funds from the main cash balance to a specific beneficiary group.
          </DialogDescription>
        </DialogHeader>
        <DisbursementForm onDisbursementCreated={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}