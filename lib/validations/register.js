import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z
      .string({ message: "Le prénom est obligatoire" })
      .min(1, "Le prénom est obligatoire"),
    lastName: z.string().min(1, "Le nom est obligatoire"),
    email: z
      .string({ message: "L'adresse email est obligatoire" })
      .min(1, "L'adresse email est obligatoire")
      .email({ message: "Veuillez entrer une adresse email valide" }),
    phone: z.string().optional().or(z.literal("")),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
    address: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    postalCode: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
