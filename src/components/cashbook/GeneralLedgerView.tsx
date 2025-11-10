"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/DataTable";
import { CashbookEntry } from "@/types";
import { formatKes } from "@/lib/utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LedgerEntry {
    id: string;
    date: Date;
    description: string;
    debit: number; // Outflow (Disbursement)
    credit: number; // Inflow (Donation)
    runningBalance: number;
}

interface GeneralLedgerViewProps {
    cashbookEntries: CashbookEntry[];
}

const ledgerColumns: ColumnDef<LedgerEntry>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <div>{format(row.original.date, "MMM dd, yyyy")}</div>,
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <div className="font-medium max-w-lg">{row.original.description}</div>,
    },
    {
        accessorKey: "credit",
        header: () => <div className="text-right">Credit (Inflow)</div>,
        cell: ({ row }) => (
            <div className="font-mono text-right text-green-600 dark:text-green-400">
                {row.original.credit > 0 ? formatKes(row.original.credit) : '-'}
            </div>
        ),
    },
    {
        accessorKey: "debit",
        header: () => <div className="text-right">Debit (Outflow)</div>,
        cell: ({ row }) => (
            <div className="font-mono text-right text-destructive">
                {row.original.debit > 0 ? formatKes(row.original.debit) : '-'}
            </div>
        ),
    },
    {
        accessorKey: "runningBalance",
        header: () => <div className="text-right">Balance (KES)</div>,
        cell: ({ row }) => {
            const balance = row.original.runningBalance;
            return (
                <div className={cn(
                    "font-mono font-bold text-right",
                    balance < 0 ? "text-destructive" : "text-primary"
                )}>
                    {formatKes(balance)}
                </div>
            );
        },
    },
];

/**
 * Calculates the running balance for the Main Cash Account based on chronological cashbook entries.
 * The Main Cash Account is credited by Donations (inflows) and debited by Disbursements (outflows).
 */
const calculateLedger = (entries: CashbookEntry[]): LedgerEntry[] => {
    // Sort entries chronologically (ascending) to calculate running balance correctly
    const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());

    let currentBalance = 0;
    const ledger: LedgerEntry[] = [];

    for (const entry of sortedEntries) {
        const credit = entry.type === 'inflow' ? entry.amountKes : 0;
        const debit = entry.type === 'outflow' ? entry.amountKes : 0;

        currentBalance = currentBalance + credit - debit;

        ledger.push({
            id: entry.id,
            date: entry.date,
            description: entry.description,
            credit,
            debit,
            runningBalance: currentBalance,
        });
    }
    
    // Reverse the ledger back to descending order for display
    return ledger.reverse();
};

export function GeneralLedgerView({ cashbookEntries }: GeneralLedgerViewProps) {
    const ledgerData = React.useMemo(() => calculateLedger(cashbookEntries), [cashbookEntries]);

    return (
        <div className="space-y-4">
            <h4 className="text-xl font-semibold">Main Cash Account Ledger</h4>
            <p className="text-sm text-muted-foreground">
                This ledger tracks the running balance of the Main Cash Account (unallocated funds).
            </p>
            <DataTable columns={ledgerColumns} data={ledgerData} />
        </div>
    );
}