"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { fetchIncomeStatementData, IncomeStatementData } from "@/lib/data/cashbook";
import { toast } from "sonner";
import { IncomeStatementReport } from "@/components/reports/IncomeStatementReport";

export default function IncomeStatementPage() {
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedData = await fetchIncomeStatementData();
      setData(fetchedData);
    } catch (error) {
      toast.error("Failed to load Income Statement data.");
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
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Income Statement</h1>
      </div>
      
      {isLoading ? (
          <Card className="h-[500px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
      ) : data ? (
          <IncomeStatementReport data={data} />
      ) : (
          <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                  No financial data available to generate the Income Statement.
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
                  Date range selection and export options placeholder.
              </div>
          </CardContent>
      </Card>
    </div>
  );
}