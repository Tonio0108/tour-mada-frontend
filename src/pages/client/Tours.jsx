import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import trekking from "../../assets/trekking.jpg";
import { Tours as ToursApi } from "../../../lib/api";
import { useTranslation, Trans } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Search, RefreshCw, BookOpen, MapPin, Calendar, CircleAlert } from "lucide-react";

const Tours = () => {
  const { t } = useTranslation();
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const urlPrix = searchParams.get("prix") || "";
  const urlDuree = searchParams.get("duree") || "";
  const urlNom = searchParams.get("nom") || "";
  const url = import.meta.env.VITE_API_URL;
  const [filters, setFilters] = useState({
    prix_par_pers: urlPrix,
    duree_jours: urlDuree,
    nom_tour: urlNom,
  });

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const data = await ToursApi.getAllTourStandards();
        setTours(data);
        setLoading(false);

        // Appliquer les filtres après le chargement des données
        applyFilters(
          {
            prix_par_pers: urlPrix,
            duree_jours: urlDuree,
            nom_tour: urlNom,
          },
          data
        );
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchTours();
  }, [urlPrix, urlDuree, urlNom]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value,
    };
    setFilters(newFilters);
    applyFilters(newFilters);

    // Mettre à jour les paramètres d'URL
    const newSearchParams = new URLSearchParams();
    if (newFilters.prix_par_pers)
      newSearchParams.set("prix", newFilters.prix_par_pers);
    if (newFilters.duree_jours)
      newSearchParams.set("duree", newFilters.duree_jours);
    if (newFilters.nom_tour) newSearchParams.set("nom", newFilters.nom_tour);
    setSearchParams(newSearchParams);
  };

  const applyFilters = (currentFilters, toursData = tours) => {
    let result = [...toursData];

    // Filtre par prix
    if (currentFilters.prix_par_pers) {
      const [min, max] = currentFilters.prix_par_pers.split("-").map(Number);
      result = result.filter((tour) => {
        const prix = tour.prix_par_pers || 0;
        if (max) {
          return prix >= min && prix <= max;
        } else {
          return prix >= min;
        }
      });
    }

    // Filtre par durée
    if (currentFilters.duree_jours) {
      const [min, max] = currentFilters.duree_jours.split("-").map(Number);
      result = result.filter((tour) => {
        const duree = tour.duree_jours || 0;
        if (max) {
          return duree >= min && duree <= max;
        } else {
          return duree >= min;
        }
      });
    }

    // Filtre par nom du tour (recherche textuelle)
    if (currentFilters.nom_tour) {
      const searchTerm = currentFilters.nom_tour.toLowerCase();
      result = result.filter((tour) => {
        // Recherche dans le nom du tour
        if (tour.nom_tour && tour.nom_tour.toLowerCase().includes(searchTerm)) {
          return true;
        }

        return false;
      });
    }

    setFilteredTours(result);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters(filters);

    // Mettre à jour les paramètres d'URL
    const newSearchParams = new URLSearchParams();
    if (filters.prix_par_pers)
      newSearchParams.set("prix", filters.prix_par_pers);
    if (filters.duree_jours) newSearchParams.set("duree", filters.duree_jours);
    if (filters.nom_tour) newSearchParams.set("nom", filters.nom_tour);
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    const newFilters = {
      prix_par_pers: "",
      duree_jours: "",
      nom_tour: "",
    };
    setFilters(newFilters);
    setFilteredTours(tours);

    // Effacer les paramètres d'URL
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('tours_page.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec titre et nombre de résultats */}
        <div className="text-center mt-16 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-emerald-800">
            <Trans 
              i18nKey="tours_page.title" 
              components={[<span className="text-emerald-600" />]}
            />
          </h1>
          <p className="text-lg text-gray-700">
            <Trans 
              i18nKey={filteredTours.length === 1 ? 'tours_page.available_tours' : 'tours_page.available_tours_plural'}
              values={{ count: filteredTours.length }}
            />
          </p>
        </div>

        {/* Barre de recherche identique à la page d'accueil */}
        <div className="bg-white rounded shadow-xl overflow-hidden mb-12 border border-border">
          <div className="flex flex-col md:flex-row">
            {/* Prix par personne */}
            <div className="flex-1 border-r border-gray-200 p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {t('tours_page.filters.price_per_person')}
              </label>
              <select
                value={filters.prix_par_pers}
                onChange={(e) =>
                  handleFilterChange("prix_par_pers", e.target.value)
                }
                className="w-full text-lg font-medium text-gray-800 bg-transparent focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">{t('tours_page.filters.all_budgets')}</option>
                <option value="0-50000">{t('tours_page.filters.price_ranges.0-50000')}</option>
                <option value="50000-100000">{t('tours_page.filters.price_ranges.50000-100000')}</option>
                <option value="100000-200000">{t('tours_page.filters.price_ranges.100000-200000')}</option>
                <option value="200000-500000">{t('tours_page.filters.price_ranges.200000-500000')}</option>
                <option value="500000">{t('tours_page.filters.price_ranges.500000')}</option>
              </select>
            </div>

            {/* Durée */}
            <div className="flex-1 border-r border-gray-200 p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {t('tours_page.filters.duration')}
              </label>
              <select
                value={filters.duree_jours}
                onChange={(e) =>
                  handleFilterChange("duree_jours", e.target.value)
                }
                className="w-full text-lg font-medium text-gray-800 bg-transparent focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">{t('tours_page.filters.all_durations')}</option>
                <option value="1-3">{t('tours_page.filters.duration_ranges.1-3')}</option>
                <option value="4-7">{t('tours_page.filters.duration_ranges.4-7')}</option>
                <option value="8-14">{t('tours_page.filters.duration_ranges.8-14')}</option>
                <option value="14">{t('tours_page.filters.duration_ranges.14')}</option>
              </select>
            </div>

            {/* Nom du tour (input texte) */}
            <div className="flex-1 p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {t('tours_page.filters.tour_name')}
              </label>
              <Input
                type="text"
                value={filters.nom_tour}
                onChange={(e) => handleFilterChange("nom_tour", e.target.value)}
                placeholder={t('tours_page.filters.tour_name_placeholder')}
                className="w-full text-lg font-medium text-gray-800 bg-transparent focus-visible:ring-0 border-none p-0 h-auto"
              />
            </div>

            {/* Boutons de recherche et réinitialisation */}
            <div className="flex items-center justify-center p-4 md:p-2 space-x-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center whitespace-nowrap"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('tours_page.filters.reset')}
              </Button>
              <Button
                onClick={handleSearch}
                className="flex items-center whitespace-nowrap"
              >
                <Search className="h-4 w-4 mr-2" />
                {t('tours_page.filters.filter')}
              </Button>
            </div>
          </div>
        </div>

        {/* Grille des tours */}
        {filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => {
              // Séparer les images des vidéos
              const images = tour.photos?.filter(photo => 
                photo.url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)
              ) || [];
              
              const videos = tour.photos?.filter(photo => 
                photo.url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)
              ) || [];
              
              const firstImage = images[0];
              const hasOnlyVideos = images.length === 0 && videos.length > 0;

              return (
                <div key={tour.id_tour} className="h-full">
                  <div className="bg-white rounded overflow-hidden border border-border transition-all duration-300 h-full flex flex-col group hover:shadow-lg">
                    
                    {/* Section Image/Video */}
                    <div className="relative h-56 overflow-hidden flex-shrink-0">
                      {firstImage ? (
                        // Afficher une image
                        <div className="h-56 bg-black/10 rounded-t overflow-hidden">
                          <img
                            src={`${url.replace('/api', '')}${firstImage.url}`}
                            alt={tour.nom_tour}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.target.src = trekking;
                            }}
                          />
                        </div>
                      ) : hasOnlyVideos ? (
                        // Afficher une placeholder pour vidéo
                        <div className="h-56 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center rounded-t">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-white opacity-80 mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-white text-sm font-medium">
                            {t('tours_page.tour_card.video_available')}
                          </span>
                          <span className="text-gray-400 text-xs mt-1">
                            {videos.length} {t(videos.length > 1 ? 'tours_page.tour_card.videos_count_plural' : 'tours_page.tour_card.videos_count')}
                          </span>
                        </div>
                      ) : (
                        // Aucun média - afficher placeholder
                        <div className="h-56 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center rounded-t">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-emerald-600 opacity-50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
                      {/* Titre et localisation */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                          {tour.nom_tour}
                        </h3>
                        <div className="flex items-center">
                          <MapPin className="text-emerald-300 mr-1 w-4 h-4" />
                          <span className="text-emerald-200 text-sm">
                            {t('tours_page.tour_card.location')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contenu de la carte */}
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="mb-5 flex-grow">
                        {/* Description */}
                        <p className="text-gray-600 line-clamp-3 mb-4">
                          {tour.description_courte ||
                            t('tours_page.tour_card.default_description')}
                        </p>
                        
                        {/* Informations durée et prix */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="mr-1 text-emerald-600 w-4 h-4" />
                            <span>
                              {tour.duree_jours ? 
                                `${tour.duree_jours} ${t(tour.duree_jours > 1 ? 'tours_page.tour_card.days_plural' : 'tours_page.tour_card.days')}` 
                                : t('tours_page.tour_card.not_specified')
                              }
                            </span>
                          </div>
                          {tour.prix_par_pers && (
                            <div className="text-emerald-700 font-bold text-lg">
                              {tour.prix_par_pers.toLocaleString()} Ar
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bouton d'action */}
                      <div className="mt-auto">
                        <Button
                          asChild
                          className="w-full h-12 group-hover:shadow-lg group-hover:scale-105 transition-all"
                        >
                          <Link to={`/tours/${tour.id_tour}`}>
                            <span>{t('tours_page.tour_card.learn_more')}</span>
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded shadow-lg border border-border">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-6">
              <CircleAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('tours_page.no_results.title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('tours_page.no_results.description')}
            </p>
            <Button
              onClick={clearFilters}
              className="px-6"
            >
              {t('tours_page.no_results.reset_filters')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tours;

