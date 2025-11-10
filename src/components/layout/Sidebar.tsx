"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  BookOpen,
  TrendingUp,
  Scale,
  Menu,
  Settings, // Import Settings icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  {
    title: "Main Navigation",
    links: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/donors", label: "Donors", icon: Users },
      { href: "/groups", label: "Group Management", icon: Users }, // Changed icon to Users
      { href: "/beneficiaries", label: "Beneficiaries", icon: Users },
      { href: "/disbursement", label: "Disbursement", icon: Wallet },
      { href: "/cashbook", label: "Cashbook & Ledger", icon: BookOpen },
    ],
  },
  {
    title: "Financial Reports",
    links: [
      { href: "/income-statement", label: "Income Statement", icon: TrendingUp },
      { href: "/trial-balance", label: "Trial Balance", icon: TrendingUp },
      { href: "/balance-sheet", label: "Balance Sheet", icon: Scale },
    ],
  },
  {
    title: "Administration",
    links: [
      { href: "/settings", label: "Settings", icon: Settings }, // New Settings link
    ],
  },
];

interface NavLinkProps {
  href: string;
  label: string;
  Icon: React.ElementType;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, Icon }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
};

const SidebarContent = () => (
  <ScrollArea className="h-full px-4 py-6 lg:py-8">
    <div className="space-y-6">
      {navItems.map((section, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-sm font-semibold text-sidebar-foreground/70">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                Icon={link.icon}
              />
            ))}
          </div>
          {index < navItems.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  </ScrollArea>
);

export function Sidebar() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-lg font-bold text-sidebar-primary">
              Maranatha FMS
            </h1>
          </div>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden lg:block w-[250px] border-r bg-sidebar h-full fixed top-0 left-0 pt-16">
      <SidebarContent />
    </div>
  );
}