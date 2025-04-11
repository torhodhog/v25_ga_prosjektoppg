"use client";

import { useEffect, useState } from "react";

interface Varsel {
  id: string;
  melding: string;
  dato: string;
}

export default function VarslerPage() {
  const [varsler, setVarsler] = useState<Varsel[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVarsler = async () => {
      try {
        const res = await fetch("/api/varsler", {
          credentials: "include", // Bruk cookies for autentisering
        });

        if (!res.ok) {
          throw new Error("Kunne ikke hente varsler");
        }

        const data = await res.json();
        setVarsler(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Noe gikk galt");
      }
    };

    fetchVarsler();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Varsler</h1>

      {error && <p className="text-red-500">{error}</p>}

      <ul className="space-y-4">
        {varsler.map((varsel) => (
          <li key={varsel.id} className="border p-4 rounded shadow">
            <p className="text-sm text-gray-600">
              {new Date(varsel.dato).toLocaleDateString("no-NO")}
            </p>
            <p className="text-lg font-medium">{varsel.melding}</p>
          </li>
        ))}
      </ul>

      {varsler.length === 0 && !error && (
        <p className="text-gray-500">Ingen varsler tilgjengelig.</p>
      )}
    </div>
  );
}
