"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Beneficiary } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, ArrowUpDown, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog";
import { useState } from "react";
import { deleteBeneficiary } from "@/lib/data/beneficiaries";
import { toast } from "sonner";
import Link from "next/link";
import { BeneficiaryEditDialog } from "@/components/dialogs/BeneficiaryEditDialog"; // Import Edit Dialog

interface BeneficiaryActionsProps {
    beneficiary: Beneficiary;
    onBeneficiaryDeleted: () => void;
    onBeneficiaryUpdated: () => void; // New prop for refresh
}

const BeneficiaryActions = ({ beneficiary, onBeneficiaryDeleted, onBeneficiaryUpdated }: BeneficiaryActionsProps) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteBeneficiary(beneficiary.id);
            toast.success(`Beneficiary '${beneficiary.fullName}' deleted successfully.`);
            onBeneficiaryDeleted();
        } catch (error) {
            toast.error("Failed to delete beneficiary.");
            throw error;
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    
                    <DropdownMenuItem asChild>
                        <Link href={`/beneficiaries/${beneficiary.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View Profile
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(beneficiary.id)}>
                        Copy Beneficiary ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    
                    <BeneficiaryEditDialog 
                        beneficiaryId={beneficiary.id} 
                        onSuccess={onBeneficiaryUpdated}
                        trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </DropdownMenuItem>
                        }
                    />

                    <DropdownMenuItem 
                        className="flex items-center text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Beneficiary
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title={`Remove Beneficiary: ${beneficiary.fullName}?`}
                description={`Are you sure you want to permanently remove '${beneficiary.fullName}'? This action cannot be undone.`}
                confirmText="Yes, Remove Beneficiary"
                onConfirm={handleDelete}
            />
        </>
    );
};


// Define a function that returns the columns, accepting the group map and delete callback
// NOTE: The groupMap parameter is now unused but kept for compatibility with the DataTable structure if needed elsewhere.
export const columns = (groupMap: Record<string, string>, onBeneficiaryUpdated: () => void): ColumnDef<Beneficiary>[] => [
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("fullName")}</div>,
  },
  {
    accessorKey: "sponsorNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sponsor No.
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "groupName", // Use groupName directly
    header: "Assigned Group",
    cell: ({ row }) => {
        return <div className="text-sm text-muted-foreground">{row.original.groupName || "N/A"}</div>;
    }
  },
  {
    accessorKey: "dateOfBirth",
    header: "D.O.B",
    cell: ({ row }) => {
      const date = row.getValue("dateOfBirth") as Date;
      return <div>{format(date, "MMM dd, yyyy")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Beneficiary['status'];
      
      // Custom classes for status visualization
      const statusClasses = {
        active: "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-900/80",
        inactive: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-900/80",
        graduated: "bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/80",
      };

      return (
        <Badge variant="outline" className={cn("capitalize border-none", statusClasses[status])}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <BeneficiaryActions beneficiary={row.original} onBeneficiaryDeleted={onBeneficiaryUpdated} onBeneficiaryUpdated={onBeneficiaryUpdated} />;
    },
  },
];