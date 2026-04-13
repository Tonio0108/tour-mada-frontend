import { z } from "zod";

export const reservationSchema = z
  .object({
    tourId: z.number().optional(),
    nom_complet: z
      .string()
      .min(2, "Le nom complet doit contenir au moins 2 caractères"),
    nbre_jours: z.number().min(1, "Le nombre de jours doit être au moins 1"),
    adresse: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
    email: z.string().email("Veuillez entrer une adresse email valide"),
    num_tel: z
      .string()
      .min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres"),
    nombre_pers: z
      .number()
      .min(1, "Le nombre de personnes doit être au moins 1"),
    montant_total: z
      .number()
      .min(0, "Le montant total ne peut pas être négatif"),
    budget_estime: z
      .number()
      .min(0, "Le budget estimé ne peut pas être négatif"),
    date_tour_prevue: z
      .string()
      .min(1, "Veuillez sélectionner une date")
      .transform((str) => new Date(str)),
    nombre_jeune: z.number().min(0).optional().default(0),
    nombre_adulte: z.number().min(0).optional().default(0),
    nombre_enfant: z.number().min(0).optional().default(0),
    nombre_homme: z.number().min(0).optional().default(0),
    nombre_femme: z.number().min(0).optional().default(0),
    interets: z.string().optional(),
    age_plus_age: z.number().min(0, "L'âge doit être positif"),
    age_moins_age: z.number().min(0, "L'âge doit être positif"),
  })
  .refine(
    (data) =>
      data.nombre_adulte + data.nombre_jeune + data.nombre_enfant ===
      data.nombre_pers,
    {
      message:
        "La somme des catégories doit être égale au nombre total de personnes",
      path: ["nombre_pers"],
    }
  );
