import { LoaderCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
