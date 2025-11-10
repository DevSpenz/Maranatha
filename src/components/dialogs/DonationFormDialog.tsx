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
import { DonationForm } from "@/components/forms/DonationForm";

interface DonationFormDialogProps {
  onSuccess: () => void;
}

export function DonationFormDialog({ onSuccess }: DonationFormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Record New Donation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Record New Donation</DialogTitle>
          <DialogDescription>
            Enter the details of the donation received in Swedish Krona (KR) and the exchange rate to KES.
          </DialogDescription>
        </DialogHeader>
        <DonationForm onDonationCreated={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}