import { MapPin } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-headline font-bold text-gray-900 dark:text-gray-50">
              Trak'd
            </h1>
          </div>
          <p className="text-muted-foreground text-center">
            Real-time location sharing for you and your groups.
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
