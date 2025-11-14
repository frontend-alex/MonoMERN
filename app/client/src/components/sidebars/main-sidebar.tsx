import AppLogo from "../AppLogo";

import {
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  User as U,
} from "lucide-react";

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
import { NavMain } from "./main-nav";
import { NavProjects } from "./secondary-nav";
import { UserDropdownSkeleton } from "@/components/dropdowns/user-dropdown";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@shared/types/user";

const LazyUserDropdown = lazy(() => import("@/components/dropdowns/user-dropdown"))

const sidebarData = (authUser: User | null) => ({
  user: {
    name: authUser?.username ?? "Unknown",
    email: authUser?.email ?? "unknown@example.com",
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "Settings",
      icon: Settings2,
      items: [
        {
          title: "Settings",
          url: ROUTES.AUTHENTICATED.SETTINGS,
          icon: U,
        },
        {
          title: "Profile",
          url: ROUTES.AUTHENTICATED.PROFILE,
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { user } = useAuth();

  const data = sidebarData(user);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
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
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        {/* <NavSecondar items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <Suspense fallback={<UserDropdownSkeleton/>}>
          <LazyUserDropdown />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
