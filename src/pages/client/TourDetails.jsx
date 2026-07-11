import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useTranslation, Trans } from "react-i18next";
import { getAuthToken } from "@/lib/api";
import { useRole } from "../../hooks/useRole";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Info, 
  Trash2, 
  Pencil, 
  ChevronDown, 
  Loader2, 
  AlertCircle, 
  PlayCircle, 
  MapPin, 
  CheckCircle2,
  ChevronRight,
  Video,
  Users,
  Image as ImageIcon,
  X,
  FileText,
  Map as MapIcon,
  ShoppingBag,
  Maximize2,
  MessageSquare
} from "lucide-react";
import { SEO } from "../../components/SEO";
import ReviewSection from "../../components/ReviewSection";
import TourDetailsSkeleton from "@/components/TourDetailsSkeleton";
import { getImageUrl, getFileUrl } from "../../utils/imageUrl";

export default function TourDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL;
  const [activeTab, setActiveTab] = useState("description");
  const { isAdmin } = useRole();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaModal, setMediaModal] = useState({ open: false, url: "", type: "image" });

  const { data: tour, isLoading: loading, isError } = useQuery({
    queryKey: ["tour", id],
    queryFn: async () => {
      const response = await fetch(`${url}/tours-standards/${id}`);
      if (!response.ok) throw new Error(t("tour_details.messages.load_error"));
      return response.json();
    },
  });

  const handleDelete = async () => {
    try {
      const token = await getAuthToken();
      await fetch(`${url}/tours-standards/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t("tour_details.messages.delete_success"));
      setIsModalOpen(false);
      setTimeout(() => navigate("/admin/tours"), 1500);
    } catch (err) {
      console.error(err);
      toast.error(t("tour_details.messages.delete_error"));
    }
  };

  if (loading) return <TourDetailsSkeleton />;

  if (!tour) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <SEO title={t('tour_details.not_found')} />
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-bold mb-2">{t('tour_details.not_found')}</h2>
      <Button onClick={() => navigate("/tours")} variant="outline" size="sm">
        {t('tour_details.back_to_tours')}
      </Button>
    </div>
  );

  const images = tour.photos?.filter(m => !m.url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) || [];
  const videos = tour.photos?.filter(m => m.url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) || [];

  return (
    <div className="min-h-screen bg-muted/30 pb-20 overflow-x-hidden">
      <SEO 
        title={tour.nom_tour} 
        description={tour.description?.substring(0, 160) || t('home.seo.description')}
        image={images.length > 0 ? getImageUrl(images[0].url) : "/logo.jpg"}
        keywords={`${tour.nom_tour}, voyage madagascar, circuit touristique, ${tour.duree_jours} ${t('tour_details.days')}`}
      />
      {/* Hero Section */}
      <div className="relative h-80 w-full overflow-hidden bg-black">
        {images.length > 0 ? (
          <img 
            src={getImageUrl(images[0].url)} 
            alt={tour.nom_tour} 
            className="w-full h-full object-cover"
          />
        ) : videos.length > 0 ? (
          <video 
            src={getFileUrl(videos[0].url)} 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-primary/20 flex items-center justify-center" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="max-w-7xl mx-auto">
            <Badge className="mb-3 text-[10px] uppercase tracking-wider" variant="default">
              <MapPin className="w-3 h-3 mr-1" /> Madagascar
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {tour.nom_tour}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-xs font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {tour.duree_jours} {t('tour_details.days')}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-xs font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <Trans i18nKey="tour_details.pricing" values={{ price: tour.prix_par_pers?.toLocaleString() }} />
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-4 -mt-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Admin Controls */}
            {isAdmin && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-3 flex items-center justify-between">
                  <Badge variant="outline" className="bg-background text-[10px] uppercase tracking-widest">Admin</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                      <Link to={`/admin/tours/${id}/edit`}>
                        <Pencil size={12} className="mr-1.5" /> {t('admin_common.details')}
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsModalOpen(true)} className="h-8 text-xs">
                      <Trash2 size={12} className="mr-1.5" /> {t('admin_common.delete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {(images.length > 1 || videos.length > 0) && (
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" /> {t('tour_details.media.gallery_title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {images.slice(1).map((img) => (
                    <div 
                      key={img.id_photo} 
                      onClick={() => setMediaModal({ open: true, url: getImageUrl(img.url), type: "image" })}
                      className="aspect-square rounded-md overflow-hidden border cursor-pointer group relative"
                    >
                      <img src={getImageUrl(img.url)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Gallery" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                  {videos.map((vid) => (
                    <div 
                      key={vid.id_photo} 
                      onClick={() => setMediaModal({ open: true, url: getFileUrl(vid.url), type: "video" })}
                      onMouseEnter={(e) => e.currentTarget.querySelector('video').play()}
                      onMouseLeave={(e) => {
                        const v = e.currentTarget.querySelector('video');
                        v.pause();
                        v.currentTime = 0;
                      }}
                      className="aspect-square rounded-md overflow-hidden relative cursor-pointer border bg-black flex items-center justify-center group"
                    >
                      <video 
                        src={getFileUrl(vid.url)} 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-all">
                        <PlayCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform shadow-lg" />
                      </div>
                      <Badge className="absolute bottom-1.5 right-1.5 text-[8px] px-1 py-0 bg-primary/80 border-none">{t('tour_details.media.video_badge')}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Content Tabs */}
            <Card className="overflow-hidden">
              <div className="flex border-b bg-muted/20 overflow-x-auto scrollbar-hide">
                {[
                  { id: "description", icon: FileText, key: "description" },
                  { id: "itineraire", icon: MapIcon, key: "itinerary" },
                  { id: "conseils", icon: ShoppingBag, key: "tips" },
                  { id: "avis", icon: MessageSquare, key: "reviews" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-6 py-3 text-xs font-semibold transition-colors border-b-2 flex items-center justify-center gap-2 shrink-0 whitespace-nowrap",
                      activeTab === tab.id 
                        ? "border-primary text-primary bg-background" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{t(`tour_details.tabs.${tab.key}`)}</span>
                  </button>
                ))}
              </div>

              <CardContent className="p-6">
                {activeTab === "description" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full px-2 text-[9px] uppercase tracking-wider font-bold">{t('tour_details.description.badge')}</Badge>
                    </div>
                    <h2 className="text-lg font-bold text-foreground">{t('tour_details.description.title')}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">{tour.description}</p>
                  </div>
                )}

                {activeTab === "itineraire" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full px-2 text-[9px] uppercase tracking-wider font-bold">{t('tour_details.itinerary.badge')}</Badge>
                    </div>
                    <h2 className="text-lg font-bold text-foreground">{t('tour_details.itinerary.title')}</h2>
                    <div className="space-y-6">
                      {tour.itineraires?.sort((a, b) => a.jour - b.jour).map((step, index) => (
                        <div key={index} className="flex gap-4 group">
                          <div className="flex flex-col items-center">
                            <Badge className="w-7 h-7 rounded-full flex items-center justify-center p-0 text-xs font-bold shrink-0">
                              {step.jour || index + 1}
                            </Badge>
                            <div className="w-px flex-grow bg-muted mt-2 group-last:hidden" />
                          </div>
                          <div className="space-y-1 pb-6">
                            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{step.titre}</h3>
                            <p className="text-muted-foreground leading-relaxed text-xs">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "conseils" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full px-2 text-[9px] uppercase tracking-wider font-bold">{t('tour_details.tips.badge')}</Badge>
                    </div>
                    <h2 className="text-lg font-bold text-foreground">{t('tour_details.tips.title')}</h2>
                    {tour.Choses_apporter?.length === 0 ? (
                      <p className="text-muted-foreground italic text-xs">{t('tour_details.tips.no_items')}</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tour.Choses_apporter?.map((item) => (
                          <div key={item.id_item} className={cn(
                            "p-3 rounded-md border flex flex-col gap-1 transition-colors",
                            item.obligatoire ? "bg-destructive/5 border-destructive/20" : "bg-muted/10 border-transparent"
                          )}>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-xs">{item.nom_item}</h3>
                              {item.obligatoire && (
                                <Badge variant="destructive" className="text-[8px] px-1 py-0 font-bold uppercase">
                                  {t('tour_details.tips.mandatory')}
                                </Badge>
                              )}
                            </div>
                            {item.description && <p className="text-[11px] text-muted-foreground leading-tight">{item.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "avis" && (
                  <ReviewSection tourId={id} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary sticky top-20 overflow-hidden shadow-md">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t('hero.price_per_person')}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">{parseFloat(tour.prix_par_pers).toLocaleString()}</span>
                    <span className="text-xs font-bold text-muted-foreground">€</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs font-medium flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {t('hero.duration')}
                    </span>
                    <Badge variant="outline" className="font-bold px-2 py-0 text-[10px]">{tour.duree_jours} {t('tour_details.days')}</Badge>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate(`/tours/reservation/${tour.id_tour}`)}
                  className="w-full py-5 text-sm font-bold shadow-sm"
                  size="default"
                >
                  <Calendar className="w-4 h-4 mr-2" /> 
                  {t('tour_details.booking.reserve_button')}
                </Button>
                
                <p className="text-[9px] text-center text-muted-foreground font-semibold uppercase tracking-tight">
                  {t('tour_details.booking.limited_availability')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-none">
              <CardContent className="p-4">
                <h4 className="text-[10px] font-bold mb-3 uppercase tracking-widest text-primary">{t('tour_details.inclusion.title')}</h4>
                <ul className="space-y-2">
                  {[
                    { key: 'guide', icon: CheckCircle2 },
                    { key: 'activities', icon: CheckCircle2 },
                    { key: 'transport', icon: CheckCircle2 },
                    { key: 'support', icon: CheckCircle2 }
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                      <f.icon className="w-3 h-3 text-primary/60" /> {t(`tour_details.inclusion.${f.key}`)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{t('tour_details.delete_modal.title')}</DialogTitle>
            <DialogDescription className="text-xs">
              <Trans i18nKey="tour_details.delete_modal.description" values={{ tourName: tour.nom_tour }} components={{ strong: <strong /> }} />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="text-xs">{t('tour_details.delete_modal.cancel')}</Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="text-xs">{t('tour_details.delete_modal.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Preview Modal (Image & Video) */}
      <Dialog open={mediaModal.open} onOpenChange={(open) => !open && setMediaModal({ ...mediaModal, open: false })}>
        <DialogContent className="max-w-5xl p-0 bg-black overflow-hidden border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{t("tour_details.media.preview_title")}</DialogTitle>
            <DialogDescription>{t("tour_details.media.preview_desc")}</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-auto flex items-center justify-center bg-black/90">
            {mediaModal.type === "image" ? (
              <img src={mediaModal.url} className="max-w-full max-h-[85vh] object-contain" alt="Full Preview" />
            ) : (
              <div className="aspect-video w-full">
                <video controls autoPlay className="w-full h-full">
                  <source src={mediaModal.url} type="video/mp4" />
                </video>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMediaModal({ ...mediaModal, open: false })}
              className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
