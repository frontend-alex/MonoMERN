import { lazy, Suspense } from "react";

import { Link } from "react-router-dom";
import { Star, User } from "lucide-react";

import { ROUTES } from "@/config/routes";
import { useAuth } from "@/contexts/auth-context";

import AppLogo from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { UserDropdownSkeleton } from "@/components/shared/dropdowns/user-dropdown";

const LazyUserDropdown = lazy(
  () => import("@/components/shared/dropdowns/user-dropdown")
);

const navLinks = [
  {
    name: "",
    path: "",
  },
];

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="flex justify-between max-w-7xl mx-auto items-center gap-3 p-5">
      <AppLogo />
      <ul className="absolute flex items-center gap-3 left-1/2 -translate-x-1/2">
        {navLinks.map((link, idx) => (
          <li key={idx}>
            <Link className="font-medium" to={link.path}>
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
      {isAuthenticated ? (
        <Suspense fallback={<UserDropdownSkeleton />}>
          <LazyUserDropdown />
        </Suspense>
      ) : (
        <div className="flex items-center gap-3">
          <Link to={ROUTES.PUBLIC.LOGIN}>
            <Button variant={"ghost"}>Log in</Button>
          </Link>
          <Link to={ROUTES.PUBLIC.REGISTER}>
            <Button>
              <User /> Create an account
            </Button>
          </Link>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <p className="font-medium">0</p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
