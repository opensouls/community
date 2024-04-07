import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_OPENSOULS_ORG: z.string().min(1, "Organization id is required"),
  NEXT_PUBLIC_OPENSOULS_BLUEPRINT: z.string().min(1, "Blueprint id is required"),
  NEXT_PUBLIC_USER_AVATAR: z.string(),
});

export const env = schema.parse(process.env);
