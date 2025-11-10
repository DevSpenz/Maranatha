"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
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

interface GroupFormDialogProps {
  onSuccess: () => void;
}

export function GroupFormDialog({ onSuccess }: GroupFormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Define a new beneficiary group and set its default disbursement ratio (0-100%).
          </DialogDescription>
        </DialogHeader>
        <GroupForm onGroupCreated={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}