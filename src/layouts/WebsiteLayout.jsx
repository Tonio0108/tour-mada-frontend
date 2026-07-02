import NavBar from "../../components/NavBar";
import { Outlet, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Facebook } from "lucide-react";

export const WebsiteLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-background border-t border-border pt-16 pb-8">
        <div className="container mx-auto px-6 md:px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight">{t("navbar.brand")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("footer.description")}
              </p>
              <div className="flex gap-4">
                <a href={`mailto:${t("contact.email.value")}`} title="Email rapide" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <Mail className="w-4 h-4" />
                </a>
                <a href="https://www.facebook.com/rado.tourguida" target="_blank" rel="noopener noreferrer" title="Facebook" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href={`https://wa.me/${t("contact.phone.value").replace(/\s/g, "").replace(/^0/, "261")}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">{t("footer.navigation")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/#home" className="hover:text-primary transition-colors">{t("navbar.home")}</Link></li>
                <li><Link to="/#about" className="hover:text-primary transition-colors">{t("navbar.about")}</Link></li>
                <li><Link to="/#tour" className="hover:text-primary transition-colors">{t("navbar.tours")}</Link></li>
                <li><Link to="/#contact" className="hover:text-primary transition-colors">{t("navbar.contact")}</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">{t("footer.services")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/tours" className="hover:text-primary transition-colors">{t("navbar.tours")}</Link></li>
                <li><Link to="/tours/reservation" className="hover:text-primary transition-colors">{t("cta.card.title")}</Link></li>
                <li><Link to="/client" className="hover:text-primary transition-colors">{t("client_common.client_space")}</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">{t("footer.contact")}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" /> 
                  <a href={`tel:${t("contact.phone.value").replace(/\s/g, "")}`} className="hover:text-primary transition-colors">
                    {t("contact.phone.value")}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" /> 
                  <a href={`mailto:${t("contact.email.value")}`} className="hover:text-primary transition-colors truncate">
                    {t("contact.email.value")}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /> 
                  <span className="leading-tight">{t("contact.address.value")}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <Separator className="mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-4 order-2 md:order-1">
              <p>{t("footer.all_rights", { year: new Date().getFullYear(), brand: t("navbar.brand") })}</p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/rado.tourguida" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Facebook className="w-4 h-4" /> Facebook
                </a>
                <a href={`https://wa.me/${t("contact.phone.value").replace(/\s/g, "").replace(/^0/, "261")}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Phone className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>
            <div className="flex gap-6 order-1 md:order-2">
              <span className="hover:text-primary cursor-pointer transition-colors">{t("footer.legal")}</span>
              <span className="hover:text-primary cursor-pointer transition-colors">{t("footer.privacy")}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
