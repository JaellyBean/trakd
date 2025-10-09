import { MapView } from '@/components/map/map-view';
import { Suspense } from 'react';
import { LoaderCircle } from 'lucide-react';

export const metadata = {
  title: 'Map | Trak\'d',
};

export default function MapPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-headline font-semibold">Live Map</h1>
        <p className="text-muted-foreground">See your group members in real-time.</p>
      </header>
      <main className="flex-1">
        <Suspense fallback={<div className="flex h-full items-center justify-center"><LoaderCircle className="w-8 h-8 animate-spin text-primary"/></div>}>
          <MapView />
        </Suspense>
      </main>
    </div>
  );
}
