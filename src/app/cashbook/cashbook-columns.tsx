"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CashbookEntry } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const cashbookColumns: ColumnDef<CashbookEntry>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.date;
      return <div>{format(date, "MMM dd, yyyy")}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div className="font-medium max-w-lg">{row.original.description}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as CashbookEntry['type'];
      const isOutflow = type === 'outflow';
      
      return (
        <Badge 
          className={cn(
            "capitalize flex items-center w-fit",
            isOutflow ? "bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900 dark:text-red-200" : "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200"
          )}
        >
          {isOutflow ? <ArrowDown className="h-3 w-3 mr-1" /> : <ArrowUp className="h-3 w-3 mr-1" />}
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amountKes",
    header: () => <div className="text-right">Amount (KES)</div>,
    cell: ({ row }) => {
      const amount = row.original.amountKes;
      const formatted = formatCurrency(amount);
      const isOutflow = row.original.type === 'outflow';

      return (
        <div className={cn("font-mono font-semibold text-right", isOutflow ? "text-destructive" : "text-green-600 dark:text-green-400")}>
          {isOutflow ? `(${formatted})` : formatted}
        </div>
      );
    },
  },
];