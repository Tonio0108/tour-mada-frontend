import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { getImageUrl } from "../src/utils/imageUrl";
import { Clock, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TourCard({ title, imageUrl, navigateTo, duration, price }) {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md border-border bg-card shadow-sm">
      <CardHeader className="p-0">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={getImageUrl(imageUrl)}
            alt={title}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-grow">
        <h3 className="text-base font-semibold text-foreground leading-tight mb-4 group-hover:text-primary transition-colors">{title}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
          {duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {duration} {duration > 1 ? t("tour.days_plural") : t("tour.days")}
              </span>
            </div>
          )}
          {price && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-primary" />
              <span className="font-medium">{parseFloat(price).toLocaleString()} €</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        {navigateTo && (
          <Link to={navigateTo} className="w-full">
            <Button variant="outline" className="w-full rounded border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground h-9 text-xs font-medium transition-colors">
              {t("tour.learn_more")}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
