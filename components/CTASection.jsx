import { Plus, Check, Clock } from "lucide-react";
import { useTranslation, Trans } from 'react-i18next';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

export const CTASection = ({ handleCustomTourClick }) => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6">
            <Badge variant="secondary" className="bg-primary-foreground/10 text-primary-foreground px-4 py-1">
              {t('cta.custom_badge')}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              <Trans i18nKey="cta.title" components={[<span className="opacity-80" />]} />
            </h2>
            <p className="text-lg opacity-90 max-w-xl">
              {t('cta.description')}
            </p>
            <ul className="space-y-4">
              {[
                { title: t('cta.features.itinerary.title'), desc: t('cta.features.itinerary.description') },
                { title: t('cta.features.budget.title'), desc: t('cta.features.budget.description') },
                { title: t('cta.features.guide.title'), desc: t('cta.features.guide.description') },
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-primary-foreground/20 rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                  <p><span className="font-bold">{feature.title}</span> {feature.desc}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full max-w-md">
            <Card className="shadow-2xl bg-background text-foreground overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center text-primary mx-auto">
                    <Plus className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{t('cta.card.title')}</h3>
                    <p className="text-muted-foreground text-sm">{t('cta.card.subtitle')}</p>
                  </div>
                  <Button onClick={handleCustomTourClick} size="lg" className="w-full h-12 font-bold gap-2 mt-4">
                    <Plus className="w-4 h-4" /> {t('cta.card.button')}
                  </Button>
                  <p className="text-primary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 pt-2">
                    <Clock className="w-3 h-3" /> {t('cta.card.response_time')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
