"use client";

import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    navn: string;
    klinikk?: string;
    bilde?: string; // Profilbilde
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localProfileImage, setLocalProfileImage] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Hent profilbilde fra localStorage
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setLocalProfileImage(storedImage);
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(
          "https://fysioterapi-backend-production.up.railway.app/api/auth/me",
          {
            credentials: "include", 
          }
        );

        if (!res.ok) throw new Error("Kunne ikke hente brukerdata");

        const data = await res.json();
        setUser(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Ukjent feil");
      }
    };

    fetchUser();
  }, []);

  return (
    <MaxWidthWrapper>
      <div className="max-w-3xl text-neutral_gray mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold">Min Profil</h1>

        {error && <p className="text-red-500">{error}</p>}

        {user && (
          <div className="mt-4">
            {user.bilde || localProfileImage ? (
              <img
                src={user.bilde || localProfileImage || ""} 
                alt="Profilbilde"
                className="mx-auto rounded-full w-40 h-40"
              />
            ) : (
              <div className="mx-auto rounded-full w-40 h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Ingen bilde</span>
              </div>
            )}
            <h2 className="text-lg font-semibold">{user.navn}</h2>
            <p className="text-neutral_gray">
              {user.klinikk || "Ingen klinikk registrert"}
            </p>
          </div>
        )}
      </div>
    </MaxWidthWrapper>
  );
};