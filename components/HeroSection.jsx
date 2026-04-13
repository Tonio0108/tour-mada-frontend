import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Input } from "./ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search } from "lucide-react";

import { Card, CardContent } from "./ui/card";

const HeroSection = ({ bgImage, handleSearch, handleFilterChange, filters }) => {
  const { t } = useTranslation();

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-16">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="container mx-auto px-4 text-center text-white mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          {t("hero.title")}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          {t("hero.subtitle")}
        </p>
      </div>

      <div className="container mx-auto px-4">
        <Card className="max-w-5xl mx-auto bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-2xl">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                  {t("hero.price_per_person")}
                </label>
                <Select
                  value={filters.prix_par_pers}
                  onValueChange={(val) => handleFilterChange("prix_par_pers", val)}
                >
                  <SelectTrigger className="w-full bg-input border-input focus:ring-primary">
                    <SelectValue placeholder={t("hero.all_prices")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("hero.all_prices")}</SelectItem>
                    <SelectItem value="0-50000">{t("hero.price_0_50k")}</SelectItem>
                    <SelectItem value="50000-100000">{t("hero.price_50_100k")}</SelectItem>
                    <SelectItem value="100000-200000">{t("hero.price_100_200k")}</SelectItem>
                    <SelectItem value="200000-500000">{t("hero.price_200_500k")}</SelectItem>
                    <SelectItem value="500000">{t("hero.price_500k_plus")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                  {t("hero.duration")}
                </label>
                <Select
                  value={filters.duree_jours}
                  onValueChange={(val) => handleFilterChange("duree_jours", val)}
                >
                  <SelectTrigger className="w-full bg-input border-input focus:ring-primary">
                    <SelectValue placeholder={t("hero.all_durations")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("hero.all_durations")}</SelectItem>
                    <SelectItem value="1-3">{t("hero.duration_1_3")}</SelectItem>
                    <SelectItem value="4-7">{t("hero.duration_4_7")}</SelectItem>
                    <SelectItem value="8-14">{t("hero.duration_8_14")}</SelectItem>
                    <SelectItem value="14">{t("hero.duration_14_plus")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                  {t("hero.tour_name")}
                </label>
                <Input
                  type="text"
                  value={filters.nom_tour}
                  onChange={(e) => handleFilterChange("nom_tour", e.target.value)}
                  placeholder={t("hero.tour_placeholder")}
                  className="w-full bg-input border-input focus-visible:ring-primary"
                />
              </div>

              <Button type="submit" size="lg" className="w-full font-bold transition-all hover:opacity-90">
                <Search className="mr-2 h-4 w-4" /> {t("hero.search")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HeroSection;
