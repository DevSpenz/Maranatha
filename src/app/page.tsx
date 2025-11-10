import { DashboardShell } from "@/components/layout/DashboardShell";

export default function Home() {
  return (
    <DashboardShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Maranatha FMS.</p>
      </div>
    </DashboardShell>
  );
}