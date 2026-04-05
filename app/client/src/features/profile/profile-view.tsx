import { AccountProviders, type User } from "@shared/types/user";
import ProfileData from "./components/UpdateProfileInfo";
import ProfilePassword from "./components/UpdateProfilePass";
import ProfileSettings from "./components/DeleteProfile";

export const ProfileView = ({ user }: { user: User }) => {
    return (
        <div className="flex flex-col gap-10">
            <ProfileData user={user} />
            {user.provider === AccountProviders.Credentials && (
                <>
                    <ProfilePassword user={user} />
                    <ProfileSettings />
                </>
            )}
        </div>
    );
};