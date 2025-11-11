"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BeneficiaryPayment } from "@/types";
import { format } from "date-fns";
import { formatKes } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentVoucherDialog } from "@/components/dialogs/PaymentVoucherDialog";

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
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const paymentId = row.original.id;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Payment Actions</DropdownMenuLabel>
            <PaymentVoucherDialog
                paymentId={paymentId}
                trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center cursor-pointer">
                        <Printer className="mr-2 h-4 w-4" /> View Voucher
                    </DropdownMenuItem>
                }
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(paymentId)}>
              Copy Payment ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];