"use client";
import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function NyRapportPage() {
  interface Pasient {
    _id: string;
    navn: string;
  }

  const [pasienter, setPasienter] = useState<Pasient[]>([]);
  const [valgtPasientId, setValgtPasientId] = useState("");
  const [innhold, setInnhold] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPasienter = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("https://fysioterapi-backend-production.up.railway.app/api/pasienter/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPasienter(data);
    };
    fetchPasienter();
  }, []);

  const sendRapport = async () => {
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    const res = await fetch("https://fysioterapi-backend-production.up.railway.app/api/rapporter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pasientId: valgtPasientId,
        innhold,
      }),
    });

    if (!res.ok) {
      setError("Kunne ikke sende rapport");
      return;
    }

    setSuccess("Rapport sendt!");
    setInnhold("");
    setValgtPasientId("");
  };

  return (
    <MaxWidthWrapper>
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">📝 Ny pasientrapport</h1>
  
        {/* Velg pasient */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Velg pasient:</label>
          <select
            value={valgtPasientId}
            onChange={(e) => setValgtPasientId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">-- Velg pasient --</option>
            {pasienter.map((p) => (
              <option key={p._id} value={p._id}>
                {p.navn}
              </option>
            ))}
          </select>
        </div>
  
        {/* Hvis pasient er valgt, vis kort */}
        {valgtPasientId && (
          <div className="bg-gray-50 p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-700">
              📌 <strong>Pasient:</strong> {pasienter.find(p => p._id === valgtPasientId)?.navn}
            </p>
            <p className="text-sm text-gray-500">
              📅 <strong>Dato:</strong> {new Date().toLocaleDateString("no-NO")}
            </p>
          </div>
        )}
  
        {/* Rapportinnhold */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">🩺 Symptomer</label>
            <textarea
              placeholder="Beskriv pasientens symptomer..."
              className="w-full border rounded px-3 py-2"
              rows={3}
              value={innhold}
              onChange={(e) => setInnhold(e.target.value)}
            />
          </div>
  
          <div>
            <label className="block text-sm font-semibold mb-1">👁 Observasjoner</label>
            <textarea
              placeholder="Noter funn eller observasjoner"
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
  
          <div>
            <label className="block text-sm font-semibold mb-1">✅ Tiltak / Anbefalinger</label>
            <textarea
              placeholder="Anbefalte tiltak eller videre oppfølging"
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
        </div>
  
        {/* Send knapp */}
        <div className="pt-4">
          <button
            onClick={sendRapport}
            className="bg-red-600 hover:bg-red-700 transition text-white px-6 py-2 rounded font-semibold w-full"
          >
            📤 Send rapport
          </button>
        </div>
  
        {/* Tilbakemeldinger */}
        {success && <p className="text-green-600 text-center">{success}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
      </div>
    </MaxWidthWrapper>
  );
  
}
