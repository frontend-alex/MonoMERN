import { cn } from "@/lib/utils";


export const DotBackground = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative flex h-[50rem] w-full items-center justify-center", className)}>
      {/* Dot pattern */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
        )}
      />
      {/* Gradient overlay to fade dots to transparent */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-gradient-to-b from-transparent via-transparent to-background",
          "dark:bg-gradient-to-b dark:from-transparent dark:via-transparent dark:to-background",
        )}
      />
    </div>
  );
}