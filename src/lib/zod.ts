import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be 6+ chars"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password required"),
});
