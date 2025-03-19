"use client";
import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

interface Pasient {
  _id: string;
  navn: string;
  alder: number;
  diagnose: string;
}

export default function PasientPage() {
  const [pasienter, setPasienter] = useState<Pasient[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPasienter = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Ingen token funnet. Logg inn på nytt.");
        return;
      }

      try {
        const res = await fetch("https://fysioterapi-backend-production.up.railway.app/api/pasienter/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Kunne ikke hente pasienter");

        const data = await res.json();
        setPasienter(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Ukjent feil");
      }
    };

    fetchPasienter();
  }, []);

  return (
    <MaxWidthWrapper>
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-2xl font-bold text-center">Her er alle dine pasienter</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <ul className="mt-6 space-y-4">
          {pasienter.map((pasient) => (
            <li key={pasient._id} className="border p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold">{pasient.navn}</h2>
              <p>Alder: {pasient.alder}</p>
              <p>Diagnose: {pasient.diagnose}</p>
            </li>
          ))}
        </ul>

        {pasienter.length === 0 && !error && <p className="text-center">Du har ingen registrerte pasienter.</p>}
      </div>
    </MaxWidthWrapper>
  );
}
