import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Star, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Search,
  MessageSquare,
  User,
  MapPin,
  Calendar,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { AvisApi } from "@/lib/api";

export default function AdminReviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [starFilter, setStarFilter] = useState("all");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await AvisApi.getAll();
      setReviews(data);
    } catch (err) {
      console.error(err);
      toast.error(t('admin_reviews.toast.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await AvisApi.updateStatus(id, !currentStatus);
      toast.success(currentStatus ? t('admin_reviews.toast.hidden_success') : t('admin_reviews.toast.published_success'));
      fetchReviews();
    } catch (err) {
      toast.error(t('admin_reviews.toast.status_error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin_reviews.delete_confirm'))) return;
    try {
      await AvisApi.delete(id);
      toast.success(t('admin_reviews.toast.delete_success'));
      fetchReviews();
    } catch (err) {
      toast.error(t('admin_reviews.toast.delete_error'));
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = 
      r.commentaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tour?.nom_tour.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStars = starFilter === "all" || r.note === parseInt(starFilter);
    
    return matchesSearch && matchesStars;
  });

  const renderStars = (count) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= count ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('admin_reviews.title')}</h2>
          <p className="text-muted-foreground text-sm">{t('admin_reviews.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin_reviews.search_placeholder')}
              className="pl-9 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={starFilter} onValueChange={setStarFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-10">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder={t('admin_reviews.all_stars')} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin_reviews.all_stars')}</SelectItem>
              {[5, 4, 3, 2, 1].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  <div className="flex items-center gap-1">
                    {num} {num > 1 ? t('admin_reviews.stars') : t('admin_reviews.star')}
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="border-dashed py-20">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg">{t('admin_reviews.no_reviews')}</h3>
            <p className="text-muted-foreground text-sm">{t('admin_reviews.no_reviews_desc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.map((review) => (
            <Card key={review.id_avis} className={`overflow-hidden border-l-4 ${review.publie ? "border-l-green-500" : "border-l-amber-500"}`}>
              <CardContent className="p-0">
                <div className="p-5 flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{review.client.prenom} {review.client.nom}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(review.date_avis).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {renderStars(review.note)}
                        <Badge variant={review.publie ? "success" : "warning"} className="text-[10px] uppercase px-1.5 py-0">
                          {review.publie ? t('admin_reviews.published') : t('admin_reviews.hidden')}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="text-sm italic text-muted-foreground">"{review.commentaire}"</p>
                    </div>

                    {review.tour && (
                      <div className="flex items-center gap-2 text-[11px] font-medium text-primary">
                        <MapPin className="w-3 h-3" />
                        {t('admin_reviews.concerning')} {review.tour.nom_tour}
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col justify-end gap-2 shrink-0 md:border-l md:pl-6 md:min-w-[140px]">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`h-9 text-xs justify-start ${review.publie ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}`}
                      onClick={() => handleToggleStatus(review.id_avis, review.publie)}
                    >
                      {review.publie ? (
                        <><XCircle className="w-3.5 h-3.5 mr-2" /> {t('admin_reviews.hide')}</>
                      ) : (
                        <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> {t('admin_reviews.publish')}</>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 text-xs justify-start text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(review.id_avis)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> {t('admin_common.delete')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
