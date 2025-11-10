"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BeneficiaryPayment } from "@/types";
import { format } from "date-fns";
import { formatKes } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const paymentColumns: ColumnDef<BeneficiaryPayment>[] = [
  {
    accessorKey: "datePaid",
    header: "Date Paid",
    cell: ({ row }) => {
      const date = row.getValue("datePaid") as Date;
      return <div>{format(date, "MMM dd, yyyy")}</div>;
    },
  },
  {
    accessorKey: "groupName",
    header: "Source Group",
    cell: ({ row }) => <div className="font-medium">{row.getValue("groupName")}</div>,
  },
  {
    accessorKey: "amountKes",
    header: () => <div className="text-right">Amount Received (KES)</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amountKes"));
      return <div className="font-mono font-semibold text-right text-green-600 dark:text-green-400">{formatKes(amount)}</div>;
    },
  },
  {
    accessorKey: "paymentRunId",
    header: "Payment Run ID",
    cell: ({ row }) => {
        const id = row.getValue("paymentRunId") as string;
        return <Badge variant="secondary" className="font-mono text-xs">{id ? id.substring(0, 8) : 'N/A'}</Badge>;
    }
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
];