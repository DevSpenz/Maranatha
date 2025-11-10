"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DisbursementForm } from "@/components/forms/DisbursementForm";
import { ProportionalDisbursementForm } from "@/components/forms/ProportionalDisbursementForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DisbursementFormDialogProps {
  onSuccess: () => void;
}

export function DisbursementFormDialog({ onSuccess }: DisbursementFormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" /> Record New Disbursement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Record Fund Disbursement</DialogTitle>
          <DialogDescription>
            Choose how to allocate funds from the main cash balance to beneficiary groups.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="proportional" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="proportional">Proportional Distribution</TabsTrigger>
                <TabsTrigger value="manual">Manual Allocation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="proportional" className="mt-4">
                <ProportionalDisbursementForm onDisbursementCreated={handleSuccess} />
            </TabsContent>
            
            <TabsContent value="manual" className="mt-4">
                <DisbursementForm onDisbursementCreated={handleSuccess} />
            </TabsContent>
        </Tabs>

      </DialogContent>
    </Dialog>
  );
}