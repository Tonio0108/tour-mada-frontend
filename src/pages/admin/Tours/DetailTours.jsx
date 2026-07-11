import { Trash2, Pencil, ChevronDown, PlayCircle, Loader, Calendar, Clock, DollarSign, MapPin, CheckCircle2, AlertCircle, Info, ChevronLeft, MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Tours } from "../../../../lib/api";
import { getImageUrl, getFileUrl } from "../../../../src/utils/imageUrl";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DetailTours() {
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL;
  const [tour, setTour] = useState(null);
  const { id } = useParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [videoModal, setVideoModal] = useState({ open: false, url: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setLoading(true);
        const data = await Tours.getTourStandardsById(id);
        setTour(data);
      } catch (err) {
        console.error("Erreur :", err);
        toast.error("Impossible de charger les détails");
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const handleDelete = async () => {
    try {
      await Tours.deleteTourStandards(id);
      toast.success("Tour supprimé");
      navigate("/admin/tours");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );

  if (!tour) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="font-bold">Tour introuvable</p>
      <Button variant="outline" onClick={() => navigate("/admin/tours")}>Retour</Button>
    </div>
  );

  const images = tour.photos?.filter(photo => 
    photo.type === 'image' || photo.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  ) || [];

  const videos = tour.photos?.filter(photo => 
    photo.type === 'video' || photo.url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/tours")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{tour.nom_tour}</h2>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="bg-primary text-primary-foreground border-none">
                <DollarSign className="w-3 h-3 mr-1" /> {parseInt(tour.prix_par_pers)?.toLocaleString()} €
              </Badge>
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" /> {tour.duree_jours}j
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/admin/tours/${id}/edit`} className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Modifier
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)} className="text-destructive font-bold">
                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{tour.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Itinéraire
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tour.itineraires && tour.itineraires.length > 0 ? (
                <div className="space-y-4">
                  {tour.itineraires.map((it, idx) => (
                    <div key={it.id_itineraire} className="flex gap-4 p-4 rounded border bg-muted/20">
                      <div className="w-8 h-8 rounded bg-primary text-primary-foreground shrink-0 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{it.titre}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{it.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">Aucun itinéraire</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tour.Choses_apporter && tour.Choses_apporter.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tour.Choses_apporter.map((item) => (
                    <div key={item.id_item} className={cn("p-3 rounded border flex justify-between items-center", item.obligatoire ? "bg-destructive/5 border-destructive/20" : "bg-muted/20")}>
                      <span className="text-sm font-medium">{item.nom_item}</span>
                      {item.obligatoire && <Badge variant="destructive" className="text-[8px] h-4">Obligatoire</Badge>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">Rien à prévoir</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Photos ({images.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {images.length > 0 ? (
                images.map((photo) => (
                  <div key={photo.id_photo} className="aspect-video rounded overflow-hidden border">
                    <img
                      src={getImageUrl(photo.url)}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                ))
              ) : (
                <div className="aspect-video bg-muted rounded border flex items-center justify-center text-muted-foreground text-xs">
                  Aucune image
                </div>
              )}
            </CardContent>
          </Card>

          {videos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Vidéos ({videos.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {videos.map((video) => (
                  <div
                    key={video.id_photo}
                    className="relative aspect-video rounded overflow-hidden border cursor-pointer group"
                    onClick={() => setVideoModal({ open: true, url: getFileUrl(video.url) })}
                  >
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </div>
                    <video className="w-full h-full object-cover" preload="metadata">
                      <source src={`${getFileUrl(video.url)}#t=0.1`} />
                    </video>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <Dialog open={videoModal.open} onOpenChange={(open) => !open && setVideoModal({ open: false, url: "" })}>
        <DialogContent className="max-w-4xl p-0 bg-black overflow-hidden">
          <div className="aspect-video w-full">
            {videoModal.url && (
              <video controls autoPlay className="w-full h-full">
                <source src={videoModal.url} type="video/mp4" />
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce tour ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
