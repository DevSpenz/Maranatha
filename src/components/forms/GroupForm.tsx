"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Save } from "lucide-react";
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
import { useState } from "react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { createGroup, updateGroup } from "@/lib/data/groups";
import { Group } from "@/types";

// --- Zod Schema Definition ---
const GroupSchema = z.object({
  name: z.string().min(3, { message: "Group name must be at least 3 characters." }),
  description: z.string().max(500).optional(),
  kronaRatio: z.coerce.number().min(0, {
    message: "Krona ratio cannot be negative.",
  }),
});

type GroupFormValues = z.infer<typeof GroupSchema>;

interface GroupFormProps {
    onGroupCreated: () => void;
    initialData?: Group;
}

export function GroupForm({ onGroupCreated, initialData }: GroupFormProps) {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!initialData;

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(GroupSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      kronaRatio: initialData?.kronaRatio || 0,
    },
  });

  async function onSubmit(data: GroupFormValues) {
    if (!user) {
        toast.error("Authentication required to save changes.");
        return;
    }

    setIsSubmitting(true);
    try {
        if (isEditMode && initialData) {
            await updateGroup(initialData.id, {
                name: data.name,
                description: data.description,
                kronaRatio: data.kronaRatio,
            });
            toast.success(`Group '${data.name}' updated successfully!`);
        } else {
            await createGroup({
                name: data.name,
                description: data.description,
                // Note: We set the old disbursementRatio to 0, as it's now superseded by kronaRatio for distribution logic
                disbursementRatio: 0, 
                kronaRatio: data.kronaRatio,
                user_id: user.id,
            });
            toast.success(`Group '${data.name}' created successfully!`);
            form.reset({
                name: "",
                description: "",
                kronaRatio: data.kronaRatio, // Keep rate for convenience
            });
        }
        
        onGroupCreated();
    } catch (error) {
        console.error(error);
        toast.error(isEditMode ? "Failed to update group." : "Failed to create group.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card className={isEditMode ? "border-none shadow-none" : ""}>
      <CardHeader className={isEditMode ? "hidden" : ""}>
        <CardTitle>Create New Group</CardTitle>
        <CardDescription>
          Define a new beneficiary group and set its Krona ratio weight for proportional fund distribution.
        </CardDescription>
      </CardHeader>
      <CardContent className={isEditMode ? "p-0" : ""}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            
            {/* Group Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Primary Education Support" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Krona Ratio */}
            <FormField
              control={form.control}
              name="kronaRatio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Krona Ratio Weight (KR)</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                        <Input 
                            type="number" 
                            step="1" 
                            min="0" 
                            placeholder="e.g., 1000" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                        <span className="ml-2 text-lg font-semibold text-muted-foreground">KR</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of the group's purpose or criteria." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="md:col-span-2 flex items-end justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? (isEditMode ? "Saving Changes..." : "Creating Group...") : (isEditMode ? "Save Changes" : "Save Group")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}