import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "./ui/card";

export default function TourDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 pb-20 overflow-x-hidden">
      {/* Hero Skeleton */}
      <Skeleton className="h-80 w-full rounded-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-4 -mt-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery Skeleton */}
            <Card>
              <CardHeader className="py-4">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </CardContent>
            </Card>

            {/* Content Tabs Skeleton */}
            <Card className="overflow-hidden">
              <div className="flex border-b bg-muted/20">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24 m-2" />
                ))}
              </div>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Sidebar Card Skeleton */}
            <Card className="overflow-hidden shadow-md">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="space-y-3 pt-4 border-t">
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-11 w-full rounded" />
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-none">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-3 w-24" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-3 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
