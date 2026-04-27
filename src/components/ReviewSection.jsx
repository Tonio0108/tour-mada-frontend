import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star, MessageSquare, Send, Loader2, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AvisApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@src/hooks/useAuth";

export default function ReviewSection({ tourId }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await AvisApi.getByTour(tourId);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [tourId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("reviews.login_required"));
      return;
    }

    try {
      setSubmitting(true);
      await AvisApi.create({
        note: rating,
        commentaire: comment,
        tourId: tourId,
      });
      toast.success(t("reviews.success"));
      setComment("");
      setRating(5);
      fetchReviews();
    } catch (err) {
      toast.error(err.message || t("reviews.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("reviews.confirm_delete"))) return;
    try {
      await AvisApi.delete(id);
      toast.success(t("reviews.deleted"));
      fetchReviews();
    } catch (err) {
      toast.error(err.message || t("reviews.error_delete"));
    }
  };

  const renderStars = (count, interactive = false) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-4 h-4 transition-colors",
              star <= count ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30",
              interactive && "cursor-pointer hover:scale-110"
            )}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="rounded-full px-2 text-[9px] uppercase tracking-wider font-bold">Feedback</Badge>
      </div>
      <h2 className="text-lg font-bold text-foreground">{t("reviews.title")}</h2>

      {/* Formulaire de soumission */}
      {user ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="py-4 px-6">
            <CardTitle className="text-sm">{t("reviews.write_review")}</CardTitle>
            <CardDescription className="text-[11px]">{t("reviews.share_experience")}</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t("reviews.your_rating")}
              </label>
              {renderStars(rating, true)}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t("reviews.your_comment")}
              </label>
              <Textarea
                placeholder={t("reviews.placeholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none min-h-[100px] text-sm bg-background"
              />
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !comment.trim()} 
              className="w-full sm:w-auto h-9 text-xs"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 mr-2" />
              )}
              {t("reviews.submit")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="p-6 rounded-lg border border-dashed text-center space-y-3 bg-muted/20">
          <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("reviews.login_to_review")}</p>
          <Button variant="outline" size="sm" asChild>
            <a href="/login">{t("navbar.login")}</a>
          </Button>
        </div>
      )}

      {/* Liste des avis */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground italic text-sm">
            {t("reviews.no_reviews")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reviews.map((review) => (
              <Card key={review.id_avis} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">
                          {review.client.prenom} {review.client.nom}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(review.date_avis).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {renderStars(review.note)}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {review.commentaire}
                    </p>
                  </div>
                  {user && (user.type === "ADMIN" || user.id === review.client.utilisateurId) && (
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(review.id_avis)}
                        className="h-8 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        {t("common.delete")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
