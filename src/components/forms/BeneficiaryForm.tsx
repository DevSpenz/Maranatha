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
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/components/auth/SessionContextProvider";
import { fetchGroups } from "@/lib/data/groups";
import { Group, Beneficiary } from "@/types";
import { createBeneficiary, updateBeneficiary } from "@/lib/data/beneficiaries";
import { DatePicker } from "@/components/forms/DatePicker";

// --- Zod Schema Definition ---
const BeneficiarySchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  sponsorNumber: z.string().min(5, { message: "Sponsor number is required." }),
  idNumber: z.string().optional(),
  dateOfBirth: z.date({
    required_error: "Date of birth is required.",
  }),
  phoneNumber: z.string().min(10, { message: "Valid phone number is required." }),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: "Please select a gender." }),
  }),
  guardianName: z.string().min(2, { message: "Guardian name is required." }),
  guardianPhone: z.string().min(10, { message: "Guardian phone number is required." }),
  guardianId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'graduated'], {
    errorMap: () => ({ message: "Please select a status." }),
  }),
  groupId: z.string().min(1, { message: "Group assignment is required." }),
});

type BeneficiaryFormValues = z.infer<typeof BeneficiarySchema>;

interface BeneficiaryFormProps {
    onBeneficiaryCreated: () => void;
    initialData?: Beneficiary;
}

export function BeneficiaryForm({ onBeneficiaryCreated, initialData }: BeneficiaryFormProps) {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  
  const isEditMode = !!initialData;

  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(BeneficiarySchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      sponsorNumber: initialData?.sponsorNumber || "",
      idNumber: initialData?.idNumber || "",
      dateOfBirth: initialData?.dateOfBirth || new Date(),
      phoneNumber: initialData?.phoneNumber || "",
      gender: initialData?.gender,
      guardianName: initialData?.guardianName || "",
      guardianPhone: initialData?.guardianPhone || "",
      guardianId: initialData?.guardianId || "",
      status: initialData?.status || "active",
      groupId: initialData?.groupId,
    },
  });

  useEffect(() => {
    const loadGroups = async () => {
        try {
            const fetchedGroups = await fetchGroups();
            setGroups(fetchedGroups);
        } catch (error) {
            toast.error("Failed to load groups for assignment.");
        } finally {
            setIsGroupsLoading(false);
        }
    };
    loadGroups();
  }, []);

  async function onSubmit(data: BeneficiaryFormValues) {
    if (!user) {
        toast.error("Authentication required to save changes.");
        return;
    }

    setIsSubmitting(true);
    try {
        if (isEditMode && initialData) {
            await updateBeneficiary(initialData.id, {
                ...data,
                dateOfBirth: data.dateOfBirth,
            });
            toast.success(`Beneficiary '${data.fullName}' updated successfully!`);
        } else {
            await createBeneficiary({
                ...data,
                dateOfBirth: data.dateOfBirth,
                user_id: user.id,
            });
            toast.success(`Beneficiary '${data.fullName}' registered successfully!`);
            form.reset({
                fullName: "",
                sponsorNumber: "",
                idNumber: "",
                dateOfBirth: new Date(),
                phoneNumber: "",
                gender: undefined,
                guardianName: "",
                guardianPhone: "",
                guardianId: "",
                status: "active",
                groupId: undefined,
            });
        }
        
        onBeneficiaryCreated();
    } catch (error) {
        console.error(error);
        toast.error(isEditMode ? "Failed to update beneficiary. Check if sponsor number is unique." : "Failed to register beneficiary. Check if sponsor number is unique.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card className={isEditMode ? "border-none shadow-none" : ""}>
      <CardHeader className={isEditMode ? "hidden" : ""}>
        <CardTitle>Register New Beneficiary</CardTitle>
        <CardDescription>
          Capture required details for a new beneficiary.
        </CardDescription>
      </CardHeader>
      <CardContent className={isEditMode ? "p-0" : ""}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            
            {/* --- Beneficiary Details --- */}
            <h3 className="col-span-full text-lg font-semibold mt-2 mb-[-8px]">Beneficiary Information</h3>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sponsorNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sponsor Number</FormLabel>
                  <FormControl>
                    <Input placeholder="SPN-12345" {...field} disabled={isEditMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <DatePicker 
                        date={field.value} 
                        setDate={field.onChange} 
                        placeholder="Select D.O.B"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+254..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- Guardian Details --- */}
            <h3 className="col-span-full text-lg font-semibold mt-4 mb-[-8px]">Parent/Guardian Information</h3>

            <FormField
              control={form.control}
              name="guardianName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent/Guardian Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardianPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent/Guardian Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+254..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardianId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent/Guardian ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="87654321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* --- Status and Group --- */}
            <h3 className="col-span-full text-lg font-semibold mt-4 mb-[-8px]">Assignment & Status</h3>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active (Receives Funds)</SelectItem>
                      <SelectItem value="inactive">Inactive (Paused)</SelectItem>
                      <SelectItem value="graduated">Graduated (Archived)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Group</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isGroupsLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isGroupsLoading ? "Loading groups..." : "Select Group"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map(group => (
                          <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="md:col-span-2 lg:col-span-3 flex items-end justify-end pt-4">
              <Button type="submit" disabled={isSubmitting || isGroupsLoading}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? (isEditMode ? "Saving Changes..." : "Registering...") : (isEditMode ? "Save Changes" : "Save Beneficiary")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}