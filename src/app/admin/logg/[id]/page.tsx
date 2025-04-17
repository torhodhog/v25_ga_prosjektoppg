"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

interface Logg {
  _id: string;
  smerteVerdi: number;
  øktOpplevelse: string;
  notater?: string;
  dato: string;
}

export default function LoggSide() {
  const { id } = useParams();
  const [treningslogger, setTreningslogger] = useState<Logg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTreningslogger = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://fysioterapi-backend-production.up.railway.app/api/logg/${id}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Kunne ikke hente treningslogger");
        }

        const data = await res.json();
        setTreningslogger(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Noe gikk galt");
      } finally {
        setLoading(false);
      }
    };

    fetchTreningslogger();
  }, [id]);

  const formatDate = (dato: string) => {
    const date = new Date(dato);
    return !isNaN(date.getTime())
      ? date.toLocaleDateString("no-NO")
      : "Ugyldig dato";
  };

  return (
    <MaxWidthWrapper>
      <div className="py-8 min-h-screen">
        <h1 className="text-3xl font-bold text-teal mb-6">Treningslogg</h1>

        {loading && <p className="text-gray-500">Laster treningslogger...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && treningslogger.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {treningslogger.map((logg) => (
              <div key={logg._id} className="border rounded-xl shadow p-4">
                <p className="text-sm text-gray-500 mb-1">
                  {formatDate(logg.dato)}
                </p>
                <p className="text-lg font-semibold text-black">
                  Smerte: {logg.smerteVerdi}/10
                </p>
                <p className="text-sm text-gray-700 italic">
                  Opplevelse: {logg.øktOpplevelse}
                </p>
                <p className="mt-2 text-gray-800">
                  {logg.notater || <span className="italic text-gray-400">Ingen notater</span>}
                </p>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-gray-500">Ingen treningslogger funnet.</p>
          )
        )}
      </div>
    </MaxWidthWrapper>
  );
}
