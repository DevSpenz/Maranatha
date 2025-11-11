"use client";

import { useState, useEffect } from "react";
import { Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BeneficiaryPayment } from "@/types";
import { fetchPaymentById } from "@/lib/data/beneficiary-payments";
import { toast } from "sonner";
import { PaymentVoucher } from "@/components/reports/PaymentVoucher";

interface PaymentVoucherDialogProps {
  paymentId: string;
  trigger?: React.ReactNode;
}

export function PaymentVoucherDialog({ paymentId, trigger }: PaymentVoucherDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<BeneficiaryPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPayment = async () => {
    setIsLoading(true);
    try {
        const data = await fetchPaymentById(paymentId);
        if (data) {
            setPaymentData(data);
        } else {
            toast.error("Could not load payment data.");
        }
    } catch (error) {
        toast.error("Failed to fetch payment data.");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
        loadPayment();
    }
  }, [open, paymentId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
            <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" /> View Voucher
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Voucher Details</DialogTitle>
          <DialogDescription>
            Review and print the official payment voucher for this transaction.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : paymentData ? (
            <PaymentVoucher payment={paymentData} />
        ) : (
            <div className="p-4 text-center text-destructive">
                Error loading payment data.
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}