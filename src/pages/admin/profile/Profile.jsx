import { User, Mail, Phone, MapPin, Camera, Save, Lock, Loader, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { getAuthToken } from "../../../../lib/api";
import { Input } from "../../../../components/ui/Input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const profileSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().optional().or(z.literal("")),
  adresse: z.string().optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(8, "Minimum 8 caractères"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      adresse: "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Erreur lors du chargement du profil');
      
      const data = await response.json();
      setUserId(data.id_utilisateur);
      setProfileData(data);
      
      form.reset({
        nom: data.Administrateur?.nom || "",
        prenom: data.Administrateur?.prenom || "",
        email: data.email || "",
        telephone: data.Administrateur?.telephone || "",
        adresse: data.Administrateur?.adresse || ""
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/admin/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone,
          adresse: values.adresse
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }
      
      toast.success('Profil mis à jour');
      fetchAdminProfile();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (values) => {
    setPasswordLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/client/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur');
      }
      
      toast.success('Mot de passe changé');
      setIsPasswordModalOpen(false);
      passwordForm.reset();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
      <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Chargement...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mon Profil</h2>
        <p className="text-sm text-muted-foreground mt-1">Gérez vos informations personnelles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <div className="p-6 bg-primary text-primary-foreground text-center">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold">
                  {profileData.Administrateur?.nom?.[0]}{profileData.Administrateur?.prenom?.[0]}
                </div>
                <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 bg-background text-foreground rounded border p-1.5 cursor-pointer hover:bg-muted">
                  <Camera size={14} />
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" />
                </label>
              </div>
              <h3 className="font-bold">{profileData.Administrateur?.prenom} {profileData.Administrateur?.nom}</h3>
              <Badge variant="outline" className="mt-2 text-primary-foreground border-primary-foreground/30">
                {profileData.type_utilisateur}
              </Badge>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded border bg-muted/20">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm truncate font-medium">{profileData.email}</div>
              </div>
              <Button 
                onClick={() => setIsPasswordModalOpen(true)}
                variant="outline" 
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" /> Sécurité
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4 flex gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">Vos informations sont sécurisées et visibles uniquement par l'administration.</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="prenom" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="nom" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input disabled {...field} className="bg-muted/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="telephone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="adresse" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>Minimum 8 caractères requis.</DialogDescription>
          </DialogHeader>

          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 py-4">
              <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe actuel</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading && <Loader className="w-4 h-4 animate-spin mr-2" />}
                  Mettre à jour
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
