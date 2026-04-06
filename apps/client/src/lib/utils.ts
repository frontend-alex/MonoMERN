import { zodResolver } from "@hookform/resolvers/zod";
import { clsx, type ClassValue } from "clsx";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import type z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getUserInitials = (username: string) =>
  username
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/**
 * Custom hook factory for creating forms with Zod validation
 * Must be called at the top level of a React component
 */
export const useFormWithSchema = <T extends z.ZodTypeAny>(
  schema: T,
  defaultValues: z.infer<T>
) =>
  useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });
