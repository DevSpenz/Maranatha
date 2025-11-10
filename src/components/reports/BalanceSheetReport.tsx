"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatKes } from "@/lib/utils";
import { BalanceSheetData } from "@/lib/data/cashbook";
import { cn } from "@/lib/utils";

interface BalanceSheetReportProps {
    data: BalanceSheetData;
}

export function BalanceSheetReport({ data }: BalanceSheetReportProps) {
    const { mainCashBalance, totalGroupBalance, totalAssets, accumulatedFundBalance } = data;
    
    // Check if the balance sheet equation holds (Assets = Equity)
    const isBalanced = totalAssets === accumulatedFundBalance;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statement of Financial Position</CardTitle>
                <CardDescription>
                    A snapshot of the organization's assets and fund balances as of today.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                
                {/* ASSETS Section */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-primary">ASSETS</h3>
                    
                    <div className="space-y-2 pl-4">
                        <h4 className="text-lg font-semibold">Current Assets (Cash)</h4>
                        
                        <div className="flex justify-between border-b border-dashed pb-1">
                            <span className="text-base">Main Cash Account (Unallocated)</span>
                            <span className="font-mono">{formatKes(mainCashBalance)}</span>
                        </div>
                        
                        <div className="flex justify-between border-b border-dashed pb-1">
                            <span className="text-base">Group Cash Accounts (Allocated)</span>
                            <span className="font-mono">{formatKes(totalGroupBalance)}</span>
                        </div>
                    </div>

                    <Separator />
                    
                    <div className="flex justify-between pt-2 text-xl font-extrabold">
                        <span>TOTAL ASSETS</span>
                        <span className="font-mono text-primary">{formatKes(totalAssets)}</span>
                    </div>
                </div>

                <Separator className="h-1 bg-border" />

                {/* LIABILITIES & EQUITY Section */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-primary">LIABILITIES & FUND BALANCES</h3>
                    
                    {/* Liabilities (Placeholder for future expansion) */}
                    <div className="space-y-2 pl-4">
                        <h4 className="text-lg font-semibold">Liabilities</h4>
                        <div className="flex justify-between border-b border-dashed pb-1 text-muted-foreground">
                            <span className="text-base">No external liabilities recorded</span>
                            <span className="font-mono">{formatKes(0)}</span>
                        </div>
                    </div>
                    
                    {/* Equity */}
                    <div className="space-y-2 pl-4">
                        <h4 className="text-lg font-semibold">Fund Balances (Equity)</h4>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-base">Accumulated Fund Balance</span>
                            <span className="font-mono font-semibold">{formatKes(accumulatedFundBalance)}</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between pt-2 text-xl font-extrabold">
                        <span>TOTAL LIABILITIES & FUND BALANCES</span>
                        <span className="font-mono text-primary">{formatKes(accumulatedFundBalance)}</span>
                    </div>
                </div>

                {/* Balance Check */}
                <div className={cn(
                    "text-center p-3 rounded-lg",
                    isBalanced ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-destructive"
                )}>
                    <p className="font-bold">
                        {isBalanced ? "The Balance Sheet is balanced." : "Warning: The Balance Sheet is NOT balanced."}
                    </p>
                </div>

            </CardContent>
        </Card>
    );
}