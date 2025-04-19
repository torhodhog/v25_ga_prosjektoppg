"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
    const fetchLogger = async () => {
      if (!id || typeof id !== "string") return;

      try {
        const res = await fetch(
          `https://fysioterapi-backend-production.up.railway.app/api/logg/${id}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Kunne ikke hente treningslogger");

        const data = await res.json();
        setTreningslogger(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Noe gikk galt");
      } finally {
        setLoading(false);
      }
    };

    fetchLogger();
  }, [id]);

  const formatDate = (dato: string) => {
    const date = new Date(dato);
    return !isNaN(date.getTime())
      ? date.toLocaleDateString("no-NO")
      : "Ugyldig dato";
  };

  const opplevelseScoreMap: { [key: string]: number } = {
    Lett: 1,
    Passe: 2,
    
    Sliten: 3,
    Vanskelig: 4,
    Andet: 5,
  };

  const grafData = treningslogger.map((logg) => ({
    dato: formatDate(logg.dato),
    smerteVerdi: logg.smerteVerdi,
    opplevelseScore: opplevelseScoreMap[logg.øktOpplevelse] || 0,
  }));

  return (
    <MaxWidthWrapper>
      <div className="py-8 min-h-screen">
        <h1 className="text-3xl font-bold text-teal mb-6">Treningslogg</h1>

        {loading && <p className="text-gray-500">Laster treningslogger...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && treningslogger.length > 0 && (
          <>
            {/* Samlet graf */}
            <div className="mb-10 bg-white rounded-sm p-6 shadow">
              <h2 className="text-xl font-semibold text-teal mb-4">
                Sammenheng mellom smerte og opplevelse
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={grafData}>
                  <XAxis dataKey="dato" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="smerteVerdi"
                    stroke="#ef4444"
                    name="Smerteverdi"
                  />
                  <Line
                    type="monotone"
                    dataKey="opplevelseScore"
                    stroke="#3b82f6"
                    name="Opplevelse-score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Loggkort */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treningslogger.map((logg) => (
                <div
                  key={logg._id}
                  className="border rounded-sm shadow p-4 bg-white"
                >
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
                    {logg.notater || (
                      <span className="italic text-gray-400">
                        Ingen notater
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && treningslogger.length === 0 && (
          <p className="text-gray-500">Ingen treningslogger funnet.</p>
        )}
      </div>
    </MaxWidthWrapper>
  );
}
