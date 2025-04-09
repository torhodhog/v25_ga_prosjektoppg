"use client";
import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import AIReportHelper from "@/components/AIReportHelper";

export default function NyRapportPage() {
  interface Pasient {
    _id: string;
    navn: string;
  }

  const [pasienter, setPasienter] = useState<Pasient[]>([]);
  const [valgtPasientId, setValgtPasientId] = useState("");
  const [symptomer, setSymptomer] = useState("");
  const [observasjoner, setObservasjoner] = useState("");
  const [tiltak, setTiltak] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPasienter = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://fysioterapi-backend-production.up.railway.app/api/pasienter/mine",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setPasienter(data);
    };
    fetchPasienter();
  }, []);

        const sendRapport = async () => {
      setError("");
      setSuccess("");
    
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          "https://fysioterapi-backend-production.up.railway.app/api/rapporter",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              pasientId: valgtPasientId,
              innhold: `${symptomer}\n\n${observasjoner}\n\n${tiltak}`,
              tekst: `${symptomer}\n\n${observasjoner}\n\n${tiltak}`, // Legg til tekst
              type: "rapport", // Legg til type (juster etter hva API-et forventer)
              terapeutId: "12345", // Bytt ut med riktig terapeut-ID (hent fra kontekst eller API)
            }),
          }
        );
    
        // Logg responsen for feilsøking
        console.log("API-respons:", res);
    
        // Sjekk statuskoden
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Feil fra API:", errorData);
          setError(errorData.error || "Kunne ikke sende rapport");
          return;
        }
    
        // Hvis alt er OK, vis suksessmelding
        setSuccess("Rapport sendt!");
        setSymptomer("");
        setObservasjoner("");
        setTiltak("");
        setValgtPasientId("");
      } catch (error) {
        console.error("Feil ved sending av rapport:", error);
        setError("Noe gikk galt ved sending av rapport.");
      }
    };
  return (
    <MaxWidthWrapper>
      <div className="flex flex-col lg:flex-row gap-10 py-10">
        {/* Skjemaside */}
        <div className="flex-1 space-y-6">
          <h1 className="text-3xl font-bold text-neutral_gray">
            📝 Ny pasientrapport
          </h1>

          {/* Velg pasient */}
          <div>
            <label className="block text-sm font-medium text-neutral_gray mb-1">
              Velg pasient:
            </label>
            <select
              value={valgtPasientId}
              onChange={(e) => setValgtPasientId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-neutral_gray"
            >
              <option value="">-- Velg pasient --</option>
              {pasienter.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.navn}
                </option>
              ))}
            </select>
          </div>

          {valgtPasientId && (
            <div className="bg-gray-50 p-4 rounded shadow-sm border border-gray-200">
              <p className="text-sm text-neutral_gray">
                📌 <strong>Pasient:</strong>{" "}
                {pasienter.find((p) => p._id === valgtPasientId)?.navn}
              </p>
              <p className="text-sm text-gray-500">
                📅 <strong>Dato:</strong> {new Date().toLocaleDateString("no-NO")}
              </p>
            </div>
          )}

          {/* Rapportfelt */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-neutral_gray">
                🩺 Symptomer
              </label>
              <textarea
                placeholder="Beskriv pasientens symptomer..."
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={symptomer}
                onChange={(e) => setSymptomer(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-neutral_gray">
                👁 Observasjoner
              </label>
              <textarea
                placeholder="Noter funn eller observasjoner"
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={observasjoner}
                onChange={(e) => setObservasjoner(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-neutral_gray">
                ✅ Tiltak / Anbefalinger
              </label>
              <textarea
                placeholder="Anbefalte tiltak eller videre oppfølging"
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={tiltak}
                onChange={(e) => setTiltak(e.target.value)}
              />
            </div>
          </div>

          {/* Send knapp */}
          <div className="pt-4">
            <button
              onClick={sendRapport}
              className="bg-coral hover:bg-peach transition text-white px-6 py-2 rounded font-semibold w-full"
            >
              📤 Send rapport
            </button>
          </div>

          {success && <p className="text-green text-center">{success}</p>}
          {error && <p className="text-coral text-center">{error}</p>}
        </div>

        {valgtPasientId && (
  <div className="lg:w-1/3 self-stretch">
    <div className="h-full min-h-[1400px]"> 
      <AIReportHelper
        patientId={valgtPasientId}
        onSaved={() => setSuccess("Rapport sendt via AI!")}
        onFillFields={({ rapport, forslag }) => {
          setSymptomer(rapport);
          setTiltak(forslag);
        }}
      />
    </div>
  </div>
)}

      </div>
    </MaxWidthWrapper>
  );
}
