import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BASE_PATHS, ROUTE_HELPERS } from "@/config/routes";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const AppBreadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);
    const basePathSegments = BASE_PATHS.APP.split("/").filter(Boolean);

    const isAppPath = ROUTE_HELPERS.isAuthenticatedRoute(location.pathname);
    const isExactlyBasePath = location.pathname === BASE_PATHS.APP || location.pathname === `${BASE_PATHS.APP}/`;

    const breadcrumbs = [];

    // Add Base Path (Dashboard) if we are in the app route
    if (isAppPath) {
        breadcrumbs.push({
            label: "Dashboard",
            path: BASE_PATHS.APP,
            isCurrent: isExactlyBasePath,
        });
    }

    // Add other segments
    pathnames.forEach((segment, index) => {
        // Skip base path segments if we are in the app route
        if (isAppPath && index < basePathSegments.length && segment === basePathSegments[index]) {
            return;
        }

        const buildPath = `/${pathnames.slice(0, index + 1).join("/")}`;

        // Basic formatting for segments, e.g., "my-settings" -> "My Settings"
        const formattedSegment = segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        breadcrumbs.push({
            label: formattedSegment,
            path: buildPath,
            isCurrent: index === pathnames.length - 1,
        });
    });

    return (
        <Breadcrumb className="w-full">
            <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.path}>
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                            {crumb.isCurrent ? (
                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link to={crumb.path}>{crumb.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
};