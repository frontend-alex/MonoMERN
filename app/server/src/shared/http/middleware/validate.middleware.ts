import z from "zod";
import type { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export function validate(
  schema: ZodSchema,
  target: "body" | "query" | "params" = "body",
  wrapKey?: string,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    let schemaToUse: ZodSchema;

    if (wrapKey && !(schema instanceof z.ZodObject)) {
      schemaToUse = z.object({ [wrapKey]: schema });
    } else {
      schemaToUse = schema;
    }

    const result = schemaToUse.safeParse(req[target]);

    if (!result.success) {
      const formattedErrors = result.error.format();

      res.status(400).json({
        message: "Validation error",
        errors: formattedErrors,
      });

      return;
    }

    req[target] = result.data;
    next();
  };
}
