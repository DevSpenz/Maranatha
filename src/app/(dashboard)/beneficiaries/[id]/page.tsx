"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Calendar, Phone, Mail, Home, Trash2, Edit } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { fetchBeneficiaryById } from "@/lib/data/beneficiaries";
import { fetchBeneficiaryPayments } from "@/lib/data/beneficiary-payments";
import { Beneficiary, BeneficiaryPayment } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { DataTable } from "@/components/data-table/DataTable";
import { paymentColumns } from "@/app/beneficiaries/payment-columns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BeneficiaryDetailPageProps {
    params: {
        id: string;
    };
}

export default function BeneficiaryDetailPage({ params }: BeneficiaryDetailPageProps) {
    const beneficiaryId = params.id;
    const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
    const [payments, setPayments] = useState<BeneficiaryPayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedBeneficiary, fetchedPayments] = await Promise.all([
                fetchBeneficiaryById(beneficiaryId),
                fetchBeneficiaryPayments(beneficiaryId),
            ]);
            
            setBeneficiary(fetchedBeneficiary);
            setPayments(fetchedPayments);
        } catch (error) {
            toast.error("Failed to load beneficiary details.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [beneficiaryId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!beneficiary) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    Beneficiary not found.
                </CardContent>
            </Card>
        );
    }

    const statusClasses = {
        active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        inactive: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        graduated: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{beneficiary.fullName}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                    <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Profile and Guardian Info */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Beneficiary Profile
                        </CardTitle>
                        <CardDescription>
                            Key identification and status details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <DetailRow label="Sponsor Number" value={beneficiary.sponsorNumber} />
                        <DetailRow label="ID Number" value={beneficiary.idNumber || 'N/A'} />
                        <DetailRow label="Date of Birth" value={format(beneficiary.dateOfBirth, "PPP")} Icon={Calendar} />
                        <DetailRow label="Phone Number" value={beneficiary.phoneNumber} Icon={Phone} />
                        <DetailRow label="Gender" value={beneficiary.gender.charAt(0).toUpperCase() + beneficiary.gender.slice(1)} />
                        <DetailRow label="Assigned Group" value={beneficiary.groupId} Icon={Home} />
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-medium">Status:</span>
                            <Badge className={cn("capitalize", statusClasses[beneficiary.status])}>
                                {beneficiary.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Guardian Information</CardTitle>
                        <CardDescription>
                            Contact details for the parent or guardian.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <DetailRow label="Guardian Name" value={beneficiary.guardianName} Icon={User} />
                        <DetailRow label="Guardian Phone" value={beneficiary.guardianPhone} Icon={Phone} />
                        <DetailRow label="Guardian ID" value={beneficiary.guardianId || 'N/A'} />
                    </CardContent>
                </Card>
            </div>

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment History ({payments.length})</CardTitle>
                    <CardDescription>
                        All funds disbursed directly to this beneficiary.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable columns={paymentColumns} data={payments} />
                </CardContent>
            </Card>
        </div>
    );
}

// Helper component for displaying details
const DetailRow = ({ label, value, Icon }: { label: string, value: string, Icon?: React.ElementType }) => (
    <div className="flex justify-between items-center border-b border-dashed pb-1">
        <span className="text-muted-foreground flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            {label}:
        </span>
        <span className="font-semibold">{value}</span>
    </div>
);