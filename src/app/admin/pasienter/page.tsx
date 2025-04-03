/**
 * Oversikt over alle pasienter
 *
 * Denne komponenten viser en oversikt over alle pasientene til den innloggede terapeuten.
 *
 * Funksjonalitet:
 * - Henter pasienter knyttet til terapeuten ved hjelp av `/api/pasienter/mine`.
 * - Viser liste over pasienter, der hver pasient kan klikkes for å gå til detaljsiden.
 * - Lar terapeuten legge til en ny pasient via et skjema.
 * - Skjemaet vises/dettes ned ved å trykke på en knapp.
 * - Spinner vises mens data hentes.
 * - Håndterer feil og validering, inkludert token-sjekk.
 *
 * Teknisk:
 * - Bruker `useEffect` for å hente pasienter ved lasting.
 * - Bruker `useState` til å håndtere skjema, pasientliste, feilmeldinger og innlastingsstatus.
 * - Kommunikasjon med backend skjer via `fetch`, med Bearer-token for autentisering.
 * - Bruker `Link` fra Next.js for å navigere til detaljsiden for hver pasient.
 */

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [loading, setLoading] = useState<boolean>(true); // Ny tilstand for innlasting
  const [navn, setNavn] = useState<string>("");
  const [alder, setAlder] = useState<string>("");
  const [diagnose, setDiagnose] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    const fetchPasienter = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Ingen token funnet. Logg inn på nytt.");
        setLoading(false); // Stopp innlasting
        return;
      }

      try {
        const res = await fetch(
          "https://fysioterapi-backend-production.up.railway.app/api/pasienter/mine",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Kunne ikke hente pasienter");

        const data = await res.json();
        setPasienter(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Ukjent feil");
      } finally {
        setLoading(false); // Stopp innlasting
      }
    };

    fetchPasienter();
  }, []);

  return (
    <>
      <div className="mt-10 border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
          >
            {showForm ? "Lukk" : "Legg til pasient"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const token = localStorage.getItem("token");
              if (!token) {
                setError("Ingen token funnet.");
                return;
              }

              const res = await fetch(
                "https://fysioterapi-backend-production.up.railway.app/api/pasienter",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    navn,
                    alder: Number(alder),
                    diagnose,
                  }),
                }
              );

              if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || "Noe gikk galt ved oppretting.");
                return;
              }

              const newPasient = await res.json();
              setPasienter((prev) => [...prev, newPasient]);
              setNavn("");
              setAlder("");
              setDiagnose("");
              setShowForm(false);
            }}
            className="space-y-4 transition-all duration-300"
          >
            <input
              type="text"
              placeholder="Navn"
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
            <input
              type="number"
              placeholder="Alder"
              value={alder}
              onChange={(e) => setAlder(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Diagnose"
              value={diagnose}
              onChange={(e) => setDiagnose(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />

            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Lagre pasient
            </button>
          </form>
        )}
      </div>

      <MaxWidthWrapper>
        <div className="max-w-3xl mx-auto py-10">
          <h1 className="text-2xl font-bold">Mine pasienter:</h1>

          {error && <p className="text-red-500 text-center">{error}</p>}

          {loading ? ( // Viser spinner hvis dataene lastes inn
            <div className="flex justify-center items-center mt-10">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div>
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {pasienter.map((pasient) => (
                <Link
                  href={`/admin/pasienter/${pasient._id}`}
                  key={pasient._id}
                >
                  <li className="border-2 border-gray-300 p-6 rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 cursor-pointer mb-2">
                    <h2 className="text-lg font-semibold text-red-700">
                      {pasient.navn}
                    </h2>
                    <p className="font-extralight">Alder: {pasient.alder}</p>
                    <p>
                      Diagnose:{" "}
                      <span className="font-bold"> {pasient.diagnose}</span>
                    </p>
                  </li>
                </Link>
              ))}
            </ul>
          )}

          {pasienter.length === 0 && !error && !loading && (
            <p className="text-center">Du har ingen registrerte pasienter.</p>
          )}
        </div>
      </MaxWidthWrapper>
    </>
  );
}
