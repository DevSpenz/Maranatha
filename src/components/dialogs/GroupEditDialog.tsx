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
import { GroupForm } from "@/components/forms/GroupForm";
import { Group } from "@/types";
import { fetchGroupById } from "@/lib/data/groups";
import { toast } from "sonner";

interface GroupEditDialogProps {
  groupId: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function GroupEditDialog({ groupId, onSuccess, trigger }: GroupEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [initialData, setInitialData] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGroup = async () => {
    setIsLoading(true);
    try {
        const data = await fetchGroupById(groupId);
        if (data) {
            setInitialData(data);
        } else {
            toast.error("Could not load group data for editing.");
        }
    } catch (error) {
        toast.error("Failed to fetch group data.");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
        loadGroup();
    }
  }, [open, groupId]);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
            <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit Group
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Group Details</DialogTitle>
          <DialogDescription>
            Update the name, description, or Krona Ratio weight for this group.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : initialData ? (
            <GroupForm 
                initialData={initialData} 
                onGroupCreated={handleSuccess} 
            />
        ) : (
            <div className="p-4 text-center text-destructive">
                Error loading group data.
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}