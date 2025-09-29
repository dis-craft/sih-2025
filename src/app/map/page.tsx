import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MapPin } from 'lucide-react';

export default function MapPage() {
  const mapImage = PlaceHolderImages.find(img => img.id === 'map_placeholder');

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header title="Live Interactive Map" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Real-time Train Network</CardTitle>
            <CardDescription>
              Track live train locations, view track details, and get station information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
              {mapImage ? (
                <Image
                  src={mapImage.imageUrl}
                  alt={mapImage.description}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={mapImage.imageHint}
                />
              ) : (
                <div className="bg-muted w-full h-full flex items-center justify-center">
                  <p>Map image not available.</p>
                </div>
              )}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
                    <MapPin className="size-8 text-primary animate-bounce"/>
                    <h3 className="font-bold text-lg text-foreground">Interactive Map Coming Soon</h3>
                    <p className="text-sm text-muted-foreground text-center">Live train tracking and station data will be available here.</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
