import { AdminUser } from "../../../../lib/api";
import {
  Plus,
  Search,
  Trash2,
  Mail,
  User,
  MoreVertical,
  Phone,
  MapPin,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "../../../../components/ui/Input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const userSchema = z.object({
  email: z.string().email("Email invalide"),
  type_utilisateur: z.enum(["ADMIN"]),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  telephone: z.string().optional().or(z.literal("")),
  adresse: z.string().optional().or(z.literal("")),
  mot_de_passe: z.string().min(8, "Minimum 8 caractères").optional().or(z.literal("")),
});

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      type_utilisateur: "ADMIN",
      nom: "",
      prenom: "",
      telephone: "",
      adresse: "",
      mot_de_passe: "",
    },
  });

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      (user.Administrateur?.prenom &&
        user.Administrateur.prenom.toLowerCase().includes(searchValue.toLowerCase())) ||
      (user.Administrateur?.nom &&
        user.Administrateur.nom.toLowerCase().includes(searchValue.toLowerCase()))
  );

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    setLoading(true);
    try {
      const response = await AdminUser.getAllAdminUser();
      setUsers(response);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    form.reset({
      email: "",
      type_utilisateur: "ADMIN",
      nom: "",
      prenom: "",
      telephone: "",
      adresse: "",
      mot_de_passe: "",
    });
    setIsModalOpen(true);
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.reset({
      email: user.email,
      type_utilisateur: user.type_utilisateur,
      nom: user.Administrateur?.nom || "",
      prenom: user.Administrateur?.prenom || "",
      telephone: user.Administrateur?.telephone || "",
      adresse: user.Administrateur?.adresse || "",
      mot_de_passe: "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await AdminUser.deleteUser(deletingUser.id_utilisateur);
      toast.success("Utilisateur supprimé");
      fetchAdminUsers();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  const onSubmit = async (values) => {
    setActionLoading(true);
    try {
      if (editingUser) {
        await AdminUser.editingUser(editingUser.id_utilisateur, values);
        toast.success("Utilisateur mis à jour");
      } else {
        await AdminUser.createUser(values);
        toast.success("Utilisateur créé");
      }
      fetchAdminUsers();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Comptes</h2>
          <p className="text-sm text-muted-foreground mt-1">Gérez les accès administrateurs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAdminUsers} disabled={loading} className="gap-2">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Actualiser
          </Button>
          <Button onClick={handleCreateUser} className="gap-2">
            <Plus className="w-4 h-4" /> Nouvel Utilisateur
          </Button>
        </div>
      </div>

      <div className="bg-background rounded border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 font-medium">Administrateur</TableHead>
                <TableHead className="px-4 py-3 font-medium">Contact</TableHead>
                <TableHead className="px-4 py-3 font-medium">Rôle</TableHead>
                <TableHead className="w-12 px-4 py-3 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i} className="border-none">
                    <TableCell colSpan={4} className="h-16 bg-muted/5 animate-pulse" />
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Aucun utilisateur</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id_utilisateur} className="border-border group">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-xs">
                          {user.Administrateur?.nom?.[0]}
                        </div>
                        <div className="font-medium text-foreground">{user.Administrateur?.prenom} {user.Administrateur?.nom}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      <div>{user.email}</div>
                      <div className="text-xs">{user.Administrateur?.telephone || "N/A"}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant="secondary">{user.type_utilisateur}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>Détails</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>Modifier</DropdownMenuItem>
                          {user.type_utilisateur !== "SUPERADMIN" && (
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-destructive">
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Modifier l'utilisateur" : "Nouvel Administrateur"}</DialogTitle>
            <DialogDescription>Gérez les accès sécurisés</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <FormControl><Input disabled={!!editingUser} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="telephone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="type_utilisateur" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={editingUser?.type_utilisateur === "ADMIN"}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Rôle" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {!editingUser && (
                <FormField control={form.control} name="mot_de_passe" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe temporaire</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading && <RefreshCw className="w-4 h-4 animate-spin mr-2" />}
                  {editingUser ? "Enregistrer" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-md">
          {viewingUser && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingUser.Administrateur?.prenom} {viewingUser.Administrateur?.nom}</DialogTitle>
                <DialogDescription>{viewingUser.type_utilisateur}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-sm">
                <div className="flex items-center gap-3 p-3 rounded border bg-muted/20">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>{viewingUser.email}</div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded border bg-muted/20">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>{viewingUser.Administrateur?.telephone || "Non renseigné"}</div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded border bg-muted/20">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>{viewingUser.Administrateur?.adresse || "Non renseignée"}</div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>Fermer</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce compte ?</DialogTitle>
            <DialogDescription>Cette action est irréversible pour {deletingUser?.email}.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={actionLoading}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
