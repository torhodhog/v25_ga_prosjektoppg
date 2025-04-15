"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { useEffect, useState } from "react";

interface Varsel {
  id: string;
  melding: string;
  dato: string;
  pasientId: { navn: string }; 
  type: string;
  createdAt: string; 
}

export default function VarslerPage() {
  const [varsler, setVarsler] = useState<Varsel[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchVarsler = async () => {
      try {
        setLoading(true); 
        const res = await fetch(
          "https://fysioterapi-backend-production.up.railway.app/api/varsler",
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Kunne ikke hente varsler");
        }

        const data = await res.json();
        setVarsler(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Noe gikk galt");
      } finally {
        setLoading(false); 
      }
    };

    fetchVarsler();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Ingen dato";
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime())
      ? date.toLocaleDateString("no-NO")
      : "Ugyldig dato";
  };

  return (
    <MaxWidthWrapper>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Varsler</h1>
        {loading && <p className="text-gray-500">Laster...</p>} 
        {error && <p className="text-red-500">{error}</p>}
        {!loading && (
          <ul className="space-y-4">
            {varsler.map((varsel, index) => (
              <li
                key={varsel.id || index}
                className="border p-4 rounded shadow"
              >
                <p className="text-sm text-gray-600">
                  {formatDate(varsel.createdAt)} {/* Bruker createdAt */}
                </p>
                <p className="text-sm text-gray-600">
                  Fra:{" "}
                  <span className="font-bold text-black">
                    {varsel.pasientId?.navn || "Ukjent"}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Type:{" "}
                  <span className="font-bold text-black">{varsel.type}</span>
                </p>
                <p className="text-lg font-medium">{varsel.melding}</p>
              </li>
            ))}
          </ul>
        )}
        {!loading && varsler.length === 0 && !error && (
          <p className="text-gray-500">Ingen varsler tilgjengelig!</p>
        )}
      </div>
    </MaxWidthWrapper>
  );
}
