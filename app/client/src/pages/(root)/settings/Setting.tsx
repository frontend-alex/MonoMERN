import ChangeTheme from "./components/ChangeTheme";

import { useAuth } from "@/contexts/auth-context";
import { Loading } from "@/components/feedback/loading";


const Profile = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ChangeTheme />
  );
};

export default Profile;