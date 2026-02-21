import AppLogo from "./AppLogo";

const Loading = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center ">
      <div className="flex flex-col items-center gap-4">
        <AppLogo />
      </div>
    </div>
  );
};

export { Loading };
