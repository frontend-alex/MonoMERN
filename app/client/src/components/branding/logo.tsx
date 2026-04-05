import { ROUTES } from "@/config/routes";
import { config } from "@shared/config/config";
import { Layers } from "lucide-react";
import { Link } from "react-router-dom";

export const SmallAppLogo = () => {
  return (
    <Link className="cursor-pointer" to={ROUTES.PUBLIC.LANDING}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg mx-auto bg-accent">
        <Layers className="h-5 w-5 text-primary" />
      </div>
    </Link>
  );
};

export const AppLogo = () => {
  return (
    <Link className="cursor-pointer" to={ROUTES.PUBLIC.LANDING}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg mx-auto bg-accent">
          <Layers className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold">{config.app.name}</span>
      </div>
    </Link>
  );
};

export default AppLogo;
