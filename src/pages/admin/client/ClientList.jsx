import React, { useEffect, useState, useMemo } from "react";
import { User, Mail, Phone, MapPin, Calendar, Eye, Search, RefreshCw, CheckCircle2, Clock, XCircle } from "lucide-react";
import { reservationAPI } from "../../../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await reservationAPI.getAllReservations();
      
      const clientMap = new Map();
      data.forEach(res => {
        const key = `${res.email}-${res.num_tel}`;
        if (!clientMap.has(key)) {
          clientMap.set(key, {
            id: res.id_reservation,
            nom_complet: res.nom_complet,
            email: res.email,
            num_tel: res.num_tel,
            adresse: res.adresse,
            reservations: [res],
            clientDetails: res.client
          });
        } else {
          clientMap.get(key).reservations.push(res);
        }
      });
      setClients(Array.from(clientMap.values()));
    } catch (err) {
      console.error("Error:", err);
      toast.error("Impossible de charger les clients");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.num_tel?.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const showDetails = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "CONFIRMER") return <Badge variant="outline" className="bg-primary text-primary-foreground border-none">Confirmé</Badge>;
    if (s === "ANNULER") return <Badge variant="destructive">Annulé</Badge>;
    return <Badge variant="secondary">En attente</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Base Clients</h2>
          <p className="text-sm text-muted-foreground mt-1">Répertoire des voyageurs</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      <div className=" rounded border border-border overflow-hidden">
        <div className="p-4 bg-white border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 font-medium">Client</TableHead>
                <TableHead className="px-4 py-3 font-medium">Contact</TableHead>
                <TableHead className="px-4 py-3 font-medium text-center">Réservations</TableHead>
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
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Aucun client</TableCell>
                </TableRow>
              ) : (
                filteredClients.map((c) => (
                  <TableRow key={c.email + c.num_tel} className="border-border group">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-xs">
                          {c.nom_complet?.[0]}
                        </div>
                        <div className="font-medium text-foreground">{c.nom_complet}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      <div>{c.email}</div>
                      <div className="text-xs">{c.num_tel}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge variant="secondary">{c.reservations.length}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => showDetails(c)}>
                        <Eye className="w-4 h-4" />
                      </Button>
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
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedClient.nom_complet}</DialogTitle>
                <DialogDescription>
                  {selectedClient.clientDetails ? "Compte membre" : "Client direct"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Coordonnées</p>
                    <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {selectedClient.email}</p>
                    <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {selectedClient.num_tel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Adresse</p>
                    <p className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5" /> {selectedClient.adresse}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Historique</p>
                  <div className="space-y-2">
                    {selectedClient.reservations.map((r) => (
                      <div key={r.id_reservation} className="p-3 rounded border flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{r.tour?.nom_tour || "Circuit sur mesure"}</p>
                          <p className="text-xs text-muted-foreground">#{r.id_reservation} - {formatDate(r.date_tour_prevue)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-primary">{parseInt(r.montant_total)?.toLocaleString()} Ar</p>
                          {getStatusBadge(r.statut)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Fermer</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
