import { Loading } from "@/components/Loading";
import { useAuth } from "@/contexts/AuthContext";
import { useDynamicPartials, type ModuleLoader } from "@/hooks/use-partials";

const partialModules = import.meta.glob("./partials/*.tsx") as ModuleLoader;

const Profile = () => {
  const { user, isLoading, refetch } = useAuth();

  const partials = useDynamicPartials({
    partialModules,
    user,
    refetchUser: refetch,
    reverseOrder: false,
  });

  if (isLoading) {
    return <Loading />;
  }

  return <div className="flex-col-3 max-w-3xl">{partials}</div>;
};

export default Profile;