"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BeneficiaryForm } from "@/components/forms/BeneficiaryForm";

interface BeneficiaryFormDialogProps {
  onSuccess: () => void;
}

export function BeneficiaryFormDialog({ onSuccess }: BeneficiaryFormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Register New Beneficiary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Register New Beneficiary</DialogTitle>
          <DialogDescription>
            Capture required details for a new beneficiary and assign them to a group.
          </DialogDescription>
        </DialogHeader>
        <BeneficiaryForm onBeneficiaryCreated={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}