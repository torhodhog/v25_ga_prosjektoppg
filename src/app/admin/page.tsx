"use client";

import { useEffect, useState } from "react";
import GridComponent from "@/components/gridComponent";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

interface Terapeut {
  navn: string;
  epost: string;
  // legg til flere felter hvis nødvendig
}

export default function AdminPage() {
  const [terapeut, setTerapeut] = useState<Terapeut | null>(null);
  const [error, setError] = useState<string | null>(null); // Legg til en feilmeldingstilstand

  useEffect(() => {
    const fetchTerapeut = async () => {
      try {
        const res = await fetch(
          "https://fysioterapi-backend-production.up.railway.app/api/auth/me",
          {
            method: "GET",
            credentials: "include", // Sørger for at cookies sendes med i forespørselen
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          throw new Error("Kunne ikke hente brukerdata");
        }
        const data = await res.json();
        setTerapeut(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message); // Lagre feilmeldingen
          console.error("Feil ved henting av terapeut:", err);
        } else {
          setError("En ukjent feil oppstod");
          console.error("Ukjent feil:", err);
        }
      }
    };

    fetchTerapeut();
  }, []);

  return (
    <>
    <MaxWidthWrapper >
    <div className="bg-light/50 min-h-screen ml-12">
      <h1 className="text-xl text-neutral_gray font-bold ml-12 pt-8">
        Tilgang kun for <br />
        <span className="font-extrabold text-teal text-2xl">
          {terapeut?.navn ?? "innlogget bruker"}
        </span>
      </h1>

      {/* Vis en feilmelding hvis det oppstod en feil */}
      {error && (
        <div className="text-red-600 font-bold ml-12 mt-4">
          <p>{error}</p>
        </div>
      )}

      {/* Vis GridComponent kun hvis terapeut er hentet */}
      {terapeut && <GridComponent />}
    </div>
    </MaxWidthWrapper>
    </>
  );
}
