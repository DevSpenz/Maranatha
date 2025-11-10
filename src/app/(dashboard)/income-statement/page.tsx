"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { fetchIncomeStatementData, IncomeStatementData } from "@/lib/data/cashbook";
import { toast } from "sonner";
import { IncomeStatementReport } from "@/components/reports/IncomeStatementReport";
import { DateRangePicker } from "@/components/forms/DateRangePicker";
import { DateRange } from "react-day-picker";
import { endOfDay, startOfYear } from "date-fns";

export default function IncomeStatementPage() {
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfYear(new Date()),
    to: endOfDay(new Date()),
  });

  const loadData = useCallback(async (range: DateRange | undefined) => {
    setIsLoading(true);
    try {
      const startDate = range?.from;
      const endDate = range?.to;
      
      const fetchedData = await fetchIncomeStatementData(startDate, endDate);
      setData(fetchedData);
    } catch (error) {
      toast.error("Failed to load Income Statement data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(dateRange);
  }, [dateRange, loadData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Income Statement</h1>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Report Options</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <DateRangePicker date={dateRange} setDate={setDateRange} />
                  <p className="text-sm text-muted-foreground">
                      Showing performance from {dateRange?.from ? dateRange.from.toLocaleDateString() : 'start'} to {dateRange?.to ? dateRange.to.toLocaleDateString() : 'today'}.
                  </p>
              </div>
          </CardContent>
      </Card>

      {isLoading ? (
          <Card className="h-[500px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
      ) : data ? (
          <IncomeStatementReport data={data} />
      ) : (
          <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                  No financial data available for the selected period.
              </CardContent>
          </Card>
      )}
      
      <Separator />
    </div>
  );
}