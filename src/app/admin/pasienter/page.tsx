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
  smertehistorikk?: { verdi: number; dato: string }[];
}

export default function PasientPage() {
  const [pasienter, setPasienter] = useState<Pasient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [navn, setNavn] = useState<string>("");
  const [alder, setAlder] = useState<string>("");
  const [diagnose, setDiagnose] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchPasienter = async () => {
      try {
        const res = await fetch(
          "https://fysioterapi-backend-production.up.railway.app/api/pasienter/mine",
          {
            credentials: "include", // Bruk cookies for autentisering
          }
        );

        if (!res.ok) throw new Error("Kunne ikke hente pasienter");
        const data = await res.json();
        setPasienter(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Ukjent feil");
      } finally {
        setLoading(false);
      }
    };

    fetchPasienter();
  }, []);

  const handleNewPatient = async (e: React.FormEvent) => {
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
        },
        credentials: "include", // Bruker cookies for autentisering
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
  };

  function getSisteVerdi(p: Pasient) {
    return p.smertehistorikk?.at(-1)?.verdi;
  }

  function getSmertePrikk(verdi?: number) {
    if (verdi == null) {
      return (
        <div
          className="w-6 h-6 rounded-full bg-light"
          title="Ingen smerteregistrering"
        />
      );
    } else if (verdi <= 3) {
      return (
        <div
          className="w-6 h-6 rounded-full bg-green"
          title={`Siste smerteverdi: ${verdi}`}
        />
      );
    } else if (verdi <= 7) {
      return (
        <div
          className="w-6 h-6 rounded-full bg-yellow"
          title={`Siste smerteverdi: ${verdi}`}
        />
      );
    } else {
      return (
        <div
          className="w-6 h-6 rounded-full bg-coral"
          title={`Siste smerteverdi: ${verdi}`}
        />
      );
    }
  }

  // Filtrering og sortering
  const filtered = pasienter.filter((p) =>
    p.navn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const greenList: Pasient[] = [];
  const yellowList: Pasient[] = [];
  const redList: Pasient[] = [];

  filtered.forEach((p) => {
    const v = getSisteVerdi(p);
    if (v == null || v <= 3) greenList.push(p);
    else if (v <= 7) yellowList.push(p);
    else redList.push(p);
  });

  // Sorter grønne pasienter så de med smertevisning kommer først
  greenList.sort((a, b) => {
    const va = getSisteVerdi(a);
    const vb = getSisteVerdi(b);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return va - vb;
  });

  return (
    <>
    <MaxWidthWrapper >
      <div className="mt-10 border-t pt-6">
        <div className="flex items-center justify-between mb-4 ">
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm text-light bg-teal px-4 py-2 ml-24 rounded hover:bg-light_teal transition"
          >
            {showForm ? "Lukk" : "Legg til pasient"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleNewPatient}
            className="space-y-4 transition-all duration-300 max-w-md mx-auto"
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
              className="bg-teal text-turquoise px-4 py-2 rounded hover:bg-yellow transition"
            >
              Lagre pasient
            </button>
          </form>
        )}
      </div>

      
        <div className="max-w-7xl mx-auto py-10">
          <h1 className="text-2xl font-bold text-teal mb-6">Mine pasienter:</h1>

          <div className="max-w-md mx-auto mb-6">
            <input
              type="text"
              placeholder="Søk etter pasientnavn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border p-2 rounded shadow-sm"
            />
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

          {loading ? (
            <div className="flex justify-center items-center mt-10">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Grønn kolonne */}
              <div>
                <h2 className="text-center text-lg font-bold text-green mb-2">
                  Grønn
                </h2>
                {greenList.length === 0 && (
                  <p className="text-center italic text-gray-300">
                    Ingen pasienter
                  </p>
                )}
                {greenList.map((pasient) => (
                  <Link
                    href={`/admin/pasienter/${pasient._id}`}
                    key={pasient._id}
                  >
                    <div className="border-2 bg-teal border-gray-300 p-6 rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 cursor-pointer mb-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold text-light">
                          {pasient.navn}
                        </h2>
                        <p className="font-extralight text-light">
                          Alder: {pasient.alder}
                        </p>
                        <p className="text-light">
                          Diagnose:{" "}
                          <span className="font-bold">{pasient.diagnose}</span>
                        </p>
                      </div>
                      {getSmertePrikk(getSisteVerdi(pasient))}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Gul kolonne */}
              <div>
                <h2 className="text-center text-lg font-bold text-yellow-600 mb-2">
                  Gul
                </h2>
                {yellowList.length === 0 && (
                  <p className="text-center italic text-gray-300">
                    Ingen pasienter
                  </p>
                )}
                {yellowList.map((pasient) => (
                  <Link
                    href={`/admin/pasienter/${pasient._id}`}
                    key={pasient._id}
                  >
                    <div className="border-2 bg-teal border-gray-300 p-6 rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 cursor-pointer mb-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold text-light">
                          {pasient.navn}
                        </h2>
                        <p className="font-extralight text-light">
                          Alder: {pasient.alder}
                        </p>
                        <p className="text-light">
                          Diagnose:{" "}
                          <span className="font-bold">{pasient.diagnose}</span>
                        </p>
                      </div>
                      {getSmertePrikk(getSisteVerdi(pasient))}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Rød kolonne */}
              <div>
                <h2 className="text-center text-lg font-bold text-coral mb-2">
                  Rød
                </h2>
                {redList.length === 0 && (
                  <p className="text-center italic text-gray-300">
                    Ingen pasienter
                  </p>
                )}
                {redList.map((pasient) => (
                  <Link
                    href={`/admin/pasienter/${pasient._id}`}
                    key={pasient._id}
                  >
                    <div className="border-2 bg-teal border-gray-300 p-6 rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 cursor-pointer mb-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold text-light">
                          {pasient.navn}
                        </h2>
                        <p className="font-extralight text-light">
                          Alder: {pasient.alder}
                        </p>
                        <p className="text-light">
                          Diagnose:{" "}
                          <span className="font-bold">{pasient.diagnose}</span>
                        </p>
                      </div>
                      {getSmertePrikk(getSisteVerdi(pasient))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {pasienter.length === 0 && !error && !loading && (
            <p className="text-center">Du har ingen registrerte pasienter.</p>
          )}
        </div>
      </MaxWidthWrapper>
    </>
  );
}
