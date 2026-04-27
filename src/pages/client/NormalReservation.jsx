import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router";
import {
  Calendar,
  User,
  MapPin,
  Mail,
  Phone,
  Users,
  Clock,
  DollarSign,
} from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { reservationSchema } from "../../../lib/validations/reservation";
import { useAuth } from "../../hooks/useAuth";
import { reservationAPI, Tours, MailApi } from "../../../lib/api";
import { useTranslation, Trans } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NormalReservation() {
  const { t } = useTranslation();
  const { id: tourId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tour, setTour] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      tourId: tourId ? parseInt(tourId) : undefined,
      nombre_jeune: 0,
      nombre_adulte: 1,
      nombre_enfant: 0,
      nombre_pers: 1,
      nombre_homme: 0,
      nombre_femme: 0,
      age_plus_age: 0,  
      age_moins_age: 0, 
      nom_complet: "",
      email: "",
      num_tel: "",
      adresse: "",
    },
  });

  // Surveillance des catégories pour calculer le total
  const nAdulte = watch("nombre_adulte") || 0;
  const nJeune = watch("nombre_jeune") || 0;
  const nEnfant = watch("nombre_enfant") || 0;

  useEffect(() => {
    const total = nAdulte + nJeune + nEnfant;
    if (total > 0) {
        setValue("nombre_pers", total, { shouldValidate: true });
    }
  }, [nAdulte, nJeune, nEnfant, setValue]);

  // Pré-remplissage quand l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      const client = user.Clients || user.client;
      if (client) {
        reset({
          ...watch(),
          nom_complet: `${client.nom || ""} ${client.prenom || ""}`.trim(),
          email: user.email || "",
          num_tel: client.telephone || "",
          adresse: client.adresse || "",
        });
      }
    }
  }, [user, reset]);

  useEffect(() => {
    const fetchTour = async () => {
      if (tourId) {
        try {
          const tourData = await Tours.getTourStandardsById(tourId);
          setTour(tourData);
          setValue("montant_total", parseFloat(tourData.prix_par_pers));
          setValue("nbre_jours", tourData.duree_jours);
          setValue("interets", tourData.nom_tour);
        } catch (error) {
          console.error("Erreur:", error);
        }
      }
    };
    fetchTour();
  }, [tourId, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        clientId: user.Clients?.id_client || user.client?.id_client,
        nombre_pers: data.nombre_pers,
        nbre_jours: data.nbre_jours,
        nombre_adulte: data.nombre_adulte,
        nombre_jeune: data.nombre_jeune,
        nombre_enfant: data.nombre_enfant,
        nombre_homme: data.nombre_homme,
        nombre_femme: data.nombre_femme,
        age_plus_age: data.age_plus_age,
        age_moins_age: data.age_moins_age,
        budget_estime: data.budget_estime,
        montant_total: data.montant_total,
        date_tour_prevue: data.date_tour_prevue.toISOString(),
        nom_complet: data.nom_complet,
        email: data.email,
        num_tel: data.num_tel,
        adresse: data.adresse,
        statut: "EN_ATTENTE",
      };

      if (tourId) {
        await reservationAPI.createReservation({ ...payload, tourId: parseInt(tourId) });
        toast.success(t('reservation.submit_button.success_standard'));
        await MailApi.notifyReservation({ nomClient: payload.nom_complet, nomTour: tour?.nom_tour || tourId });
        navigate("/client/reservations");
      } else {
        const tourRes = await Tours.createTourPersonnalise({
          clientId: user.Clients?.id_client || user.client?.id_client,
          interets: data.interets,
          nombre_jours: data.nbre_jours.toString(),
          statut: "EN_ATTENTE",
          itineraire_propose: "À définir",
        });
        await reservationAPI.createReservation({ ...payload, tour_personnaliseId: tourRes.id_tour_perso });
        toast.success(t('reservation.submit_button.success_custom'));
        await MailApi.notifyCustomTour({ nomClient: payload.nom_complet, tour: data.interets });
        navigate("/client/reservations");
        reset();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 bg-gray-50 text-left">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{t('reservation.title')}</h1>
        <p className="text-gray-600 mb-6">
          {tour ? <Trans i18nKey="reservation.subtitle_standard" values={{ tourName: tour.nom_tour }} /> : t('reservation.subtitle_custom')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!tourId && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('reservation.interest_section')}</h2>
              <Input label={t('reservation.interest_label')} placeholder={t('reservation.interest_placeholder')} {...register("interets")} error={errors.interets?.message} />
            </div>
          )}

          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><User className="h-5 w-5 mr-2 text-emerald-600" />{t('reservation.personal_info.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t('reservation.personal_info.full_name')} icon={User} placeholder={t('reservation.placeholders.full_name')} {...register("nom_complet")} error={errors.nom_complet?.message} />
              <Input label={t('reservation.personal_info.email')} type="email" icon={Mail} placeholder={t('reservation.placeholders.email')} {...register("email")} error={errors.email?.message} />
              <Input label={t('reservation.personal_info.phone')} type="tel" icon={Phone} placeholder={t('reservation.placeholders.phone')} {...register("num_tel")} error={errors.num_tel?.message} />
              <Input label={t('reservation.personal_info.address')} icon={MapPin} placeholder={t('reservation.placeholders.address')} {...register("adresse")} error={errors.adresse?.message} />
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Calendar className="h-5 w-5 mr-2 text-emerald-600" />{t('reservation.reservation_details.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t('reservation.reservation_details.planned_date')} type="date" icon={Calendar} {...register("date_tour_prevue")} error={errors.date_tour_prevue?.message} />
              <Input label={t('reservation.reservation_details.days_count')} type="number" icon={Clock} min="1" {...register("nbre_jours", { valueAsNumber: true })} error={errors.nbre_jours?.message} />
              {tour && <Input label={t('reservation.reservation_details.price_per_person')} type="number" icon={DollarSign} readOnly value={tour.prix_par_pers} className="bg-gray-100" />}
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('reservation.people_distribution.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label={t('reservation.people_distribution.adults')} type="number" min="0" {...register("nombre_adulte", { valueAsNumber: true })} error={errors.nombre_adulte?.message} />
              <Input label={t('reservation.people_distribution.youth')} type="number" min="0" {...register("nombre_jeune", { valueAsNumber: true })} error={errors.nombre_jeune?.message} />
              <Input label={t('reservation.people_distribution.children')} type="number" min="0" {...register("nombre_enfant", { valueAsNumber: true })} error={errors.nombre_enfant?.message} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input label={t('reservation.people_distribution.men')} type="number" min="0" {...register("nombre_homme", { valueAsNumber: true })} error={errors.nombre_homme?.message} />
              <Input label={t('reservation.people_distribution.women')} type="number" min="0" {...register("nombre_femme", { valueAsNumber: true })} error={errors.nombre_femme?.message} />
            </div>
            {errors.nombre_homme && (
              <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 p-2 rounded border border-red-100 italic">
                {errors.nombre_homme.message}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input label={t('reservation.people_distribution.oldest_age')} type="number" min="0" {...register("age_plus_age", { valueAsNumber: true })} error={errors.age_plus_age?.message} />
              <Input label={t('reservation.people_distribution.youngest_age')} type="number" min="0" {...register("age_moins_age", { valueAsNumber: true })} error={errors.age_moins_age?.message} />
            </div>

            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between">
              <label htmlFor="total-people" className="flex items-center gap-2 cursor-pointer">
                <Users className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">{t('reservation.reservation_details.total_people')}</span>
              </label>
              <Input 
                id="total-people"
                type="number" 
                readOnly 
                className="w-24 bg-white font-bold text-center border-emerald-200" 
                {...register("nombre_pers", { valueAsNumber: true })} 
              />
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><DollarSign className="h-5 w-5 mr-2 text-emerald-600" />{t('reservation.budget.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t('reservation.budget.total_amount')} type="number" icon={DollarSign} min="0" {...register("montant_total", { valueAsNumber: true })} error={errors.montant_total?.message} />
              <Input label={t('reservation.budget.estimated_budget')} type="number" icon={DollarSign} min="0" {...register("budget_estime", { valueAsNumber: true })} error={errors.budget_estime?.message} />
            </div>
          </div>

          <div className="flex justify-center">
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 h-auto font-semibold">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <><Calendar className="h-5 w-5 mr-2" />{t('reservation.submit_button.confirm')}</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
