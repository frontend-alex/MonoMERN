import { AccountProviders, type User } from "@shared/types/user";

import UpdateProfileInfo from "./components/update-profile";
import ProfilePassword from "./components/update-profile-pass";
import ProfileSettings from "./components/delete-profile";

export const ProfileView = ({ user }: { user: User }) => {
    return (
        <div className="flex flex-col gap-10">
            <UpdateProfileInfo user={user} />
            {user.provider === AccountProviders.Credentials && (
                <>
                    <ProfilePassword user={user} />
                    <ProfileSettings />
                </>
            )}
        </div>
    );
};