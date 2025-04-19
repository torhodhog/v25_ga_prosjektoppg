"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Rapport {
  _id: string;
  innhold: string;
  dato: string;
}

interface Smerte {
  verdi: number;
  dato: string;
}

interface Props {
  rapporter: Rapport[];
  smertehistorikk: Smerte[];
  onUse?: (tekst: string) => void;
}

export default function AiAssistentPanel({ rapporter, smertehistorikk, onUse }: Props) {
  const [aiForslag, setAiForslag] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const hentAI = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rapporter, smertehistorikk }),
        });

        if (!res.ok) {
          const data: { error: string } = await res.json();
          throw new Error(data.error);
        }

        const data: { result: string } = await res.json();
        setAiForslag(data.result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Ukjent feil.");
      } finally {
        setLoading(false);
      }
    };

    hentAI();
  }, [rapporter, smertehistorikk]);

  return (
    <div className="bg-white p-4 rounded-sm shadow border">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between w-full text-left font-semibold text-sm text-teal"
      >
        <span>AI-assistent: Oppsummering og forslag</span>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {open && (
        <div className="mt-4">
          {loading && <p className="text-sm text-gray-400">Genererer forslag...</p>}
          {error && <p className="text-sm text-red-500">⚠️ {error}</p>}

          {aiForslag && (
            <>
              <p className="text-gray-600 text-sm mb-2 italic">
                Basert på pasientens rapporter og smerteutvikling foreslår AI følgende:
              </p>

              <div className="bg-light p-3 rounded text-sm text-gray-700 whitespace-pre-line">
                {aiForslag}
              </div>

              {onUse && (
                <button
                  onClick={() => onUse(aiForslag)}
                  className="mt-4 bg-teal text-white px-4 py-2 rounded hover:bg-light_teal transition"
                >
                  Bruk i ny rapport 📝
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
