"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BeneficiaryPaymentForm } from "@/components/forms/BeneficiaryPaymentForm";

interface BeneficiaryPaymentDialogProps {
  onSuccess: () => void;
}

export function BeneficiaryPaymentDialog({ onSuccess }: BeneficiaryPaymentDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <DollarSign className="mr-2 h-4 w-4" /> Initiate Payment Run
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Beneficiary Payment Run</DialogTitle>
          <DialogDescription>
            Distribute funds from a group's balance equally among its active beneficiaries.
          </DialogDescription>
        </DialogHeader>
        <BeneficiaryPaymentForm onPaymentRunCompleted={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}