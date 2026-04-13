import NavBar from "../../../components/NavBar";
import { Outlet, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export const WebsiteLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-background border-t border-border pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight">{t("navbar.brand")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Votre partenaire de confiance pour découvrir les merveilles de Madagascar à travers des circuits authentiques et personnalisés.
              </p>
              <div className="flex gap-4">
                <Facebook className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Instagram className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Navigation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">{t("navbar.home")}</Link></li>
                <li><Link to="/#about" className="hover:text-primary transition-colors">{t("navbar.about")}</Link></li>
                <li><Link to="/#tour" className="hover:text-primary transition-colors">{t("navbar.tours")}</Link></li>
                <li><Link to="/#contact" className="hover:text-primary transition-colors">{t("navbar.contact")}</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/tours" className="hover:text-primary transition-colors">Circuits Standards</Link></li>
                <li><Link to="/tours/reservation" className="hover:text-primary transition-colors">Tours sur Mesure</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Espace Client</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Contact</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> +261 34 00 000 00</li>
                <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> contact@tourmada.mg</li>
                <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary" /> Antananarivo, Madagascar</li>
              </ul>
            </div>
          </div>
          
          <Separator className="mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} {t("navbar.brand")}. Tous droits réservés.</p>
            <div className="flex gap-6">
              <span className="hover:text-primary cursor-pointer transition-colors">Mentions légales</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Politique de confidentialité</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
