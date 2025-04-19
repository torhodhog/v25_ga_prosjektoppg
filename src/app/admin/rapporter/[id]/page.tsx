"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Pencil } from "lucide-react";

interface Rapport {
  _id: string;
  innhold: string;
  dato: string;
}

export default function RapportDetaljPage() {
  const { id } = useParams();
  const router = useRouter();
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [nyttInnhold, setNyttInnhold] = useState("");

  useEffect(() => {
    const fetchRapport = async () => {
      try {
        const res = await fetch(
          `https://fysioterapi-backend-production.up.railway.app/api/rapporter/rapport/${id}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setRapport(data);
        setNyttInnhold(data.innhold);
      } catch (err) {
        console.error("Error fetching rapport:", err);
        setError("Kunne ikke hente rapport");
      }
    };
    fetchRapport();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Er du sikker på at du vil slette denne rapporten?")) return;
    try {
      await fetch(
        `https://fysioterapi-backend-production.up.railway.app/api/rapporter/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      router.push("/admin");
    } catch {
      setError("Kunne ikke slette rapporten");
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        `https://fysioterapi-backend-production.up.railway.app/api/rapporter/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ innhold: nyttInnhold }),
        }
      );
      const data = await res.json();
      setRapport(data);
      setEditMode(false);
    } catch {
      setError("Kunne ikke oppdatere rapporten");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-teal mb-4"
      >
        <ArrowLeft className="h-5 w-5" /> Tilbake
      </button>

      <h1 className="text-2xl font-bold mb-4 text-teal">Detaljer for rapport</h1>

      {error && <p className="text-red-500">{error}</p>}

      {rapport && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <p className="text-sm text-gray-500">
            Dato: {new Date(rapport.dato).toLocaleDateString("no-NO")}
          </p>

          {editMode ? (
            <>
              <textarea
                className="w-full p-3 border rounded text-sm"
                rows={10}
                value={nyttInnhold}
                onChange={(e) => setNyttInnhold(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="bg-teal text-white px-4 py-2 rounded"
                  onClick={handleSave}
                >
                  Lagre endringer
                </button>
                <button
                  className="text-gray-500 underline"
                  onClick={() => setEditMode(false)}
                >
                  Avbryt
                </button>
              </div>
            </>
          ) : (
            <div className="whitespace-pre-line text-gray-700 text-sm">
              {rapport.innhold}
            </div>
          )}

          {!editMode && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                <Pencil className="w-4 h-4" /> Rediger
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-red-600 hover:underline"
              >
                <Trash2 className="w-4 h-4" /> Slett
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
