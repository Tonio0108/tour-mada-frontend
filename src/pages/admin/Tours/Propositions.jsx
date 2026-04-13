import { getAuthToken } from "../../../../lib/api";
import {
  Eye,
  Search,
  Calendar,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Tours as ToursApi, reservationAPI } from "./../../../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function Propositions() {
  const [propositions, setPropositions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedProposition, setSelectedProposition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [commentaire, setCommentaire] = useState("");
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPropositions();
  }, []);

  const fetchPropositions = async () => {
    try {
      setLoading(true);
      const data = await ToursApi.getAllTourPersonnalise();
      setPropositions(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les propositions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = propositions.filter(
      (proposition) =>
        proposition.client?.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
        proposition.client?.prenom?.toLowerCase().includes(searchText.toLowerCase()) ||
        proposition.interets?.toLowerCase().includes(searchText.toLowerCase()) ||
        proposition.statut?.toLowerCase().includes(searchText.toLowerCase()) ||
        proposition.itineraire_propose?.toLowerCase().includes(searchText.toLowerCase()) ||
        proposition.Reservations?.[0]?.nom_complet?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchText, propositions]);

  const showDetails = (proposition) => {
    setSelectedProposition(proposition);
    setIsModalOpen(true);
  };

  const showActionModal = (type, proposition) => {
    setSelectedProposition(proposition);
    setActionType(type);
    setCommentaire("");
    setIsActionModalOpen(true);
  };

  const handleAction = async () => {
    if (!selectedProposition) return;

    if (actionType === "reject" && !commentaire.trim()) {
      toast.error("Veuillez ajouter un commentaire");
      return;
    }

    setActionLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${url}/tours-personnalises/${selectedProposition.id_tour_perso}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            statut: actionType === "confirm" ? "Confirmé" : "Rejeté",
            commentaire: commentaire.trim() || null,
          }),
        }
      );

      if (!response.ok) throw new Error("Erreur");

      const updatedProposition = await response.json();
      const reservation = selectedProposition.Reservations?.[0];
      if (reservation?.id_reservation) {
        await reservationAPI.updateReservation(reservation.id_reservation, {
          statut: actionType === "confirm" ? "CONFIRMER" : "ANNULER",
        });
      }

      const nomClient = selectedProposition.client
        ? `${selectedProposition.client.prenom} ${selectedProposition.client.nom}`
        : reservation?.nom_complet || "Client";
      const email = selectedProposition.client?.utilisateur?.email || reservation?.email || "";

      try {
        const endpoint = actionType === 'reject' ? 'refuse-custom-tour' : 'confirm-custom-tour';
        await fetch(`${url}/mail/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nomClient, email, message: commentaire.trim() }),
        });
      } catch (e) { console.error("Email error", e); }

      const updatedPropositions = propositions.map((prop) =>
        prop.id_tour_perso === selectedProposition.id_tour_perso
          ? { ...prop, ...updatedProposition }
          : prop
      );

      setPropositions(updatedPropositions);
      toast.success(`Proposition mise à jour`);
      setIsActionModalOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "CONFIRMÉ" || s === "CONFIRME") 
      return <Badge variant="outline" className="bg-primary text-primary-foreground border-none">Confirmé</Badge>;
    if (s === "REJETÉ" || s === "REJETE")
      return <Badge variant="destructive">Rejeté</Badge>;
    return <Badge variant="secondary">En attente</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const canPerformAction = (proposition) => {
    const s = proposition.statut?.toUpperCase();
    return !s || s === "EN_ATTENTE";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Propositions</h2>
          <p className="text-sm text-muted-foreground mt-1">Demandes de tours sur mesure</p>
        </div>
        <Button variant="outline" onClick={fetchPropositions} disabled={loading} className="gap-2">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      <div className="bg-white rounded border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 font-medium">ID</TableHead>
                <TableHead className="px-4 py-3 font-medium">Client</TableHead>
                <TableHead className="px-4 py-3 font-medium">Intérêts</TableHead>
                <TableHead className="px-4 py-3 font-medium text-center">Statut</TableHead>
                <TableHead className="w-12 px-4 py-3 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i} className="border-none">
                    <TableCell colSpan={5} className="h-16 bg-muted/5 animate-pulse" />
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Aucune proposition</TableCell>
                </TableRow>
              ) : (
                filteredData.map((prop) => (
                  <TableRow key={prop.id_tour_perso} className="border-border group">
                    <TableCell className="px-4 py-3 font-medium text-primary">#{prop.id_tour_perso}</TableCell>
                    <TableCell className="px-4 py-3 text-sm font-medium">
                      {prop.client ? `${prop.client.prenom} ${prop.client.nom}` : prop.Reservations?.[0]?.nom_complet || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground line-clamp-1">
                      {prop.interets || "Non spécifié"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">{getStatusBadge(prop.statut)}</TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => showDetails(prop)}>
                            Détails
                          </DropdownMenuItem>
                          {canPerformAction(prop) && (
                            <>
                              <DropdownMenuItem onClick={() => showActionModal("confirm", prop)} className="text-primary font-bold">
                                Confirmer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => showActionModal("reject", prop)} className="text-destructive font-bold">
                                Rejeter
                              </DropdownMenuItem>
                            </>
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
        <DialogContent className="max-w-2xl">
          {selectedProposition && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">Proposition #{selectedProposition.id_tour_perso}</DialogTitle>
                  {getStatusBadge(selectedProposition.statut)}
                </div>
                <DialogDescription>Demande de tour sur mesure</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Client</h4>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{selectedProposition.client ? `${selectedProposition.client.prenom} ${selectedProposition.client.nom}` : selectedProposition.Reservations?.[0]?.nom_complet || "N/A"}</p>
                      <p className="text-muted-foreground">{selectedProposition.client?.telephone || selectedProposition.Reservations?.[0]?.num_tel}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Infos</h4>
                    <div className="text-sm">
                      <p>Durée: {selectedProposition.nombre_jours || selectedProposition.Reservations?.[0]?.nbre_jours || "N/A"} Jours</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">Intérêts & Souhaits</h4>
                  <p className="text-sm italic text-muted-foreground leading-relaxed">
                    {selectedProposition.interets || "Non spécifié"}
                  </p>
                </div>

                {selectedProposition.itineraire_propose && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Itinéraire Proposé</h4>
                    <div className="text-sm p-4 rounded bg-muted/20 border">
                      {selectedProposition.itineraire_propose}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Fermer</Button>
                {canPerformAction(selectedProposition) && (
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => { setIsModalOpen(false); showActionModal('reject', selectedProposition); }}>Rejeter</Button>
                    <Button onClick={() => { setIsModalOpen(false); showActionModal('confirm', selectedProposition); }}>Confirmer</Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'confirm' ? "Confirmer la proposition" : "Rejeter la proposition"}
            </DialogTitle>
            <DialogDescription>
              Client: {selectedProposition?.client ? `${selectedProposition.client.prenom} ${selectedProposition.client.nom}` : "N/A"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Message au client</label>
              <Textarea
                placeholder="Écrivez votre message ici..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsActionModalOpen(false)} disabled={actionLoading}>Annuler</Button>
            <Button 
              onClick={handleAction} 
              disabled={actionLoading || (actionType === "reject" && !commentaire.trim())}
              variant={actionType === 'reject' ? "destructive" : "default"}
            >
              {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              {actionType === 'confirm' ? "Confirmer" : "Rejeter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
