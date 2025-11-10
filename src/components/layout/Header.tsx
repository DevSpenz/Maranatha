"use client";

import { Search, User, ChevronDown, Globe, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "../theme-toggle";
import { useSession } from "@/components/auth/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Placeholder for language selector
const LanguageSelector = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="flex items-center gap-1">
        <Globe className="h-4 w-4" />
        English
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem>English</DropdownMenuItem>
      <DropdownMenuItem>Swedish</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Functional User Profile with Logout
const UserProfile = () => {
  const { user } = useSession();
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out.");
      console.error("Logout error:", error);
    }
    // Redirection is handled by useAuthGuard
  };

  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : '??';
  const email = user?.email || 'Guest';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium leading-none">{email}</p>
            <p className="text-xs text-muted-foreground">User</p>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-destructive flex items-center">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:hidden">
          <Sidebar />
        </div>
        <div className="hidden lg:flex items-center">
          <h1 className="text-xl font-bold text-primary">Maranatha FMS</h1>
        </div>

        <div className="flex-1 mx-4 max-w-lg hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-muted pl-9 focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <LanguageSelector />
          <UserProfile />
        </div>
      </div>
    </header>
  );
}