"use client";

import * as React from "react";
import { BeneficiaryPayment } from "@/types";
import { formatKes } from "@/lib/utils";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

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
                // Inject necessary styles for printing
                printWindow.document.write('<style>');
                printWindow.document.write('@media print {');
                printWindow.document.write('  body { margin: 0; padding: 0; }');
                printWindow.document.write('  .no-print { display: none !important; }');
                printWindow.document.write('  .print-border { border-color: #000 !important; }');
                printWindow.document.write('  .print-text-black { color: #000 !important; }');
                printWindow.document.write('}');
                printWindow.document.write('</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write('<div class="p-6">'); // Add padding for print margin
                printWindow.document.write(printRef.current.innerHTML);
                printWindow.document.write('</div>');
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    return (
        <div className="p-4 space-y-6 bg-white text-gray-900 print:p-0 print:shadow-none" ref={printRef}>
            
            {/* Print Button (Hidden when printing) */}
            <div className="no-print flex justify-end pt-2">
                <Button onClick={handlePrint} size="sm">
                    <Printer className="mr-2 h-4 w-4" /> Print Voucher
                </Button>
            </div>

            {/* Voucher Content Container */}
            <div className="border border-gray-300 p-6 space-y-6 print:border-black print:p-4">
                
                {/* Header Section */}
                <div className="flex justify-between items-start border-b border-gray-900 pb-3 print:border-black">
                    <div>
                        <h1 className="text-2xl font-bold text-primary print-text-black">Maranatha FMS</h1>
                        <p className="text-sm text-muted-foreground print-text-black">Beneficiary Payment Voucher</p>
                    </div>
                    <div className="text-right text-sm space-y-1">
                        <p className="font-semibold text-lg">Voucher ID: {payment.id.substring(0, 8)}</p>
                        <p>Date Paid: {format(payment.datePaid, 'PPP')}</p>
                        <p>Transaction ID: {payment.paymentRunId ? payment.paymentRunId.substring(0, 8) : 'N/A'}</p>
                    </div>
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-2 gap-4 border border-gray-300 p-3 text-sm print:border-black">
                    <div>
                        <p className="font-semibold">Paid To:</p>
                        <p className="text-lg font-bold">{payment.beneficiaryName}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Source Group:</p>
                        <p className="text-lg font-bold">{payment.groupName}</p>
                    </div>
                </div>

                {/* Payment Authorization / Description */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold border-b pb-1 print:border-black">Payment Authorization</h3>
                    <div className="border border-gray-300 p-3 print:border-black">
                        <p className="font-semibold">Description:</p>
                        <p className="text-sm mt-1">{payment.notes || `Payment from ${payment.groupName} group funds.`}</p>
                    </div>
                </div>

                {/* Financial Summary Table */}
                <div className="rounded-md border border-gray-300 overflow-hidden print:border-black">
                    <Table>
                        <TableBody>
                            <TableRow className="bg-gray-100 print:bg-gray-100">
                                <TableCell className="font-bold w-[70%] text-base">Amount Paid</TableCell>
                                <TableCell className="font-bold text-right text-base">Amount (KES)</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-lg font-semibold">Total Amount Disbursed</TableCell>
                                <TableCell className="text-right font-extrabold text-xl font-mono text-primary print-text-black">
                                    {formatKes(payment.amountKes)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Authorization/Signatures (Two Columns) */}
                <div className="grid grid-cols-2 gap-12 pt-8 text-sm">
                    
                    {/* Authorization Column */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-base border-b pb-1 print:border-black">Authorization</h4>
                        <div className="space-y-4">
                            <p className="border-b border-dashed border-gray-500 pb-1 print:border-black">_________________________</p>
                            <p className="font-semibold">Prepared By (FMS User)</p>
                        </div>
                        <div className="space-y-4">
                            <p className="border-b border-dashed border-gray-500 pb-1 print:border-black">_________________________</p>
                            <p className="font-semibold">Approved By (Manager)</p>
                        </div>
                    </div>

                    {/* Recipient Column */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-base border-b pb-1 print:border-black">Recipient Confirmation</h4>
                        <div className="space-y-4 pt-10">
                            <p className="border-b border-dashed border-gray-500 pb-1 print:border-black">_________________________</p>
                            <p className="font-semibold">Recipient Signature (Beneficiary/Guardian)</p>
                        </div>
                        <div className="space-y-4">
                            <p className="border-b border-dashed border-gray-500 pb-1 print:border-black">_________________________</p>
                            <p className="font-semibold">Date Received</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}