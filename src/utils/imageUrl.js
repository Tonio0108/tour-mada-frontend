import { BASE_URL } from "../../lib/api";

// Utilitaire pour construire les URLs des images correctement
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // Si l'URL de l'image est déjà complète, la retourner telle quelle
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Retourner l'URL complète de l'image
  return `${BASE_URL}${imageUrl}`;
};
