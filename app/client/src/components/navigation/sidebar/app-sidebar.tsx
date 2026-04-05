import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { lazy, Suspense } from "react";
import { UserDropdownSkeleton } from "@/components/shared/dropdowns/user-dropdown";
import AppLogo from "@/components/branding/logo";
import { AppSidebarLinks } from "./app-sidebar-links";
import { LayoutDashboard, Settings, User } from "lucide-react";
import { ROUTES } from "@/config/routes";

const LazyUserDropdown = lazy(() => import("@/components/shared/dropdowns/user-dropdown"))


export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {

  const sidebarLinks = {
    primaryNav: {
      title: "General Links",
      items: [
        {
          name: "Dashboard",
          url: ROUTES.BASE.APP,
          icon: LayoutDashboard,
        },
      ],
    },
    navSecondary: {
      title: "Personal Links",
      items: [
        {
          name: "Settings",
          icon: Settings,
          url: ROUTES.AUTHENTICATED.SETTINGS,
        },
        {
          name: "Profile",
          url: ROUTES.AUTHENTICATED.PROFILE,
          icon: User,
        },
      ],
    },
  };



  return (
    <Sidebar variant="inset" {...props} className="border-r bg-background">
      <SidebarHeader className="bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <AppLogo />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        {Object.values(sidebarLinks).map((group) => (
          <AppSidebarLinks key={group.title} data={group} />
        ))}
      </SidebarContent>
      <SidebarFooter className="bg-background">
        <Suspense fallback={<UserDropdownSkeleton />}>
          <LazyUserDropdown />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
