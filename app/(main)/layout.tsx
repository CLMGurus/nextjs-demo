import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserWithToken } from "@/utils/supabase/getUserWithToken";
import { ModeToggle } from "@/app/(main)/ModeToggle";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CommandMenu } from "@/app/(main)/CommandMenu";

export const metadata: Metadata = {
  title: "huEMR Next App",
  description: "Hospital Management System",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserWithToken();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b bg-background">
          {/* Left: Sidebar + Breadcrumb */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <CommandMenu />

            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Theme toggle */}
            <ModeToggle />
          </div>
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
