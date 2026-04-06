import { Outlet } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/navigation/sidebar/app-sidebar";
import { AppBreadcrumbs } from "@/components/navigation/app-breadcrumbs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const RootLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
        <div className="flex items-center gap-3 w-full border-b py-3 px-5 shrink-0">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <AppBreadcrumbs />
        </div>

        <div className="flex-1 overflow-y-auto relative">
          <div className="mx-auto p-5 max-w-4xl">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RootLayout;