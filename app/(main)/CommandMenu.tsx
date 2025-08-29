"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const pages = [
  { name: "Dashboard", href: "/" },
  { name: "Patients", href: "/patients" },
  { name: "Doctors", href: "/doctors" },
  { name: "Admissions", href: "/admissions" },
  { name: "Appointments", href: "/appointments" },
  { name: "Billing", href: "/billing" },
  { name: "Reports", href: "/reports" },
];

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // ⌘K / Ctrl+K keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      {/* Search Button */}
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Search className="h-5 w-5" />
      </Button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search page..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {pages.map((page) => (
              <CommandItem
                key={page.href}
                onSelect={() => {
                  setOpen(false);
                  router.push(page.href);
                }}
              >
                {page.name}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </>
  );
}
