import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getUserInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsUpDown, Layout, LogOut, Sparkles, User } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";

const dropdownLinks = [
  {
    name: "Dashboard",
    url: ROUTES.BASE.APP,
    icon: Layout,
  },
  {
    name: "Profile",
    url: ROUTES.AUTHENTICATED.PROFILE,
    icon: User,
  },
];

export const UserDropdownSkeleton = () => {
  return (
    <Button
      variant="ghost"
      disabled
      className="no-ring h-12 w-full justify-start gap-3 px-3"
    >
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="flex flex-col gap-1 flex-1 text-left">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
      </div>
    </Button>
  );
};

export default function UserDropdown({
  align = "end",
  side = "bottom",
}: {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}) {
  const { logout, user, isLoading } = useAuth();

  if (isLoading) return <UserDropdownSkeleton />;
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <Button
            variant="ghost"
            className="no-ring h-12 w-full justify-start gap-3 px-3 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              {/* <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} /> */}
              <AvatarFallback className="rounded-lg">
                {getUserInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.username}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={side}
        align={align}
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              {/* <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} /> */}
              <AvatarFallback className="rounded-lg">
                {getUserInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.username}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {dropdownLinks.map((link) => (
            <Link to={link.url}>
              <DropdownMenuItem>
                <link.icon />
                {link.name}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive cursor-pointer"
          onClick={logout}
        >
          <LogOut className="text-destructive" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
