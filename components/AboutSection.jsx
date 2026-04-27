import { Card, CardContent } from "./ui/card";
import { useTranslation, Trans } from "react-i18next";
import trekking from "../src/assets/trekking.jpg";

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="aspect-[4/3] rounded overflow-hidden shadow-2xl">
                <img
                  src={trekking}
                  alt="About Us"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded -z-10"></div>
            </div>
          </div>

          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              <Trans i18nKey="about.title" components={[<span className="text-primary" />]} />
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("about.description")}
            </p>
            
            <div className="space-y-4 pt-4">
              <p className="font-bold text-foreground">{t("about.we_offer")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "nature_tours",
                  "beach_stays",
                  "adventures",
                  "cultural_travels",
                ].map((item) => (
                  <Card key={item} className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-primary text-sm mb-1">{t(`about.${item}.title`)}</h4>
                      <p className="text-xs text-muted-foreground leading-tight">{t(`about.${item}.description`)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <p className="pt-6 text-sm italic text-muted-foreground border-t border-border">
              <Trans i18nKey="about.conclusion" components={[<span className="font-bold text-primary" />]} />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
