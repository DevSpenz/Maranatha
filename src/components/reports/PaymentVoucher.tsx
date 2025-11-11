"use client";

import * as React from "react";
import { BeneficiaryPayment } from "@/types";
import { formatKes } from "@/lib/utils";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button"; // <-- Added missing import

interface PaymentVoucherProps {
    payment: BeneficiaryPayment;
}

export function PaymentVoucher({ payment }: PaymentVoucherProps) {
    const printRef = React.useRef<HTMLDivElement>(null);

    // Function to trigger browser print dialog
    const handlePrint = () => {
        if (printRef.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Payment Voucher</title>');
                // Inject necessary styles for printing (Tailwind base styles are usually sufficient)
                printWindow.document.write('<style>@media print { body { margin: 0; } .no-print { display: none !important; } }</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(printRef.current.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    React.useEffect(() => {
        // Automatically trigger print when component mounts in the dialog
        // We rely on the parent dialog to call this if needed, but providing the function is safer.
    }, []);

    return (
        <div className="p-4 space-y-6 bg-white text-gray-900 print:p-0 print:shadow-none" ref={printRef}>
            
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-900 pb-2">
                <div>
                    <h1 className="text-2xl font-bold">Maranatha FMS</h1>
                    <p className="text-sm">Beneficiary Payment Voucher</p>
                </div>
                <div className="text-right text-sm">
                    <p className="font-semibold">Voucher ID: {payment.id.substring(0, 8)}</p>
                    <p>Date: {format(payment.datePaid, 'PPP')}</p>
                    <p>Run ID: {payment.paymentRunId ? payment.paymentRunId.substring(0, 8) : 'N/A'}</p>
                </div>
            </div>

            {/* Recipient Details */}
            <div className="border p-3 text-sm">
                <p><span className="font-semibold">Paid To:</span> {payment.beneficiaryName}</p>
                <p><span className="font-semibold">Group:</span> {payment.groupName}</p>
            </div>

            {/* Financial Table */}
            <div className="rounded-md border">
                <Table>
                    <TableBody>
                        <TableRow className="bg-gray-50">
                            <TableCell className="font-bold w-[70%]">Description</TableCell>
                            <TableCell className="font-bold text-right">Amount (KES)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                {payment.notes || `Payment from ${payment.groupName} group funds.`}
                            </TableCell>
                            <TableCell className="text-right font-mono">{formatKes(payment.amountKes)}</TableCell>
                        </TableRow>
                        <TableRow className="border-t-2 border-gray-900">
                            <TableCell className="font-extrabold text-lg">TOTAL PAID</TableCell>
                            <TableCell className="text-right font-extrabold text-lg font-mono">{formatKes(payment.amountKes)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Authorization/Signatures */}
            <div className="grid grid-cols-3 gap-8 pt-6 text-sm">
                <div className="space-y-4">
                    <p className="border-b border-dashed pb-1">_________________________</p>
                    <p className="font-semibold">Prepared By (FMS User)</p>
                </div>
                <div className="space-y-4">
                    <p className="border-b border-dashed pb-1">_________________________</p>
                    <p className="font-semibold">Approved By (Manager)</p>
                </div>
                <div className="space-y-4">
                    <p className="border-b border-dashed pb-1">_________________________</p>
                    <p className="font-semibold">Recipient Signature (Beneficiary/Guardian)</p>
                </div>
            </div>
            
            {/* Print Button (Hidden when printing) */}
            <div className="no-print flex justify-end pt-4">
                <Button onClick={handlePrint}>Print Voucher</Button>
            </div>
        </div>
    );
}