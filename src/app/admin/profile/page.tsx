"use client";
import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function ProfilePage() {
  const [user, setUser] = useState<{ navn: string; klinikk?: string; bilde?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setError("Ingen token funnet. Logg inn på nytt.");

      try {
        const res = await fetch("https://fysioterapi-backend-production.up.railway.app/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

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
      <div className="max-w-3xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold">Min Profil</h1>

        {error && <p className="text-red-500">{error}</p>}

        {user && (
          <div className="mt-4">
            {user.bilde && <img src={user.bilde} alt="Profilbilde" className="mx-auto rounded-full w-40 h-40" />}
            <h2 className="text-lg font-semibold">{user.navn}</h2>
            <p className="text-gray-600">{user.klinikk || "Ingen klinikk registrert"}</p>
          </div>
        )}
      </div>
    </MaxWidthWrapper>
  );
}
