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
import { useSession } from "@/components/auth/SessionContextProvider";
import { fetchGroups } from "@/lib/data/groups";
import { Group } from "@/types";
import { createProportionalDisbursement } from "@/lib/data/disbursements";
import { formatKes } from "@/lib/utils";

// --- Zod Schema Definition ---
const ProportionalDisbursementSchema = z.object({
  totalAmountKes: z.coerce.number().min(1, {
    message: "Amount must be greater than zero.",
  }),
  notes: z.string().max(250).optional(),
});

type ProportionalDisbursementFormValues = z.infer<typeof ProportionalDisbursementSchema>;

interface ProportionalDisbursementFormProps {
    onDisbursementCreated: () => void;
}

export function ProportionalDisbursementForm({ onDisbursementCreated }: ProportionalDisbursementFormProps) {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [totalKronaRatio, setTotalKronaRatio] = useState(0);

  const form = useForm<ProportionalDisbursementFormValues>({
    resolver: zodResolver(ProportionalDisbursementSchema),
    defaultValues: {
      totalAmountKes: 0,
      notes: "",
    },
  });

  useEffect(() => {
    const loadGroups = async () => {
        try {
            const fetchedGroups = await fetchGroups();
            setGroups(fetchedGroups);
            const totalRatio = fetchedGroups.reduce((sum, g) => sum + g.kronaRatio, 0);
            setTotalKronaRatio(totalRatio);
        } catch (error) {
            toast.error("Failed to load groups for proportional disbursement.");
        } finally {
            setIsGroupsLoading(false);
        }
    };
    loadGroups();
  }, []);

  const totalAmountKes = form.watch("totalAmountKes");

  async function onSubmit(data: ProportionalDisbursementFormValues) {
    if (!user) {
        toast.error("Authentication required to record a disbursement.");
        return;
    }
    if (totalKronaRatio <= 0) {
        toast.error("Cannot disburse: Total Krona Ratio across all groups is zero.");
        return;
    }

    setIsSubmitting(true);
    try {
        const recordedBy = user.email || 'Unknown User';

        const result = await createProportionalDisbursement({
            totalAmountKes: data.totalAmountKes,
            notes: data.notes,
            user_id: user.id,
            recordedBy: recordedBy,
        });
        
        toast.success(`${formatKes(result.totalDisbursed)} proportionally disbursed to ${groups.length} groups!`);
        form.reset({
            totalAmountKes: 0,
            notes: "",
        });
        onDisbursementCreated();
    } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to record proportional disbursement.");
    } finally {
        setIsSubmitting(false);
    }
  }

  const getGroupShare = (group: Group) => {
    if (totalKronaRatio === 0 || totalAmountKes === 0) return formatKes(0);
    const proportion = group.kronaRatio / totalKronaRatio;
    const share = totalAmountKes * proportion;
    return formatKes(Math.floor(share));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proportional Fund Disbursement</CardTitle>
        <CardDescription>
          Allocate a total KES amount to all groups based on their defined Krona Ratio weights.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            
            {/* Total Amount KES */}
            <FormField
              control={form.control}
              name="totalAmountKes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount to Disburse (KES)</FormLabel>
                  <FormControl>
                    <Input 
                        type="number" 
                        step="100" 
                        placeholder="e.g., 100000" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Total Ratio Display */}
            <div className="space-y-2">
                <FormLabel>Total Krona Ratio</FormLabel>
                <div className="p-2 border rounded-md bg-muted/50 h-10 flex items-center">
                    <span className="font-semibold">{totalKronaRatio.toLocaleString()} KR</span>
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
                    <Textarea placeholder="Reason for proportional allocation." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Distribution Preview */}
            <div className="md:col-span-2 space-y-3 pt-4">
                <h4 className="text-lg font-semibold">Distribution Preview (Estimated)</h4>
                {isGroupsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading groups...</p>
                ) : totalKronaRatio === 0 ? (
                    <p className="text-sm text-destructive">No groups have a Krona Ratio set. Cannot distribute.</p>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                        {groups.map(group => (
                            <div key={group.id} className="flex justify-between text-sm">
                                <span className="font-medium">{group.name} ({group.kronaRatio} KR)</span>
                                <span className="font-mono font-semibold">{getGroupShare(group)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex items-end justify-end pt-4">
              <Button type="submit" disabled={isSubmitting || isGroupsLoading || totalKronaRatio === 0 || totalAmountKes <= 0}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Distributing..." : "Distribute Funds Proportionally"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}