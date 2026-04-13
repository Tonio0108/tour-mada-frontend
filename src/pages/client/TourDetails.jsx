import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { getAuthToken } from "@/lib/api";
import { useRole } from "@src/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Calendar, Clock, DollarSign, Info, Trash2, Pencil, ArrowDown, PlayCircle, ImageIcon, X } from "lucide-react";

export default function TourDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL;
  const [tour, setTour] = useState(null);
  const [activeTab, setActiveTab] = useState("itineraire");
  const { isAdmin } = useRole();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoModal, setVideoModal] = useState({ open: false, url: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${url}/tours-standards/${id}`);
        if (!response.ok) throw new Error("Erreur lors du chargement du tour");
        const data = await response.json();
        setTour(data);
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les détails du tour");
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id, url]);

  const handleDelete = async () => {
    try {
      const token = await getAuthToken();
      await fetch(`${url}/tours-standards/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Le tour a été supprimé avec succès.");
      setIsModalOpen(false);
      setTimeout(() => navigate("/admin/tours"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="h-12 w-12 animate-spin text-emerald-600" />
    </div>
  );

  if (!tour) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-xl font-bold text-gray-900 mb-6">Tour introuvable</p>
      <Button onClick={() => navigate("/admin/tours")}>Retour au catalogue</Button>
    </div>
  );

  const images = tour.photos?.filter(m => !m.url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) || [];
  const videos = tour.photos?.filter(m => m.url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) || [];

  return (
    <section className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded border border-border shadow-sm overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 bg-gray-100">
              {images.length > 0 ? (
                <Carousel className="w-full h-96">
                  <CarouselContent>
                    {images.map((img) => (
                      <CarouselItem key={img.id_photo} className="h-96">
                        <img src={`${url.replace('/api', '')}${img.url}`} alt={tour.nom_tour} className="w-full h-full object-cover" />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              ) : (
                <div className="h-96 flex items-center justify-center bg-emerald-800 text-white font-bold">{t('tour_details.media.no_media')}</div>
              )}
            </div>

            <div className="md:w-1/2 p-6 flex flex-col">
              <div className="flex-grow">
                <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">{tour.nom_tour}</h1>
                <p className="text-gray-600 mb-6">{tour.description}</p>
              </div>

              <div className="space-y-4 mt-auto">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-700"><Clock className="h-5 w-5 mr-2 text-emerald-600" /><span>{tour.duree_jours} {t('tour_details.days')}</span></div>
                  <div className="flex items-center text-gray-700"><DollarSign className="h-5 w-5 mr-2 text-emerald-600" /><span><Trans i18nKey="tour_details.pricing" values={{ price: tour.prix_par_pers?.toLocaleString() }} /></span></div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                          {t('tour_details.admin.options')} <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/tours/${id}/edit`} className="flex items-center gap-2"><Pencil size={16} /> {t('tour_details.admin.edit')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsModalOpen(true)} className="text-red-600 flex items-center gap-2"><Trash2 size={16} /> {t('tour_details.admin.delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                <Link to={`/tours/reservation/${tour.id_tour}`} className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 font-semibold">
                    <Calendar className="w-5 h-5 mr-2" /> {t('tour_details.book_tour')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white mb-8 overflow-hidden rounded border border-border">
        <div className="flex flex-wrap border-b">
          {["itineraire", "conseils", "description"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === tab ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-500 hover:text-emerald-700"}`}
            >
              {t(`tour_details.tabs.${tab === 'itineraire' ? 'itinerary' : tab === 'conseils' ? 'tips' : 'description'}`)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('tour_details.description.title')}</h2>
              <p className="text-gray-700 leading-relaxed">{tour.description}</p>
            </div>
          )}

          {activeTab === "itineraire" && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">{t('tour_details.itinerary.title')}</h2>
              <div className="space-y-6">
                {tour.itineraires?.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">{index + 1}</div>
                    <div>
                      <h3 className="font-bold text-emerald-800">{step.titre}</h3>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "conseils" && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center"><Info className="w-5 h-5 mr-2 text-yellow-500" /> {t('tour_details.tips.title')}</h2>
              {tour.Choses_apporter?.length === 0 ? (
                <p className="text-gray-600">{t('tour_details.tips.no_items')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.Choses_apporter?.map((item) => (
                    <div key={item.id_item} className={`p-4 rounded border ${item.obligatoire ? "border-red-200 bg-red-50" : "border-border bg-gray-50"}`}>
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-800">{item.nom_item}</h3>
                        {item.obligatoire && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">{t('tour_details.tips.mandatory')}</span>}
                      </div>
                      {item.description && <p className="mt-2 text-sm text-gray-600">{item.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">Supprimer ce tour ?</DialogTitle>
            <DialogDescription className="text-gray-500 mt-2 leading-relaxed">
              Vous allez supprimer définitivement <span className="font-bold text-gray-900">{tour.nom_tour}</span>. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="h-12 px-6 font-bold text-gray-500">Annuler</Button>
            <Button variant="destructive" onClick={handleDelete} className="h-12 px-8 font-bold flex-1">Supprimer définitivement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={videoModal.open} onOpenChange={(open) => !open && setVideoModal({ open: false, url: "" })}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <video controls autoPlay className="w-full h-auto max-h-[80vh]"><source src={videoModal.url} type="video/mp4" /></video>
        </DialogContent>
      </Dialog>
    </section>
  );
}
