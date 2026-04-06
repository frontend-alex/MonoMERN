import { Loading } from "@/components/feedback/loading";
import { useAuth } from "@/contexts/auth-context";
import { ProfileView } from "@/features/profile/profile-view";

const Profile = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <ProfileView user={user} />
  );
};

export default Profile;