"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useEffect } from "react";

// --- Zod Schema Definition ---
const DonationSchema = z.object({
  donorName: z.string().min(2, {
    message: "Donor name must be at least 2 characters.",
  }),
  sekAmount: z.coerce.number().min(1, {
    message: "Amount must be greater than zero.",
  }),
  exchangeRate: z.coerce.number().min(1, {
    message: "Exchange rate must be greater than zero.",
  }),
  dateReceived: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Invalid date format.",
  }),
});

type DonationFormValues = z.infer<typeof DonationSchema>;

// Mock submission function
const mockSubmitDonation = async (data: DonationFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    const kesAmount = data.sekAmount * data.exchangeRate;
    console.log("Donation Recorded:", { ...data, kesAmount });
    return { success: true, kesAmount };
};


export function DonationForm() {
  const [kesAmount, setKesAmount] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(DonationSchema),
    defaultValues: {
      donorName: "",
      sekAmount: 0,
      exchangeRate: 12.00, // Default rate placeholder
      dateReceived: new Date().toISOString().split('T')[0],
    },
  });

  const sekAmount = form.watch("sekAmount");
  const exchangeRate = form.watch("exchangeRate");

  // Calculate KES amount whenever SEK amount or rate changes
  useEffect(() => {
    if (sekAmount > 0 && exchangeRate > 0) {
      setKesAmount(sekAmount * exchangeRate);
    } else {
      setKesAmount(null);
    }
  }, [sekAmount, exchangeRate]);


  async function onSubmit(data: DonationFormValues) {
    setIsSubmitting(true);
    try {
        const result = await mockSubmitDonation(data);
        toast.success(`Donation of KSh ${result.kesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} recorded successfully!`);
        form.reset({
            donorName: "",
            sekAmount: 0,
            exchangeRate: data.exchangeRate, // Keep rate for convenience
            dateReceived: new Date().toISOString().split('T')[0],
        });
    } catch (error) {
        toast.error("Failed to record donation.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record New Donation</CardTitle>
        <CardDescription>
          Enter the details of the donation received in Swedish Krona (KR) and the exchange rate to KES.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Donor Name */}
            <FormField
              control={form.control}
              name="donorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Swedish Aid" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SEK Amount */}
            <FormField
              control={form.control}
              name="sekAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (KR)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Exchange Rate */}
            <FormField
              control={form.control}
              name="exchangeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exchange Rate (1 KR = X KES)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 12.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Received */}
            <FormField
              control={form.control}
              name="dateReceived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Received</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Calculated KES Amount Display */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <div className="text-lg font-semibold text-primary">
                    KES Equivalent: {kesAmount !== null ? `KSh ${kesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Enter amounts'}
                </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 lg:col-span-3 flex items-end justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Recording..." : "Save Donation"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}