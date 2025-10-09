import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export const metadata = {
  title: 'Profile | Trak\'d',
};

function ProfileFormSkeleton() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
    )
}

export default function ProfilePage() {
    return (
      <div className="h-full p-4 md:p-6 space-y-6">
        <header>
            <h1 className="text-2xl font-headline font-semibold">Profile</h1>
            <p className="text-muted-foreground">
                Manage your account settings.
            </p>
        </header>
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>This information will be visible to members of your groups.</CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<ProfileFormSkeleton />}>
                    <ProfileForm />
                </Suspense>
            </CardContent>
        </Card>
      </div>
    );
}
