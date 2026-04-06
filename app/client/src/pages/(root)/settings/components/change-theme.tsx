import { Separator } from "@/components/ui/separator";
import { LaptopMinimal, Moon, Sun } from "lucide-react";
import { type Theme, useTheme } from "@/contexts/theme-context";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ChangeTheme = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-stone-400">
          Manage your account preferences and application appearance.
        </p>
      </div>

      <Separator />
      <div className="grid grid-cols-3 gap-8 items-start">
        <div>
          <h2 className="text-lg font-medium">Appearance</h2>
          <p className="text-sm text-stone-400">
            Choose your preferred theme. This will affect how the app looks.
          </p>
        </div>

        <div className="col-span-2 space-y-4">
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(value: Theme) => {
              if (value) setTheme(value);
            }}
            defaultValue={theme}
            className="w-full lg:w-[350px]"
          >
            <ToggleGroupItem value="light">
              <Sun /> Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark">
              <Moon />
              Dark
            </ToggleGroupItem>
            <ToggleGroupItem value="system">
              <LaptopMinimal />
              System
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
};

export default ChangeTheme;
