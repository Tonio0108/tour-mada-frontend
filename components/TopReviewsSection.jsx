import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation, Trans } from "react-i18next";
import { Star, MessageSquare, Quote, ChevronRight, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { AvisApi } from "../lib/api";
import AgencyReviewDialog from "./AgencyReviewDialog";
import { Skeleton } from "./ui/skeleton";

export default function TopReviewsSection() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopReviews = async () => {
      try {
        const data = await AvisApi.getTopReviews();
        setReviews(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des avis:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopReviews();
  }, []);

  const ReviewSkeleton = () => (
    <Card className="bg-background border-none shadow-xl">
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStars = (count) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= count ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] uppercase tracking-widest font-bold border-primary text-primary">
              {t("reservations.reservation_card.custom_reservation")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              <Trans i18nKey="reviews.header.title" components={[<span className="text-primary" />]} />
            </h2>
            <p className="text-muted-foreground max-w-xl">
              {t("reviews.header.description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <AgencyReviewDialog />
            {reviews.length > 0 && (
              <Button variant="ghost" asChild className="group text-primary font-bold">
                <Link to="/avis" className="flex items-center gap-2">
                  {t("reviews.view_all_reviews")}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => <ReviewSkeleton key={i} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-background rounded-xl p-12 text-center border border-dashed max-w-2xl mx-auto">
            <Quote className="w-12 h-12 mx-auto text-primary/20 mb-4" />
            <p className="text-muted-foreground italic mb-6">
              {t("reviews.no_reviews")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <AgencyReviewDialog 
                trigger={
                  <Button size="lg" className="font-bold">
                    {t("reviews.write_agency_review_long")}
                  </Button>
                }
              />
              <Button asChild size="lg" variant="outline">
                <Link to="/tours">{t("reviews.choose_tour_to_review")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <Card key={review.id_avis} className="relative bg-background border-none shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-8 space-y-6">
                  <Quote className="absolute top-6 right-8 w-10 h-10 text-primary/5 -z-0" />
                  
                  <div className="flex flex-col gap-4 relative z-10">
                    {renderStars(review.note)}
                    <p className="text-muted-foreground leading-relaxed italic line-clamp-4">
                      "{review.commentaire}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-border relative z-10">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate">{review.client.prenom} {review.client.nom}</h4>
                      {review.tour ? (
                        <p className="text-[10px] text-primary font-medium truncate uppercase tracking-tighter">
                          {review.tour.nom_tour}
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-tighter flex items-center gap-1">
                          <Badge variant="secondary" className="text-[8px] px-1 py-0">{t("reviews.agency")}</Badge>
                          {t("reviews.agency_name")}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
