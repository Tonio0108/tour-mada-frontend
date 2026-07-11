import { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  MapPin,
  Luggage,
  PlayCircle,
  FileText,
  X,
  Upload,
  Loader,
  Users,
  Clock,
  DollarSign,
} from "lucide-react";
import { getAuthToken } from "../../../../lib/api";
import { getImageUrl } from "../../../../src/utils/imageUrl";
import { Input } from "../../../../components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useParams, useNavigate } from "react-router";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const tourSchema = z.object({
  nom_tour: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description est trop courte"),
  prix_par_pers: z.coerce.number().min(1, "Le prix est requis"),
  duree_jours: z.coerce.number().min(1, "La durée est requise"),
  itineraries: z.array(z.object({
    titre: z.string().min(1, "Titre requis"),
    description: z.string().min(1, "Description requise"),
  })).min(1, "Ajoutez au moins une étape"),
  itemsToBring: z.array(z.object({
    item: z.string().min(1, "Nom requis"),
    obligatoire: z.boolean().default(false),
  })),
});

export default function UpdateTour() {
  const { id } = useParams();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL;
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const steps = [
    { title: "Infos", icon: FileText },
    { title: "Étapes", icon: MapPin },
    { title: "Checklist", icon: Luggage },
    { title: "Aperçu", icon: CheckCircle },
  ];

  const form = useForm({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      nom_tour: "",
      description: "",
      prix_par_pers: "",
      duree_jours: "",
      itineraries: [],
      itemsToBring: [],
    },
  });

  const { fields: itineraryFields, append: addItinerary, remove: removeItinerary } = useFieldArray({
    control: form.control,
    name: "itineraries",
  });

  const { fields: itemFields, append: addItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "itemsToBring",
  });

  useEffect(() => {
    const fetchTour = async () => {
      const token = await getAuthToken();
      try {
        setLoading(true);
        const res = await fetch(`${url}/tours-standards/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Impossible de récupérer le tour");
        const data = await res.json();

        const existingMedias = data.photos?.map((p) => {
          const isVideo = p.type === 'video' || p.url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i);
          return {
            id: p.id_photo,
            name: p.url.split("/").pop(),
            url: getImageUrl(p.url),
            type: isVideo ? 'video/mp4' : 'image/jpeg',
            isExisting: true
          };
        }) || [];

        setFileList(existingMedias);
        form.reset({
          nom_tour: data.nom_tour,
          description: data.description,
          prix_par_pers: data.prix_par_pers,
          duree_jours: data.duree_jours,
          itineraries: data.itineraires?.map(i => ({ titre: i.titre, description: i.description })) || [],
          itemsToBring: data.Choses_apporter?.map(c => ({ item: c.nom_item, obligatoire: c.obligatoire })) || [],
        });
      } catch (err) {
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id, form, url]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
      isExisting: false
    }));
    setFileList(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFileList(prev => prev.filter((_, i) => i !== index));
  };

  const next = async (e) => {
    e.preventDefault();
    const fieldsToValidate = {
      0: ["nom_tour", "description", "prix_par_pers", "duree_jours"],
      1: ["itineraries"],
      2: ["itemsToBring"],
    };
    const isStepValid = await form.trigger(fieldsToValidate[currentStep]);
    if (isStepValid) setCurrentStep(prev => prev + 1);
  };

  const prev = () => setCurrentStep(prev => prev - 1);

  const onSubmit = async (values) => {
    if (fileList.length === 0) {
      toast.error("Ajoutez au moins une image");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("nom_tour", values.nom_tour);
      formData.append("description", values.description);
      formData.append("prix_par_pers", String(values.prix_par_pers));
      formData.append("duree_jours", String(values.duree_jours));

      formData.append("itineraires", JSON.stringify(values.itineraries.map((it, idx) => ({
        jour: idx + 1,
        titre: it.titre,
        description: it.description
      }))));

      formData.append("choses_apporter", JSON.stringify(values.itemsToBring.map(it => ({
        nom_item: it.item,
        obligatoire: it.obligatoire
      }))));

      fileList.forEach(item => {
        if (!item.isExisting) {
          formData.append("medias", item.file);
        }
      });

      const existingMedia = fileList
        .filter(f => f.isExisting)
        .map(f => ({
          url: f.url.replace(url.replace('/api', ''), ''),
          type: f.type.startsWith('video') ? 'video' : 'image'
        }));
      formData.append("existingMedia", JSON.stringify(existingMedia));

      const token = await getAuthToken();
      const res = await fetch(`${url}/tours-standards/${id}/update-with-media`, {
        method: "PUT",
        body: formData,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erreur");
      toast.success("Mis à jour !");
      navigate(`/admin/tours`);
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
      <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Chargement...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Modifier le Circuit</h2>
          <p className="text-sm text-muted-foreground mt-1">Mettez à jour les informations du tour</p>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, idx) => (
          <div
            key={idx}
            role={idx < currentStep ? "button" : undefined}
            tabIndex={idx < currentStep ? 0 : undefined}
            onClick={() => idx < currentStep && setCurrentStep(idx)}
            onKeyDown={(e) => idx < currentStep && e.key === 'Enter' && setCurrentStep(idx)}
            className={cn(
              "flex flex-col items-center p-3 rounded border transition-all",
              currentStep === idx ? "bg-primary text-primary-foreground border-primary" : 
              currentStep > idx
                ? "bg-muted text-muted-foreground border-border cursor-pointer hover:bg-accent hover:text-accent-foreground"
                : "bg-background text-muted-foreground border-border"
            )}
          >
            <step.icon className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-bold uppercase">{step.title}</span>
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="nom_tour" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea {...field} className="min-h-[120px]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="prix_par_pers" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (€)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="duree_jours" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée (j)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Médias</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed rounded p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs font-medium">Ajouter</span>
                    <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                    {fileList.map((file, idx) => (
                      <div key={idx} className="relative aspect-square rounded overflow-hidden group border">
                        {file.type?.startsWith('video/') ? (
                          <div className="w-full h-full bg-muted flex items-center justify-center"><PlayCircle className="w-6 h-6 text-muted-foreground" /></div>
                        ) : (
                          <img src={file.url} className="w-full h-full object-cover" alt="" />
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        {file.isExisting && <Badge variant="secondary" className="absolute bottom-1 left-1 text-[8px] h-4">Existant</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 1 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Itinéraire</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => addItinerary({ titre: "", description: "" })}>
                  <Plus className="w-4 h-4 mr-2" /> Ajouter
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {itineraryFields.map((field, idx) => (
                  <div key={field.id} className="p-4 rounded border bg-muted/20 space-y-4 relative group">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItinerary(idx)} className="absolute top-2 right-2 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name={`itineraries.${idx}.titre`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jour {idx + 1} - Titre</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="md:col-span-2">
                        <FormField control={form.control} name={`itineraries.${idx}.description`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Checklist</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => addItem({ item: "", obligatoire: false })}>
                  <Plus className="w-4 h-4 mr-2" /> Ajouter
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {itemFields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-3 p-3 rounded border bg-muted/20">
                    <div className="flex-1">
                      <FormField control={form.control} name={`itemsToBring.${idx}.item`} render={({ field }) => (
                        <FormItem>
                          <FormControl><Input placeholder="Article..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded bg-background border">
                      <FormField control={form.control} name={`itemsToBring.${idx}.obligatoire`} render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel className="text-xs font-medium cursor-pointer">Obligatoire</FormLabel>
                        </FormItem>
                      )} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="overflow-hidden">
              <div className="p-6 bg-primary text-primary-foreground">
                <Badge variant="outline" className="mb-2 text-primary-foreground border-primary-foreground">Aperçu</Badge>
                <h3 className="text-2xl font-bold">{form.watch("nom_tour")}</h3>
                <div className="flex gap-4 mt-2 text-sm opacity-90">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {form.watch("duree_jours")}j</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {parseInt(form.watch("prix_par_pers"))?.toLocaleString()} €</span>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Description</h4>
                  <p className="text-sm">{form.watch("description")}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Itinéraire</h4>
                    <div className="space-y-2">
                      {form.watch("itineraries").map((it, i) => (
                        <div key={i} className="text-sm"><span className="font-bold">J{i+1}:</span> {it.titre}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Checklist</h4>
                    <div className="space-y-2">
                      {form.watch("itemsToBring").map((item, i) => (
                        <div key={i} className="text-sm flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", item.obligatoire ? "bg-destructive" : "bg-primary")}></div>
                          {item.item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-between items-center p-4 bg-background border rounded">
            <Button type="button" variant="ghost" onClick={prev} disabled={currentStep === 0 || saving}>
              Précédent
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={next}>Continuer</Button>
            ) : (
              <Button type="submit" disabled={saving} className="px-8">
                {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Enregistrer
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
