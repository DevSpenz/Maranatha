"use client";

import * as React from "react"; // Import React explicitly for React.use
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Users, DollarSign, Percent, Home, TrendingDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { fetchGroupById } from "@/lib/data/groups";
import { fetchBeneficiariesByGroupId } from "@/lib/data/beneficiaries";
import { fetchBeneficiaryPaymentsByGroupId } from "@/lib/data/beneficiary-payments";
import { Group, Beneficiary, BeneficiaryPayment } from "@/types";
import { toast } from "sonner";
import { formatKes } from "@/lib/utils";
import { DataTable } from "@/components/data-table/DataTable";
import { columns as beneficiaryColumns } from "@/app/beneficiaries/columns";
import { groupPaymentColumns } from "@/app/groups/payment-columns";
import { Button } from "@/components/ui/button";
import { GroupEditDialog } from "@/components/dialogs/GroupEditDialog";
import { BeneficiaryEditDialog } from "@/components/dialogs/BeneficiaryEditDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GroupDetailPageProps {
    params: {
        id: string;
    };
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
    // Unwrap params using React.use()
    const unwrappedParams = React.use(params);
    const groupId = unwrappedParams.id;
    
    const [group, setGroup] = useState<Group | null>(null);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [payments, setPayments] = useState<BeneficiaryPayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedGroup, fetchedBeneficiaries, fetchedPayments] = await Promise.all([
                fetchGroupById(groupId),
                fetchBeneficiariesByGroupId(groupId),
                fetchBeneficiaryPaymentsByGroupId(groupId),
            ]);
            
            setGroup(fetchedGroup);
            setBeneficiaries(fetchedBeneficiaries);
            setPayments(fetchedPayments);
        } catch (error) {
            toast.error("Failed to load group details.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

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

    if (!group) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    Group not found.
                </CardContent>
            </Card>
        );
    }
    
    // Create a map for beneficiary columns (although redundant now that Beneficiary includes groupName, 
    // we keep the structure for compatibility with the existing columns function)
    const groupMap: Record<string, string> = { [group.id]: group.name };

    // Calculate total paid from this group
    const totalPaid = payments.reduce((sum, p) => sum + p.amountKes, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
                <GroupEditDialog groupId={group.id} onSuccess={loadData} />
            </div>

            <Separator />

            {/* Group Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Balance (KES)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{formatKes(group.currentBalanceKes)}</div>
                        <p className="text-xs text-muted-foreground">Funds available for payments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Beneficiaries</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{group.beneficiaryCount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Currently receiving support</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid from Group (KES)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{formatKes(totalPaid)}</div>
                        <p className="text-xs text-muted-foreground">Total funds disbursed to beneficiaries</p>
                    </CardContent>
                </Card>
            </div>
            
            {/* Group Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Group Details</CardTitle>
                    <CardDescription>
                        Configuration and description of the group.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <DetailRow label="Krona Ratio Weight" value={`${group.kronaRatio.toLocaleString()} KR`} Icon={Percent} />
                    <DetailRow label="Description" value={group.description || 'No description provided.'} Icon={Home} />
                </CardContent>
            </Card>

            <Separator />

            {/* Tabs for Beneficiaries and Payments */}
            <Tabs defaultValue="beneficiaries" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="beneficiaries">Beneficiaries ({beneficiaries.length})</TabsTrigger>
                    <TabsTrigger value="payments">Payment History ({payments.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="beneficiaries" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Group Beneficiaries</CardTitle>
                            <CardDescription>
                                List of all beneficiaries currently assigned to this group.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable 
                                columns={beneficiaryColumns(groupMap, loadData)} 
                                data={beneficiaries} 
                                searchKey="fullName"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="payments" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Beneficiary Payments from {group.name}</CardTitle>
                            <CardDescription>
                                Detailed history of funds paid out from this group's balance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={groupPaymentColumns} data={payments} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Helper component for displaying details (copied from beneficiary detail page)
const DetailRow = ({ label, value, Icon }: { label: string, value: string, Icon?: React.ElementType }) => (
    <div className="flex justify-between items-center border-b border-dashed pb-1">
        <span className="text-muted-foreground flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            {label}:
        </span>
        <span className="font-semibold">{value}</span>
    </div>
);