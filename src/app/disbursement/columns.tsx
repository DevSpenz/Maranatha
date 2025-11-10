"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Disbursement } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

export const columns: ColumnDef<Disbursement>[] = [
  {
    accessorKey: "dateDisbursed",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("dateDisbursed") as Date;
      return <div>{format(date, "PPP")}</div>;
    },
  },
  {
    accessorKey: "groupName",
    header: "Target Group",
    cell: ({ row }) => <div className="font-medium">{row.getValue("groupName")}</div>,
  },
  {
    accessorKey: "amountKes",
    header: "Amount (KES)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amountKes"));
      return <div className="font-semibold text-right">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground max-w-xs truncate">
        {row.getValue("notes") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "recordedBy",
    header: "Recorded By",
    cell: ({ row }) => <div className="text-sm">{row.getValue("recordedBy")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const disbursement = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(disbursement.id)}>
              Copy Transaction ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];