"use client";

import * as React from "react";
import { ChevronsUpDown, UserRound, Hospital } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Organization } from "@/types/syncUsers";

const iconMap: Record<string, React.ElementType> = {
  personal: UserRound,
  hospital: Hospital,
};

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { organizations, currentOrganization, setAuthData } = useAuthStore();
  const router = useRouter();

  if (!organizations || !currentOrganization) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <UserRound className="size-5" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No Organization</span>
              <span className="truncate text-xs">Select an organization</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const handleSelectOrganization = async (organization: Organization) => {
    try {
      // Update cookie via API route
      const response = await fetch("/api/auth/select-organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: organization.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update organization");
      }
      if (currentOrganization.name !== organization.name) {
        setAuthData({ currentOrganization: organization });
        router.refresh();
        toast(`Switched to ${organization.name}`);
      }
    } catch (error) {
      console.error("Error selecting organization:", error);
      toast("Failed to switch organization. Please try again.");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {React.createElement(
                  iconMap[currentOrganization.type] || UserRound,
                  {
                    className: "size-5",
                  }
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentOrganization.name}
                </span>
                <span className="truncate text-xs">
                  {currentOrganization.type}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Hospitals
            </DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSelectOrganization(org)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {React.createElement(iconMap[org.type] || UserRound, {
                    className: "size-3.5 shrink-0",
                  })}
                </div>
                {org.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
