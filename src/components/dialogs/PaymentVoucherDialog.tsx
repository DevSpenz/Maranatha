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
import { generatePaymentVoucherPdf } from "@/lib/data/pdf-generator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentVoucherDialogProps {
  paymentId: string;
  trigger?: React.ReactNode;
}

export function PaymentVoucherDialog({ paymentId, trigger }: PaymentVoucherDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<BeneficiaryPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(12.00); // Default rate

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

  const handleGeneratePdf = async () => {
    if (!paymentData) return;

    setIsGenerating(true);
    try {
        await generatePaymentVoucherPdf(paymentId, exchangeRate);
        setOpen(false);
    } catch (error) {
        // Error handled by utility function
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
            <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" /> View Voucher
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Payment Voucher PDF</DialogTitle>
          <DialogDescription>
            Enter the exchange rate (KR/KES) to be included in the official voucher document.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
            <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : paymentData ? (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="exchangeRate">Exchange Rate (KR/KES)</Label>
                    <Input 
                        id="exchangeRate"
                        type="number" 
                        step="0.01"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 12.50"
                    />
                    <p className="text-sm text-muted-foreground">
                        This rate will be printed on the voucher for reference.
                    </p>
                </div>
                
                <div className="flex justify-end">
                    <Button 
                        onClick={handleGeneratePdf} 
                        disabled={isGenerating || exchangeRate <= 0}
                    >
                        {isGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Printer className="mr-2 h-4 w-4" />
                        )}
                        {isGenerating ? "Generating PDF..." : "Generate & Download PDF"}
                    </Button>
                </div>
            </div>
        ) : (
            <div className="p-4 text-center text-destructive">
                Error loading payment data.
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}