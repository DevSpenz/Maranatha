"use client";

import { useState, useEffect } from "react";
import { Edit, Loader2 } from "lucide-react";
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
import { Beneficiary } from "@/types";
import { fetchBeneficiaryById } from "@/lib/data/beneficiaries";
import { toast } from "sonner";

interface BeneficiaryEditDialogProps {
  beneficiaryId: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function BeneficiaryEditDialog({ beneficiaryId, onSuccess, trigger }: BeneficiaryEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [initialData, setInitialData] = useState<Beneficiary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBeneficiary = async () => {
    setIsLoading(true);
    try {
        const data = await fetchBeneficiaryById(beneficiaryId);
        if (data) {
            setInitialData(data);
        } else {
            toast.error("Could not load beneficiary data for editing.");
        }
    } catch (error) {
        toast.error("Failed to fetch beneficiary data.");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
        loadBeneficiary();
    }
  }, [open, beneficiaryId]);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
            <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Edit Beneficiary Profile</DialogTitle>
          <DialogDescription>
            Update the details and assignment for {initialData?.fullName || 'this beneficiary'}.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : initialData ? (
            <BeneficiaryForm 
                initialData={initialData} 
                onBeneficiaryCreated={handleSuccess} 
            />
        ) : (
            <div className="p-4 text-center text-destructive">
                Error loading beneficiary data.
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}