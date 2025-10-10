"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function AppPage() {
  const { user, trakdUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !trakdUser) {
    redirect("/sign-in");
  } else {
    redirect("/map");
  }

  return null;
}
