import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Star, MessageSquare, User, MapPin, Calendar, Loader2, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvisApi } from "@/lib/api";
import { SEO } from "@src/components/SEO";
import AgencyReviewDialog from "../../../components/AgencyReviewDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewsPage() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPublishedReviews = async () => {
      try {
        const data = await AvisApi.getPublishedReviews();
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPublishedReviews();
  }, []);

  const renderStars = (count) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= count ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
    );
  };

  const ReviewSkeleton = () => (
    <Card className="bg-background border-none shadow-lg">
      <CardContent className="p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-4 w-32 pt-4 border-t" />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/20 py-12 md:py-20">
      <SEO 
        title={t("reviews.title")} 
        description={t("client_reviews.seo_description")}
      />
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
          <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] uppercase tracking-widest font-bold border-primary text-primary">
            {t('client_reviews.header.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {t('client_reviews.header.title_start')}<span className="text-primary">{t('client_reviews.header.title_end')}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('client_reviews.header.subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {[...Array(4)].map((_, i) => <ReviewSkeleton key={i} />)}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-end gap-4 mb-8">
              <AgencyReviewDialog />
              <Button asChild variant="outline" className="font-bold">
                <Link to="/tours" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t("reviews.write_review")}
                </Link>
              </Button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-20 bg-background rounded-xl border border-dashed">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-6">{t("reviews.no_reviews")}</p>
                <Button variant="outline" asChild>
                  <Link to="/tours">{t('reviews.choose_tour_to_review')}</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {reviews.map((review) => (
                  <Card key={review.id_avis} className="bg-background border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-base">{review.client.prenom} {review.client.nom}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(review.date_avis).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {renderStars(review.note)}
                      </div>

                      <div className="relative">
                        <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/5" />
                        <p className="text-muted-foreground leading-relaxed italic relative z-10 pl-4">
                          "{review.commentaire}"
                        </p>
                      </div>

                      {review.tour ? (
                        <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5" />
                          {review.tour.nom_tour}
                        </div>
                      ) : (
                        <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{t('reviews.agency')}</Badge>
                          {t('navbar.brand')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
