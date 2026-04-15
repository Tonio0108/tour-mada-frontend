import React from "react";
import bgImage from "../../assets/bg.jpg";
import { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import HeroSection from "./../../../components/HeroSection";
import AboutSection from "./../../../components/AboutSection";
import { TourSection } from "./../../../components/TourSection";
import { CTASection } from "./../../../components/CTASection";
import ContactSection from "./../../../components/ContactSection";
import { getAuthToken } from "../../../lib/api";
import { SEO } from "../../components/SEO";

export default function HomePage() {
  const [tours, setTours] = useState([]);
  const [filters, setFilters] = useState({
    prix_par_pers: "",
    duree_jours: "",
    nom_tour: "",
  });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchTours = async () => {
      const token = await getAuthToken()
      try {
        const res = await fetch(`${url}/tours-standards`, {
          headers: {
            Authorization: `Beaber ${token}`
          }
        });
        if (!res.ok) {
          throw new Error("impossible de récupérer les tours");
        }
        const data = await res.json();
        setTours(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTours();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    // Construire les paramètres de recherche
    const searchParams = new URLSearchParams();

    if (filters.prix_par_pers && filters.prix_par_pers !== "all")
      searchParams.append("prix", filters.prix_par_pers);
    if (filters.duree_jours && filters.duree_jours !== "all") 
      searchParams.append("duree", filters.duree_jours);
    if (filters.nom_tour) searchParams.append("nom", filters.nom_tour);

    // Naviguer vers la page des tours avec les paramètres de recherche
    navigate(`/tours?${searchParams.toString()}`);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleCustomTourClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/tours/reservation");
  };

  return (
    <>
      <SEO 
        title="Leader du tourisme authentique" 
        description="Découvrez Madagascar avec Tour Mada Découverte. Circuits authentiques à travers les parcs nationaux, les Tsingy et l'Allée des Baobabs."
        keywords="voyage madagascar, circuit madagascar, trekking madagascar, safari madagascar, guide touristique madagascar"
      />
      <HeroSection
        bgImage={bgImage}
        handleSearch={handleSearch}
        handleFilterChange={handleFilterChange}
        filters={filters}
      ></HeroSection>

      <AboutSection></AboutSection>

      <TourSection tours={tours}></TourSection>

      <CTASection handleCustomTourClick={handleCustomTourClick}></CTASection>

      <ContactSection bgImage={bgImage}></ContactSection>
    </>
  );
}

