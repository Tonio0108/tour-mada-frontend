import { useState } from "react";
import {
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Image as ImageIcon,
  MapPin,
  Luggage,
  PlayCircle,
  FileText,
  DollarSign,
  Clock,
  X,
  Upload,
  Loader,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Tours as ToursService } from "../../../../lib/api";
import { Input } from "../../../../components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
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
    step: z.string().min(1, "Description requise"),
  })).min(1, "Ajoutez au moins une étape"),
  itemsToBring: z.array(z.object({
    item: z.string().min(1, "Nom requis"),
    obligatoire: z.boolean().default(false),
  })),
});

export default function NewTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

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
      itineraries: [{ titre: "", step: "" }],
      itemsToBring: [{ item: "", obligatoire: false }],
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      
      if (!isImage && !isVideo) {
        toast.error(`${file.name} non supporté`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} trop volumineux`);
        return false;
      }
      return true;
    });

    setFileList(prev => [...prev, ...validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type
    }))]);
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
    if (isStepValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prev = () => setCurrentStep(prev => prev - 1);

  const onSubmit = async (values) => {
    if (fileList.length === 0) {
      toast.error("Ajoutez au moins une image");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nom_tour", values.nom_tour);
      formData.append("description", values.description);
      formData.append("prix_par_pers", String(values.prix_par_pers));
      formData.append("duree_jours", String(values.duree_jours));

      formData.append("itineraires", JSON.stringify(values.itineraries.map((it, idx) => ({
        jour: idx + 1,
        titre: it.titre,
        description: it.step
      }))));

      formData.append("choses_apporter", JSON.stringify(values.itemsToBring.map(it => ({
        nom_item: it.item,
        obligatoire: it.obligatoire
      }))));

      fileList.forEach(item => {
        if (item.file.type.startsWith("image/")) {
          formData.append("images", item.file);
        } else {
          formData.append("videos", item.file);
        }
      });

      await ToursService.createTourStandard(formData);
      toast.success("Tour créé !");
      window.history.back();
    } catch (err) {
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Nouveau Circuit</h2>
          <p className="text-sm text-muted-foreground mt-1">Créez une nouvelle offre de voyage</p>
        </div>
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
      </div>

      {/* Stepper Simplifié */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, idx) => (
          <div key={idx} className={cn(
            "flex flex-col items-center p-3 rounded border transition-all",
            currentStep === idx ? "bg-primary text-primary-foreground border-primary" : 
            currentStep > idx ? "bg-muted text-muted-foreground border-border" : "bg-background text-muted-foreground border-border"
          )}>
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
                      <FormControl><Input placeholder="Nom du circuit" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Détails..." {...field} className="min-h-[120px]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="prix_par_pers" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (Ar)</FormLabel>
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
                      <div key={idx} className="relative aspect-square rounded overflow-hidden group">
                        {file.type.startsWith('video/') ? (
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
                <div>
                  <CardTitle>Itinéraire</CardTitle>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => addItinerary({ titre: "", step: "" })}>
                  <Plus className="w-4 h-4 mr-2" /> Ajouter un jour
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {itineraryFields.map((field, index) => (
                  <div key={field.id} className="p-4 rounded border bg-muted/20 space-y-4 relative group">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItinerary(index)} className="absolute top-2 right-2 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name={`itineraries.${index}.titre`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jour {index + 1} - Titre</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="md:col-span-2">
                        <FormField control={form.control} name={`itineraries.${index}.step`} render={({ field }) => (
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
                <div>
                  <CardTitle>Checklist</CardTitle>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => addItem({ item: "", obligatoire: false })}>
                  <Plus className="w-4 h-4 mr-2" /> Ajouter
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {itemFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3 p-3 rounded border bg-muted/20">
                    <div className="flex-1">
                      <FormField control={form.control} name={`itemsToBring.${index}.item`} render={({ field }) => (
                        <FormItem>
                          <FormControl><Input placeholder="Article..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded bg-background border">
                      <FormField control={form.control} name={`itemsToBring.${index}.obligatoire`} render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel className="text-xs font-medium cursor-pointer">Obligatoire</FormLabel>
                        </FormItem>
                      )} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-destructive">
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
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {parseInt(form.watch("prix_par_pers"))?.toLocaleString()} Ar</span>
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
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">Itinéraire</h4>
                    <div className="space-y-2">
                      {form.watch("itineraries").map((it, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-bold">J{idx+1}:</span> {it.titre}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">Checklist</h4>
                    <div className="space-y-2">
                      {form.watch("itemsToBring").map((item, idx) => (
                        <div key={idx} className="text-sm flex items-center gap-2">
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
            <Button type="button" variant="ghost" onClick={prev} disabled={currentStep === 0 || loading}>
              Précédent
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={next}>Continuer</Button>
            ) : (
              <Button type="submit" disabled={loading} className="px-8">
                {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Publier
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
