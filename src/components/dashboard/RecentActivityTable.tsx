"use client";

import * as React from "react";
import { CashbookEntry } from "@/types";
import { formatKes, cn } from "@/lib/utils";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";

interface RecentActivityTableProps {
    data: CashbookEntry[];
}

export function RecentActivityTable({ data }: RecentActivityTableProps) {
    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No recent activities recorded yet.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableBody>
                    {data.map((entry) => {
                        const isOutflow = entry.type === 'outflow';
                        const Icon = isOutflow ? ArrowDown : ArrowUp;
                        const amountFormatted = formatKes(entry.amountKes);

                        return (
                            <TableRow key={entry.id} className="hover:bg-muted/50">
                                {/* Icon & Type */}
                                <TableCell className="w-10 p-2">
                                    <Icon className={cn(
                                        "h-4 w-4",
                                        isOutflow ? "text-destructive" : "text-green-600 dark:text-green-400"
                                    )} />
                                </TableCell>
                                
                                {/* Description */}
                                <TableCell className="font-medium p-2">
                                    <div className="text-sm truncate max-w-xs md:max-w-md">
                                        {entry.description}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(entry.date, "MMM dd, yyyy")}
                                    </div>
                                </TableCell>

                                {/* Amount */}
                                <TableCell className="text-right font-mono font-semibold p-2">
                                    <div className={cn(
                                        isOutflow ? "text-destructive" : "text-green-600 dark:text-green-400"
                                    )}>
                                        {isOutflow ? `(${amountFormatted})` : amountFormatted}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}