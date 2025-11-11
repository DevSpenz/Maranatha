"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatKes } from "@/lib/utils";
import { TrialBalanceData } from "@/lib/data/cashbook";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TrialBalanceReportProps {
    data: TrialBalanceData;
}

export function TrialBalanceReport({ data }: TrialBalanceReportProps) {
    const { 
        totalDonationsCredit, 
        totalDisbursementsDebit, 
        totalDebits, 
        totalCredits, 
        isBalanced 
    } = data;

    // Calculate Net Surplus/Deficit for the balancing entry
    const netSurplus = totalDonationsCredit - totalDisbursementsDebit;
    const netSurplusAbsolute = Math.abs(netSurplus);

    // Define the rows for the Trial Balance (simplified to main cash movements)
    const rows = [
        { 
            account: "Donations (Revenue/Equity)", 
            debit: 0, 
            credit: totalDonationsCredit 
        },
        { 
            account: "Disbursements (Expense)", 
            debit: totalDisbursementsDebit, 
            credit: 0 
        },
        { 
            // If netSurplus > 0 (Credit side is larger), the balancing entry is a DEBIT.
            // If netSurplus < 0 (Debit side is larger), the balancing entry is a CREDIT.
            account: `Net ${netSurplus >= 0 ? "Surplus" : "Deficit"} - Balancing Entry`, 
            debit: netSurplus > 0 ? netSurplusAbsolute : 0, 
            credit: netSurplus < 0 ? netSurplusAbsolute : 0 
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trial Balance</CardTitle>
                <CardDescription>
                    A summary of total debits and credits for the selected period.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60%]">Account</TableHead>
                                <TableHead className="text-right">Debit (KES)</TableHead>
                                <TableHead className="text-right">Credit (KES)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{row.account}</TableCell>
                                    <TableCell className="text-right font-mono text-destructive">
                                        {row.debit > 0 ? formatKes(row.debit) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                                        {row.credit > 0 ? formatKes(row.credit) : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableCell className="font-bold text-lg">TOTALS</TableCell>
                                <TableCell className="text-right font-extrabold text-lg font-mono">
                                    {formatKes(totalDebits)}
                                </TableCell>
                                <TableCell className="text-right font-extrabold text-lg font-mono">
                                    {formatKes(totalCredits)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Balance Check */}
                <div className={cn(
                    "text-center p-3 rounded-lg",
                    isBalanced ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-destructive"
                )}>
                    <p className="font-bold">
                        {isBalanced ? "The Trial Balance is balanced (Debits = Credits)." : "Warning: The Trial Balance is NOT balanced."}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}