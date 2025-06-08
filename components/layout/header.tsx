"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MicIcon,
  UserIcon,
  SettingsIcon,
  HomeIcon,
  ClockIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { doSignOut } from "@/lib/auth";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-2xl tracking-tight">NewsVoice</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link
            href="/timeline"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ClockIcon className="h-4 w-4" />
            <span>Timeline</span>
          </Link>
          <Link
            href="/preferences"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <SettingsIcon className="h-4 w-4" />
            <span>Preferences</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={async () => {
                  await doSignOut();
                  window.location.href = "/auth/signup";
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
