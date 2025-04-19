"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Varsel {
  _id: string;
  melding: string;
  dato: string;
  pasientId: {
    _id: string;
    navn: string;
  };
  type: string;
  createdAt: string;
}

export default function VarslerPage() {
  const [varsler, setVarsler] = useState<Varsel[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    return !isNaN(date.getTime())
      ? date.toLocaleDateString("no-NO")
      : "Ugyldig dato";
  };

  const markerSomLestOgNaviger = async (varsel: Varsel) => {
    try {
      await fetch(
        `https://fysioterapi-backend-production.up.railway.app/api/varsler/${varsel._id}/lest`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
  
      // Fjern fra visning
      setVarsler((prev) => prev.filter((v) => v._id !== varsel._id));
  
      // Vent litt før navigasjon
      setTimeout(() => {
        router.push(`/admin/pasienter/${varsel.pasientId._id}`);
      }, 200);
    } catch (err) {
      console.error("Feil ved oppdatering av varsel:", err);
    }
  };
  
  const slettVarsel = async (id: string) => {
    try {
      await fetch(
        `https://fysioterapi-backend-production.up.railway.app/api/varsler/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      setVarsler((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      console.error("Feil ved sletting av varsel:", err);
    }
  };

  return (
    <MaxWidthWrapper>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Varsler</h1>
        {loading && <p className="text-gray-500">Laster...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && (
          <ul className="space-y-4">
            {varsler.map((varsel) => (
              <li
                key={varsel._id}
                className="border p-4 rounded shadow hover:bg-gray-50 transition"
              >
                <div
                  onClick={() => markerSomLestOgNaviger(varsel)}
                  className="cursor-pointer"
                >
                  <p className="text-sm text-gray-600">
                    {formatDate(varsel.createdAt)}
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
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Hindrer at man blir navigert ved slett
                    slettVarsel(varsel._id);
                  }}
                  className="mt-2 text-red-500 hover:underline text-sm"
                >
                  🗑️ Slett
                </button>
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
