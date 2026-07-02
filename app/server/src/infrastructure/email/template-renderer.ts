import fs from "fs";
import path from "path";

import { createError } from "@/shared/errors/create-error";

export function getEmailTemplate(templateName: string): string {
  const templatePath = path.resolve(
    __dirname,
    `./templates/${templateName}.html`,
  );

  try {
    return fs.readFileSync(templatePath, "utf-8");
  } catch {
    throw createError("EMAIL_SENDING_FAILED");
  }
}
