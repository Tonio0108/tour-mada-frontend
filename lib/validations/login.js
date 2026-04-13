import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Veuillez entrer une adresse email"),
  password: z.string().min(1, "Le mot de passe est requis"),
  rememberMe: z.boolean().optional(),
});
