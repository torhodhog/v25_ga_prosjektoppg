"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Patient {
  _id: string;
  navn: string;
}

export default function NotatPage() {
  const { id } = useParams();
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [innhold, setInnhold] = useState("");
  const [diagnose, setDiagnose] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(
          `https://fysioterapi-backend-production.up.railway.app/api/pasienter/${id}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setPatient(data);
      } catch (err) {
        console.error("Error fetching patient info:", err);
        setError("Kunne ikke hente pasientinfo");
      }
    };

    fetchPatient();
  }, [id]);

  useEffect(() => {
    const fetchAI = async () => {
      if (!innhold) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/ai/generate-diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: innhold }),

        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "AI-feil");
        setDiagnose(data.result);
      } catch (err) {
        console.error("Error generating AI suggestion:", err);
        setError("Kunne ikke generere forslag.");
      } finally {
        setLoading(false);
      }
    };

    fetchAI();
  }, [innhold]);

  const handleSubmit = async () => {
    try {
      const res = await fetch(
        "https://fysioterapi-backend-production.up.railway.app/api/arbeidsnotat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            pasientId: id,
            innhold,
            arbeidsdiagnose: diagnose,
          }),
        }
      );

      if (!res.ok) throw new Error("Kunne ikke lagre notat");

      setSuccess("Notat lagret!");
      router.push(`/admin/pasienter/${id}`);
    } catch (err) {
      console.error("Error saving note:", err);
      setError("Feil ved lagring av notat");
    }
  };

  function getWeekNumber(date: Date): number {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    const jan4 = target.valueOf();
    return 1 + Math.round((firstThursday - jan4) / 604800000);
  }
  

  return (
    <>
      <div className="max-w-3xl mx-auto p-6">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-teal hover:underline"
          >
            <ArrowLeft className="h-5 w-5" />
            Tilbake
          </button>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-teal">
          Nytt arbeidsnotat for {patient?.navn}
        </h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}


                {/* Dato og ukenummer */}
                <div className="text-sm text-gray-500 mb-4">
          <p>
            📅 Dato: {new Date().toLocaleDateString("no-NO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            🔢 Ukenummer: {getWeekNumber(new Date())}
          </p>
        </div>

        <label className="block mb-1 font-medium text-gray-700">
          Behandlingsnotat
        </label>
        <textarea
          rows={6}
          className="w-full border p-2 rounded mb-4"
          value={innhold}
          onChange={(e) => setInnhold(e.target.value)}
          placeholder="Skriv behandlingsnotat her..."
        ></textarea>

        <label className="block mb-1 font-medium text-gray-700">
          AI-forslag: Tentativ diagnose
        </label>
        <div className="bg-gray-100 border p-3 rounded text-sm min-h-[4rem] whitespace-pre-line">
          {loading ? "Henter forslag..." : diagnose || "Ingen forslag ennå."}
        </div>

        <button
          className="mt-6 bg-teal text-white px-4 py-2 rounded hover:bg-light_teal"
          onClick={handleSubmit}
        >
          Lagre notat 🧠
        </button>
      </div>
    </>
  );
}
