"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Donation } from "@/types";
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

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat(currency === 'KES' ? "en-KE" : "sv-SE", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const columns: ColumnDef<Donation>[] = [
  {
    accessorKey: "donorName",
    header: "Donor",
    cell: ({ row }) => <div className="font-medium">{row.getValue("donorName")}</div>,
  },
  {
    accessorKey: "dateReceived",
    header: "Date Received",
    cell: ({ row }) => {
      const date = row.getValue("dateReceived") as Date;
      return <div>{format(date, "PPP")}</div>;
    },
  },
  {
    accessorKey: "sekAmount",
    header: "Amount (KR)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("sekAmount"));
      return <div className="text-right">{formatCurrency(amount, "SEK")}</div>;
    },
  },
  {
    accessorKey: "exchangeRate",
    header: "Rate (KES/SEK)",
    cell: ({ row }) => {
      const rate = parseFloat(row.getValue("exchangeRate"));
      return <div className="text-right">{rate.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "kesAmount",
    header: "KES Equivalent",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("kesAmount"));
      return <div className="font-semibold text-right">{formatCurrency(amount, "KES")}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const donation = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(donation.id)}>
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