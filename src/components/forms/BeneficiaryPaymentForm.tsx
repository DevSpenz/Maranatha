"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/components/auth/SessionContextProvider";
import { fetchGroups } from "@/lib/data/groups";
import { Group } from "@/types";
import { createEqualSplitPaymentRun } from "@/lib/data/beneficiary-payments";
import { formatKes } from "@/lib/utils";

// --- Zod Schema Definition ---
const PaymentRunSchema = z.object({
  groupId: z.string().min(1, { message: "Please select a group." }),
  totalAmountKes: z.coerce.number().min(1, {
    message: "Total amount must be greater than zero.",
  }),
  notes: z.string().max(250).optional(),
});

type PaymentRunFormValues = z.infer<typeof PaymentRunSchema>;

interface BeneficiaryPaymentFormProps {
    onPaymentRunCompleted: () => void;
}

export function BeneficiaryPaymentForm({ onPaymentRunCompleted }: BeneficiaryPaymentFormProps) {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [amountPerBeneficiary, setAmountPerBeneficiary] = useState<number | null>(null);

  const form = useForm<PaymentRunFormValues>({
    resolver: zodResolver(PaymentRunSchema),
    defaultValues: {
      groupId: undefined,
      totalAmountKes: 0,
      notes: "",
    },
  });

  useEffect(() => {
    const loadGroups = async () => {
        try {
            const fetchedGroups = await fetchGroups();
            setGroups(fetchedGroups);
        } catch (error) {
            toast.error("Failed to load groups for payment run.");
        } finally {
            setIsGroupsLoading(false);
        }
    };
    loadGroups();
  }, []);

  const totalAmountKes = form.watch("totalAmountKes");
  const groupId = form.watch("groupId");

  // Update selected group and calculate split amount
  useEffect(() => {
    const group = groups.find(g => g.id === groupId) || null;
    setSelectedGroup(group);

    if (group && group.beneficiaryCount > 0 && totalAmountKes > 0) {
        const splitAmount = Math.floor(totalAmountKes / group.beneficiaryCount);
        setAmountPerBeneficiary(splitAmount);
    } else {
        setAmountPerBeneficiary(null);
    }
  }, [groupId, totalAmountKes, groups]);


  async function onSubmit(data: PaymentRunFormValues) {
    if (!user) {
        toast.error("Authentication required to initiate a payment run.");
        return;
    }
    if (!selectedGroup) {
        toast.error("Please select a valid group.");
        return;
    }
    if (selectedGroup.beneficiaryCount === 0) {
        toast.error(`Group '${selectedGroup.name}' has no active beneficiaries.`);
        return;
    }
    if (data.totalAmountKes > selectedGroup.currentBalanceKes) {
        toast.error(`Insufficient funds. Group balance is ${formatKes(selectedGroup.currentBalanceKes)}.`);
        return;
    }
    if (amountPerBeneficiary === null || amountPerBeneficiary <= 0) {
        toast.error("The total amount is too small to distribute equally.");
        return;
    }

    setIsSubmitting(true);
    try {
        const result = await createEqualSplitPaymentRun({
            groupId: data.groupId,
            totalAmountKes: data.totalAmountKes,
            notes: data.notes,
            user_id: user.id,
        });
        
        toast.success(`Payment run completed! ${result.paymentsCount} beneficiaries paid ${formatKes(result.totalPaid)} in total.`);
        form.reset({
            groupId: undefined,
            totalAmountKes: 0,
            notes: "",
        });
        onPaymentRunCompleted();
    } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to initiate payment run.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initiate Beneficiary Payment Run</CardTitle>
        <CardDescription>
          Select a group and a total amount to be split equally among all active beneficiaries in that group.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            
            {/* Group Selection */}
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Group</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGroupsLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isGroupsLoading ? "Loading groups..." : "Select Group to pay"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map(group => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name} (Active: {group.beneficiaryCount}, Balance: {formatKes(group.currentBalanceKes)})
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Amount KES */}
            <FormField
              control={form.control}
              name="totalAmountKes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount to Split (KES)</FormLabel>
                  <FormControl>
                    <Input 
                        type="number" 
                        step="100" 
                        placeholder="e.g., 50000" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        disabled={!selectedGroup}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Preview */}
            <div className="md:col-span-2 space-y-2 pt-2">
                <h4 className="text-lg font-semibold">Payment Preview</h4>
                <div className="grid grid-cols-2 gap-4 p-3 border rounded-md bg-muted/50">
                    <div>
                        <p className="text-sm text-muted-foreground">Active Beneficiaries:</p>
                        <p className="font-bold text-lg">{selectedGroup?.beneficiaryCount.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Amount Per Beneficiary:</p>
                        <p className="font-bold text-lg text-primary">
                            {amountPerBeneficiary !== null && amountPerBeneficiary > 0 ? formatKes(amountPerBeneficiary) : 'N/A'}
                        </p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Group Balance Check:</p>
                        <p className={`font-bold text-sm ${selectedGroup && totalAmountKes > selectedGroup.currentBalanceKes ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                            {selectedGroup ? `Current Balance: ${formatKes(selectedGroup.currentBalanceKes)}` : 'Select a group'}
                        </p>
                    </div>
                </div>
            </div>


            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Details about the payment run, e.g., 'Monthly stipend for July'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="md:col-span-2 flex items-end justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || isGroupsLoading || !selectedGroup || totalAmountKes <= 0 || totalAmountKes > (selectedGroup?.currentBalanceKes || 0) || (amountPerBeneficiary !== null && amountPerBeneficiary <= 0)}
              >
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <DollarSign className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Processing Payments..." : "Initiate Payment Run"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}