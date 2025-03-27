"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function PasientDetaljer() {
  const { id } = useParams();

  interface Pasient {
    navn: string;
    alder: number;
    kjønn: string;
    adresse: string;
    telefon: string;
    epost: string;
    diagnose: string;
    smerterate: number;
    fremgang: string;
    henvisendeLege: string;
    kommentar: string;
    smertehistorikk: { verdi: number; dato: string }[];
  }

  const [pasient, setPasient] = useState<Pasient | null>(null);
  const [editableField, setEditableField] = useState<keyof Pasient | null>(null);
  const [editedValue, setEditedValue] = useState<string | number>("");

  const fetchPasient = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(
      `https://fysioterapi-backend-production.up.railway.app/api/pasienter/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    setPasient(data);
  };

  useEffect(() => {
    fetchPasient();
  }, [id]);

  const handleSave = async () => {
    if (!editableField || !pasient) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://fysioterapi-backend-production.up.railway.app/api/pasienter/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [editableField]: editedValue }),
        }
      );

      const updated = await res.json();
      setPasient(updated);
      setEditableField(null);
    } catch (err) {
      console.error("Feil ved oppdatering:", err);
    }
  };

  const renderField = (label: string, field: keyof Pasient) => (
    <p>
      <strong>{label}:</strong>{" "}
      {editableField === field ? (
        <>
          <input
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={handleSave}
            className="ml-2 text-sm text-blue-600"
          >
            Lagre
          </button>
        </>
      ) : (
        <span
          role="button"
          tabIndex={0}
          onClick={() => {
            const value = pasient?.[field];
            if (typeof value === "string" || typeof value === "number") {
              setEditableField(field);
              setEditedValue(value);
            } else {
              setEditedValue("");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              const value = pasient?.[field];
              if (typeof value === "string" || typeof value === "number") {
                setEditableField(field);
                setEditedValue(value);
              } else {
                setEditedValue("");
              }
            }
          }}
          className="cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {typeof pasient?.[field] === "string" || typeof pasient?.[field] === "number"
            ? pasient?.[field]
            : "Klikk for å legge til"}
        </span>
      )}
    </p>
  );

  return (
    <MaxWidthWrapper>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Pasientdetaljer</h1>

        {pasient ? (
          <>
            <div className="space-y-2">
              {renderField("Navn", "navn")}
              {renderField("Alder", "alder")}
              {renderField("Kjønn", "kjønn")}
              {renderField("Adresse", "adresse")}
              {renderField("Telefon", "telefon")}
              {renderField("E-post", "epost")}
              {renderField("Diagnose", "diagnose")}
              {renderField("Smerterate", "smerterate")}
              {renderField("Fremgang", "fremgang")}
              {renderField("Henvisende lege", "henvisendeLege")}
              {renderField("Kommentar", "kommentar")}
            </div>

            {pasient.smertehistorikk?.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-2">Smerteutvikling</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={pasient.smertehistorikk.map((entry) => ({
                      ...entry,
                      dato: new Date(entry.dato).toLocaleDateString("no-NO"),
                    }))}
                  >
                    <XAxis dataKey="dato" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="verdi" stroke="#ef4444" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <p>Laster pasientinformasjon...</p>
        )}
      </div>
    </MaxWidthWrapper>
  );
}
