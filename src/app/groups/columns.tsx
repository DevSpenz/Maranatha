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

export const columns: ColumnDef<Group>[] = [
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
    accessorKey: "disbursementRatio",
    header: "Ratio",
    cell: ({ row }) => {
      const ratio = parseFloat(row.getValue("disbursementRatio"));
      return (
        <Badge variant="secondary">
          {ratio}%
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
      const group = row.original;

      return (
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
            <DropdownMenuItem className="flex items-center text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];