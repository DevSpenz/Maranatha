"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BeneficiaryPayment } from "@/types";
import { format } from "date-fns";
import { formatKes } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const groupPaymentColumns: ColumnDef<BeneficiaryPayment>[] = [
  {
    accessorKey: "datePaid",
    header: "Date Paid",
    cell: ({ row }) => {
      const date = row.getValue("datePaid") as Date;
      return <div>{format(date, "MMM dd, yyyy")}</div>;
    },
  },
  {
    accessorKey: "beneficiaryName",
    header: "Beneficiary",
    cell: ({ row }) => {
        const name = row.original.beneficiaryName;
        const id = row.original.beneficiaryId;
        return (
            <Link href={`/beneficiaries/${id}`} className="font-medium hover:underline text-primary">
                {name}
            </Link>
        );
    },
  },
  {
    accessorKey: "amountKes",
    header: () => <div className="text-right">Amount Paid (KES)</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amountKes"));
      return <div className="font-mono font-semibold text-right text-destructive">{formatKes(amount)}</div>;
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