import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function TourCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col border-border bg-card shadow-sm">
      <CardHeader className="p-0">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
      </CardHeader>
      <CardContent className="p-5 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Skeleton className="h-9 w-full rounded" />
      </CardFooter>
    </Card>
  );
}
