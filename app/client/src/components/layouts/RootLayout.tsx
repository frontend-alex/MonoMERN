import { Outlet } from "react-router-dom";

import { Separator } from "@/components/ui/separator";

import { AppSidebar } from "@/components/sidebars/main-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const RootLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-5">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default RootLayout;
