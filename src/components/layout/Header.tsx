"use client";

import { Search, User, ChevronDown, Globe } from "lucide-react";
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

// Placeholder for user profile
const UserProfile = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">MR</AvatarFallback>
        </Avatar>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium leading-none">Moni Roy</p>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuItem>Logout</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

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