import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Calendar, Phone, User, Hash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function BeneficiariesPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Beneficiary Management</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Register New Beneficiary
          </Button>
        </div>

        {/* New Beneficiary Registration Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Register New Beneficiary</CardTitle>
            <CardDescription>
              Capture required details for a new beneficiary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Beneficiary Details */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsorNumber">Sponsor Number</Label>
                <Input id="sponsorNumber" placeholder="SPN-12345" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number (Optional)</Label>
                <Input id="idNumber" placeholder="12345678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+254..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Parent/Guardian Details */}
              <div className="space-y-2">
                <Label htmlFor="guardianName">Parent/Guardian Name</Label>
                <Input id="guardianName" placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianPhone">Parent/Guardian Phone</Label>
                <Input id="guardianPhone" placeholder="+254..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianId">Parent/Guardian ID (Optional)</Label>
                <Input id="guardianId" placeholder="87654321" />
              </div>
              
              {/* Status and Group */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Receives Funds)</SelectItem>
                    <SelectItem value="inactive">Inactive (Paused)</SelectItem>
                    <SelectItem value="graduated">Graduated (Archived)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="group">Assigned Group</Label>
                <Select>
                  <SelectTrigger id="group">
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group-a">Group A</SelectItem>
                    <SelectItem value="group-b">Group B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3 flex items-end justify-end">
                <Button type="submit">Save Beneficiary</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Beneficiary List Table Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Beneficiaries</CardTitle>
            <CardDescription>
              Filter and manage the status of all beneficiaries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Beneficiary List Table Placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}