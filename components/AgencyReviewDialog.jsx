import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AvisApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@src/hooks/useAuth";

export default function AgencyReviewDialog({ trigger }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

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
        // tourId est omis pour un avis général sur l'agence
      });
      toast.success(t("reviews.success"));
      setComment("");
      setRating(5);
      setOpen(false);
      // Optionnellement, on pourrait déclencher un rafraîchissement global des avis si nécessaire
    } catch (err) {
      toast.error(err.message || t("reviews.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-6 h-6 transition-colors cursor-pointer hover:scale-110",
              star <= count ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
            )}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <Button variant="outline" asChild className="group font-bold">
        <a href="/login" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 mr-2" />
          {t("reviews.write_agency_review")}
        </a>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="group font-bold">
            <MessageSquare className="w-4 h-4 mr-2" />
            {t("reviews.write_agency_review")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("reviews.write_agency_review")}</DialogTitle>
          <DialogDescription>
            {t("reviews.share_experience")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("reviews.your_rating")}
            </label>
            {renderStars(rating)}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("reviews.your_comment")}
            </label>
            <Textarea
              placeholder={t("reviews.placeholder")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none min-h-[120px] text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !comment.trim()} 
            className="w-full h-10"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {t("reviews.submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
