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
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Skriv ny rapport</h1>

        <label className="block mb-2">Velg pasient:</label>
        <select
          value={valgtPasientId}
          onChange={(e) => setValgtPasientId(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">-- Velg pasient --</option>
          {pasienter.map((p: Pasient) => (
            <option key={p._id} value={p._id}>
              {p.navn}
            </option>
          ))}
        </select>

        <label className="block mb-2">Rapportinnhold:</label>
        <textarea
          value={innhold}
          onChange={(e) => setInnhold(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          rows={6}
        />

        <button
          onClick={sendRapport}
          className="bg-red-600 text-white px-6 py-2 rounded"
        >
          Send rapport
        </button>

        {success && <p className="text-green-600 mt-4">{success}</p>}
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </MaxWidthWrapper>
  );
}
