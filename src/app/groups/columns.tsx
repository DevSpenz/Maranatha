"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Group } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog";
import { useState } from "react";
import { deleteGroup } from "@/lib/data/groups";
import { toast } from "sonner";

interface GroupActionsProps {
    group: Group;
    onGroupDeleted: () => void;
}

const GroupActions = ({ group, onGroupDeleted }: GroupActionsProps) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteGroup(group.id);
            toast.success(`Group '${group.name}' deleted successfully.`);
            onGroupDeleted();
        } catch (error) {
            toast.error("Failed to delete group. Ensure no beneficiaries are linked.");
            throw error; // Re-throw to keep ConfirmationDialog in loading state if needed
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
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(group.id)}>
                        Copy Group ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" /> Edit Group
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="flex items-center text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Group
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title={`Delete Group: ${group.name}?`}
                description={`Are you sure you want to delete the group '${group.name}'? This action cannot be undone. All associated beneficiaries must be removed or reassigned first.`}
                confirmText="Yes, Delete Group"
                onConfirm={handleDelete}
            />
        </>
    );
};


export const columns = (onGroupDeleted: () => void): ColumnDef<Group>[] => [
  {
    accessorKey: "name",
    header: "Group Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground max-w-xs truncate">
        {row.getValue("description") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "kronaRatio", // Changed from disbursementRatio
    header: "KR Weight",
    cell: ({ row }) => {
      const ratio = parseFloat(row.getValue("kronaRatio"));
      return (
        <Badge variant="secondary">
          {ratio.toLocaleString()} KR
        </Badge>
      );
    },
  },
  {
    accessorKey: "currentBalanceKes",
    header: "Current Balance (KES)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("currentBalanceKes"));
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(amount);

      return <div className="font-mono text-right">{formatted}</div>;
    },
  },
  {
    accessorKey: "beneficiaryCount",
    header: "Beneficiaries",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("beneficiaryCount")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <GroupActions group={row.original} onGroupDeleted={onGroupDeleted} />;
    },
  },
];