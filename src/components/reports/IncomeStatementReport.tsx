"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatKes } from "@/lib/utils";
import { IncomeStatementData } from "@/lib/data/cashbook";
import { cn } from "@/lib/utils";

interface IncomeStatementReportProps {
    data: IncomeStatementData;
}

export function IncomeStatementReport({ data }: IncomeStatementReportProps) {
    const { totalDonationsKes, totalDisbursementsKes, netSurplus } = data;
    
    const isSurplus = netSurplus >= 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statement of Financial Performance (YTD)</CardTitle>
                <CardDescription>
                    Summary of revenues and expenses from the start of the year to date.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Revenue Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-primary">Revenues</h3>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-base">Donations Received</span>
                        <span className="font-mono font-semibold">{formatKes(totalDonationsKes)}</span>
                    </div>
                    <div className="flex justify-between pt-2 font-bold text-lg">
                        <span>Total Revenues</span>
                        <span className="font-mono">{formatKes(totalDonationsKes)}</span>
                    </div>
                </div>

                <Separator />

                {/* Expenses Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-destructive">Expenses</h3>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-base">Funds Disbursed to Groups</span>
                        <span className="font-mono font-semibold text-destructive">{formatKes(totalDisbursementsKes)}</span>
                    </div>
                    <div className="flex justify-between pt-2 font-bold text-lg">
                        <span>Total Expenses</span>
                        <span className="font-mono text-destructive">{formatKes(totalDisbursementsKes)}</span>
                    </div>
                </div>

                <Separator />

                {/* Net Income/Surplus */}
                <div className="space-y-2 pt-4">
                    <div className="flex justify-between text-xl font-extrabold">
                        <span>Net {isSurplus ? "Surplus" : "Deficit"}</span>
                        <span className={cn(
                            "font-mono",
                            isSurplus ? "text-green-600 dark:text-green-400" : "text-destructive"
                        )}>
                            {formatKes(Math.abs(netSurplus))}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This represents the change in unallocated funds (Main Cash Balance) over the period.
                    </p>
                </div>

            </CardContent>
        </Card>
    );
}