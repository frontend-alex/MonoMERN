import { DotBackground } from "@/components/ui/backgrounds/dot-background";
import { config } from "@shared/config/config";

const Dashboard = () => {
  return (
    <div className="flex flex-1 w-full text-center items-center justify-center h-[calc(100dvh-100px)]">
      <DotBackground className="absolute top-0 h-[500px] z-1" />
      <div className="flex-col gap-4 z-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          MonoMERN Stack
        </h1>
        <p className="text-xl text-stone-400 mb-8 max-w-2xl mx-auto">
          Full-stack {config.app.name} boilerplate powered by MongoDB,
          Express, React, and Node.js — built for speed, scalability, and
          security.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
