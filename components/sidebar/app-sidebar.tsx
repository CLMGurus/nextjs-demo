"use client";

import * as React from "react";
import {
  Hospital,
  LayoutDashboard,
  UserRoundPlus,
  ClipboardPlus,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "@supabase/supabase-js";

export type ExtendedUser = User & {
  full_name?: string;
  avatar_url?: string;
  accessToken?: string;
};

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Patients",
      url: "/patients",
      icon: UserRoundPlus,
    },
    {
      title: "Admissions",
      url: "/admissions",
      icon: Hospital,
    },
    {
      title: "Notes",
      url: "/notes",
      icon: ClipboardPlus,
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: ExtendedUser | null }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.full_name ?? "Anonymous",
            email: user?.email ?? "",
            avatar: user?.avatar_url ?? "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
