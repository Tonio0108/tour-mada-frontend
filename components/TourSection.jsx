import { Link } from "react-router";
import { useTranslation, Trans } from 'react-i18next';
import TourCard from "./TourCard";
import TourCardSkeleton from "./TourCardSkeleton";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export const TourSection = ({ tours }) => {
  const { t } = useTranslation();

  return (
    <section id="tour" className="py-20 bg-muted/20 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground tracking-tight">
            <Trans i18nKey="tour.title" components={[<span className="text-primary font-semibold" />]} />
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-xl mx-auto leading-relaxed">
            {t('tour.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {!tours ? (
            [...Array(3)].map((_, i) => <TourCardSkeleton key={i} />)
          ) : tours.length > 0 ? (
            tours.slice(0, 3).map((tour) => {
              const firstImage = tour.photos?.find(photo => 
                photo.url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)
              );

              return (
                <TourCard 
                  key={tour.id_tour}
                  title={tour.nom_tour}
                  imageUrl={firstImage?.url}
                  navigateTo={`/tours/${tour.id_tour}`}
                  duration={tour.duree_jours}
                  price={tour.prix_par_pers}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground italic text-sm">{t('tour.no_tours') || "Aucun tour disponible pour le moment"}</p>
            </div>
          )}
        </div>

        {tours && tours.length > 3 && (
          <div className="text-center mt-12">
            <Link to="/tours">
              <Button size="lg" className="rounded px-10 font-medium text-sm gap-2 h-11 bg-primary hover:bg-primary/90 transition-colors">
                {t('tour.view_all_tours')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
