import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import trekking from "../../assets/trekking.jpg";
import { Tours as ToursApi } from "../../../lib/api";
import { useTranslation } from 'react-i18next';
import { getImageUrl } from "../../utils/imageUrl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/skeleton";
import TourCardSkeleton from "@/components/TourCardSkeleton";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  RefreshCw, 
  MapPin, 
  Clock, 
  CircleAlert,
  ChevronRight,
  Compass
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SEO } from "../../components/SEO";

const Tours = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const url = import.meta.env.VITE_API_URL;
  
  const [filters, setFilters] = useState({
    prix_par_pers: searchParams.get("prix") || "",
    duree_jours: searchParams.get("duree") || "",
    nom_tour: searchParams.get("nom") || "",
  });

  const { data: tours = [], isLoading: loading } = useQuery({
    queryKey: ["tours"],
    queryFn: ToursApi.getAllTourStandards,
  });

  const filteredTours = useMemo(() => {
    let result = [...tours];
    if (filters.prix_par_pers) {
      const [min, max] = filters.prix_par_pers.split("-").map(Number);
      result = result.filter((tour) => {
        const prix = Number(tour.prix_par_pers) || 0;
        return max ? (prix >= min && prix <= max) : (prix >= min);
      });
    }
    if (filters.duree_jours) {
      const [min, max] = filters.duree_jours.split("-").map(Number);
      result = result.filter((tour) => {
        const duree = tour.duree_jours || 0;
        return max ? (duree >= min && duree <= max) : (duree >= min);
      });
    }
    if (filters.nom_tour) {
      const term = filters.nom_tour.toLowerCase();
      result = result.filter((tour) => tour.nom_tour?.toLowerCase().includes(term));
    }
    return result;
  }, [tours, filters]);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    const params = {};
    if (newFilters.prix_par_pers) params.prix = newFilters.prix_par_pers;
    if (newFilters.duree_jours) params.duree = newFilters.duree_jours;
    if (newFilters.nom_tour) params.nom = newFilters.nom_tour;
    setSearchParams(params, { replace: true });
  };

  if (loading && tours.length === 0) return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      <div className="relative py-10 px-8 rounded-lg border bg-primary text-primary-foreground overflow-hidden shadow-sm">
        <Skeleton className="h-6 w-32 mb-3 bg-primary-foreground/20" />
        <Skeleton className="h-8 w-64 mb-2 bg-primary-foreground/20" />
        <Skeleton className="h-4 w-96 bg-primary-foreground/20" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <TourCardSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      <SEO 
        title={t("tours_page.seo.title")} 
        description={t("tours_page.seo.description")}
        keywords={t("tours_page.seo.keywords")}
      />
      {/* Hero Mini Section avec variables CSS */}
      <div className="relative py-10 px-8 rounded-lg border bg-primary text-primary-foreground text-left overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="outline" className="mb-3 text-primary-foreground border-primary-foreground/30 font-medium">
            {t("tours_page.title").replace(/<0>|<\/0>/g, "")} {new Date().getFullYear()}
          </Badge>
          <h1 className="text-2xl font-semibold mb-2 tracking-tight">
            {t("tours_page.hero_title")}
          </h1>
          <p className="text-primary-foreground/80 text-sm max-w-lg leading-relaxed">
            {t("tours_page.hero_subtitle")}
          </p>
        </div>
        <Compass className="absolute -right-2.5 -bottom-2.5 w-48 h-48 text-primary-foreground/5 rotate-12" />
      </div>

      {/* Barre de Filtres avec variables CSS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
            placeholder={t("tours_page.filters.tour_name_placeholder")} 
            className="pl-9 h-10 text-sm border-input" 
            value={filters.nom_tour}
            onChange={(e) => handleFilterChange("nom_tour", e.target.value)}
          />
        </div>
        <select 
          className="h-10 w-full rounded border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground"
          value={filters.prix_par_pers}
          onChange={(e) => handleFilterChange("prix_par_pers", e.target.value)}
        >
          <option value="">{t("tours_page.filters.all_budgets")}</option>
          <option value="0-500">{t("tours_page.filters.price_ranges.0-500")}</option>
          <option value="500-1000">{t("tours_page.filters.price_ranges.500-1000")}</option>
          <option value="1000">{t("tours_page.filters.price_ranges.1000")}</option>
        </select>
        <select 
          className="h-10 w-full rounded border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground"
          value={filters.duree_jours}
          onChange={(e) => handleFilterChange("duree_jours", e.target.value)}
        >
          <option value="">{t("tours_page.filters.all_durations")}</option>
          <option value="1-3">{t("tours_page.filters.duration_ranges.1-3")}</option>
          <option value="4-7">{t("tours_page.filters.duration_ranges.4-7")}</option>
          <option value="8-14">{t("tours_page.filters.duration_ranges.8-14")}</option>
          <option value="14">{t("tours_page.filters.duration_ranges.14")}</option>
        </select>
        <Button variant="outline" onClick={() => { setFilters({prix_par_pers:"", duree_jours:"", nom_tour:""}); setSearchParams({}); }} className="h-10 text-sm font-medium">
          <RefreshCw className="w-4 h-4 mr-2" /> {t("tours_page.filters.reset")}
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-1">
        <span>
          {filteredTours.length > 1 
            ? t("tours_page.available_tours_plural", { count: filteredTours.length }) 
            : t("tours_page.available_tours", { count: filteredTours.length })}
        </span>
      </div>

      {/* Grille des Tours */}
      {filteredTours.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => {
            const firstImage = tour.photos?.find(p => p.type === 'image' || p.url.match(/\.(jpg|jpeg|png|webp)$/i));
            return (
              <Card key={tour.id_tour} className="overflow-hidden group flex flex-col h-full text-left p-0 border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                <div className="relative aspect-[16/10] overflow-hidden shrink-0">
                  <img
                    src={firstImage ? getImageUrl(firstImage.url) : trekking}
                    alt={tour.nom_tour}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = trekking; }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary hover:bg-primary border-none shadow-sm font-semibold text-[10px] text-primary-foreground" variant="default">
                      {Number(tour.prix_par_pers).toLocaleString()} €
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {tour.nom_tour}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-5 pt-0 flex-grow">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {tour.description || t("tour.default_description")}
                  </p>
                </CardContent>
                
                <CardFooter className="p-5 pt-4 border-t border-border flex items-center justify-between mt-auto">
                  <div className="flex gap-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {tour.duree_jours}{t("tours_page.tour_card.days")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {t("tour.location")}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-8 px-3 text-xs gap-1 hover:bg-primary/10 hover:text-primary transition-colors">
                    <Link to={`/tours/${tour.id_tour}`}>
                      {t("tours_page.tour_card.learn_more")} <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed rounded-lg bg-muted/20">
          <CircleAlert className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-base font-medium text-foreground">{t("tours_page.no_results.title")}</h3>
          <p className="text-xs text-muted-foreground mb-6">{t("tours_page.no_results.description")}</p>
          <Button onClick={() => { setFilters({prix_par_pers:"", duree_jours:"", nom_tour:""}); setSearchParams({}); }} variant="outline" size="sm" className="font-medium">
            {t("tours_page.no_results.reset_filters")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Tours;
