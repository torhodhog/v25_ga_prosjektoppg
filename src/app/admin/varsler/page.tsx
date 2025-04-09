"use client";

import { useEffect, useState } from "react";

interface Varsel {
  _id: string;
  pasientId: string;
  terapeutId: string;
  type: string;
  tekst: string;
  createdAt: string;
  lest: boolean;
}

export default function VarslerPage() {
  const [varsler, setVarsler] = useState<Varsel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 

  useEffect(() => {
    const fetchVarsler = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Ingen token funnet");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          "https://fysioterapi-backend-production.up.railway.app/api/varsler",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Kunne ikke hente varsler");
        }

        const data = await res.json();
        setVarsler(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ukjent feil oppstod");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVarsler();
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-teal mb-6">Varsler</h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full mx-auto" />
          <p className="mt-2 text-gray-500">Laster varsler...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 mb-4">{error}</p>
      ) : varsler.length === 0 ? (
        <p className="text-gray-500 italic">Ingen varsler for øyeblikket.</p>
      ) : (
        <ul className="space-y-4">
          {varsler.map((v) => (
            <li
              key={v._id}
              className={`border p-4 rounded shadow bg-white text-sm ${
                v.lest ? "opacity-50" : ""
              }`}
            >
              <p className="text-gray-600">
                {new Date(v.createdAt).toLocaleString("no-NO")}
              </p>
              <p className="font-semibold">{v.tekst}</p>
              <p className="text-xs text-gray-400">Type: {v.type}</p>

              {!v.lest && (
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    await fetch(
                      `https://fysioterapi-backend-production.up.railway.app/api/varsler/${v._id}/sett`,
                      {
                        method: "PATCH",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    setVarsler((prev) =>
                      prev.map((varsel) =>
                        varsel._id === v._id
                          ? { ...varsel, lest: true }
                          : varsel
                      )
                    );
                  }}
                  className="mt-2 text-sm text-teal underline"
                >
                  Marker som lest
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
