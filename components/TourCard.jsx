import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { getImageUrl } from "../src/utils/imageUrl";

export default function TourCard({ title, imageUrl, navigateTo }) {
  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg border-border">
      <CardHeader className="p-0">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={getImageUrl(imageUrl)}
            alt={title}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-lg font-bold text-foreground leading-tight">{title}</h3>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {navigateTo && (
          <Link to={navigateTo} className="w-full">
            <Button variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground h-auto py-2">
              En savoir plus
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
