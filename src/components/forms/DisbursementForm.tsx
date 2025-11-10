"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Send } from "lucide-react";
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
import { createDisbursement } from "@/lib/data/disbursements";

// --- Zod Schema Definition ---
const DisbursementSchema = z.object({
  groupId: z.string().min(1, { message: "Please select a group." }),
  amountKes: z.coerce.number().min(1, {
    message: "Amount must be greater than zero.",
  }),
  notes: z.string().max(250).optional(),
});

type DisbursementFormValues = z.infer<typeof DisbursementSchema>;

interface DisbursementFormProps {
    onDisbursementCreated: () => void;
}

export function DisbursementForm({ onDisbursementCreated }: DisbursementFormProps) {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);

  const form = useForm<DisbursementFormValues>({
    resolver: zodResolver(DisbursementSchema),
    defaultValues: {
      groupId: undefined,
      amountKes: 0,
      notes: "",
    },
  });

  useEffect(() => {
    const loadGroups = async () => {
        try {
            const fetchedGroups = await fetchGroups();
            setGroups(fetchedGroups);
        } catch (error) {
            toast.error("Failed to load groups for disbursement.");
        } finally {
            setIsGroupsLoading(false);
        }
    };
    loadGroups();
  }, []);

  async function onSubmit(data: DisbursementFormValues) {
    if (!user) {
        toast.error("Authentication required to record a disbursement.");
        return;
    }

    setIsSubmitting(true);
    try {
        // Find the group name for the recorded_by field (using user's email for now)
        const recordedBy = user.email || 'Unknown User';

        await createDisbursement({
            groupId: data.groupId,
            amountKes: data.amountKes,
            notes: data.notes,
            user_id: user.id,
            recordedBy: recordedBy,
        });
        
        toast.success(`KSh ${data.amountKes.toLocaleString()} disbursed successfully! Group balance updated.`);
        form.reset({
            groupId: undefined,
            amountKes: 0,
            notes: "",
        });
        onDisbursementCreated();
    } catch (error) {
        console.error(error);
        toast.error("Failed to record disbursement or update group balance.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Fund Disbursement</CardTitle>
        <CardDescription>
          Allocate funds from the main cash balance to a specific beneficiary group.
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
                        <SelectValue placeholder={isGroupsLoading ? "Loading groups..." : "Select Group to receive funds"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map(group => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name} (Balance: KSh {group.currentBalanceKes.toLocaleString()})
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount KES */}
            <FormField
              control={form.control}
              name="amountKes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (KES)</FormLabel>
                  <FormControl>
                    <Input 
                        type="number" 
                        step="100" 
                        placeholder="e.g., 50000" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Reason for disbursement, e.g., 'Monthly allocation for Q3 2024'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="md:col-span-2 flex items-end justify-end pt-4">
              <Button type="submit" disabled={isSubmitting || isGroupsLoading}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Recording..." : "Record Disbursement"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}