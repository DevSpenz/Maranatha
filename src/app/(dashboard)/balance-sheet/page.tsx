"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Scale, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { fetchBalanceSheetData, BalanceSheetData } from "@/lib/data/cashbook";
import { toast } from "sonner";
import { BalanceSheetReport } from "@/components/reports/BalanceSheetReport";

export default function BalanceSheetPage() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedData = await fetchBalanceSheetData();
      setData(fetchedData);
    } catch (error) {
      toast.error("Failed to load Balance Sheet data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
          <Scale className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
      </div>
      
      {isLoading ? (
          <Card className="h-[500px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
      ) : data ? (
          <BalanceSheetReport data={data} />
      ) : (
          <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                  No financial data available to generate the Balance Sheet.
              </CardContent>
          </Card>
      )}
      
      <Separator />
      
      <Card>
          <CardHeader>
              <CardTitle>Report Options</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-muted-foreground">
                  Date selection and export options placeholder.
              </div>
          </CardContent>
      </Card>
    </div>
  );
}