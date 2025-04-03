/**
 * Deljside om hver enkelt pasient.
 *
 * Denne komponenten viser detaljert informasjon om én spesifikk pasient.
 *
 * Funksjonalitet:
 * - Henter pasientdata fra backend ved hjelp av pasientens ID fra URL.
 * - Viser og lar brukeren redigere felter som navn, alder, adresse, smerterate osv.
 * - Viser en graf med pasientens historiske smerterater ved hjelp av Recharts.
 * - Henter og viser tidligere rapporter knyttet til pasienten.
 *
 * Teknisk:
 * - Bruker `useEffect` til å hente data ved lasting av komponenten.
 * - Bruker `useState` til å håndtere både pasientdata og redigeringsmodus.
 * - Redigering av felter skjer inline, med input-felt som vises ved klikk.
 * - Data oppdateres med en `PUT`-forespørsel til backend ved lagring.
 * - Autentisering håndteres med JWT-token lagret i localStorage.
 */

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

  interface Rapport {
    _id: string;
    innhold: string;
    dato: string;
  }

  const [pasient, setPasient] = useState<Pasient | null>(null);
  const [rapporter, setRapporter] = useState<Rapport[]>([]);
  const [editableField, setEditableField] = useState<keyof Pasient | null>(
    null
  );
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

  const fetchRapporter = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `https://fysioterapi-backend-production.up.railway.app/api/rapporter/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setRapporter(data);
    } catch (err) {
      console.error("Feil ved henting av rapporter:", err);
    }
  };

  useEffect(() => {
    fetchPasient();
    fetchRapporter();
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
          <button onClick={handleSave} className="ml-2 text-sm text-blue-600">
            Lagre
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            const value = pasient?.[field];
            if (typeof value === "string" || typeof value === "number") {
              setEditedValue(value);
            } else {
              setEditedValue("");
            }
            setEditableField(field);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              const value = pasient?.[field];
              if (typeof value === "string" || typeof value === "number") {
                setEditedValue(value);
              } else {
                setEditedValue("");
              }
              setEditableField(field);
            }
          }}
          className="cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent border-none p-0"
        >
          {pasient?.[field] !== undefined && pasient?.[field] !== "" ? (
            (() => {
              const fieldValue = pasient?.[field];
              if (Array.isArray(fieldValue)) {
                return (
                  <span className="italic text-gray-400">
                    Ikke støttet for visning
                  </span>
                );
              }
              return fieldValue;
            })()
          ) : (
            <span className="italic text-gray-400">Klikk for å legge til</span>
          )}
        </button>
      )}
    </p>
  );

  return (
    <MaxWidthWrapper>
      <div className="p-8 max-w-3xl mx-auto bg-white rounded-lg">
        <h1 className="text-2xl font-bold mb-6">
          Pasientdetaljer for {pasient?.navn}:
        </h1>

        {pasient ? (
          <>
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border-2 border-gray-300 shadow-xl">
              {renderField("Navn", "navn")}
              {renderField("Alder", "alder")}
              {renderField("Kjønn", "kjønn")}
              {renderField("Adresse", "adresse")}
              {renderField("Telefon", "telefon")}
              {renderField("E-post", "epost")}
              {renderField("Diagnose", "diagnose")}
              {renderField("Smerterate ved første møte", "smerterate")}
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

            <div className="mt-5 bg-white p-6 rounded-lg shadow-xl border-2 border-gray-300">
              <h2 className="text-xl font-semibold mb-2">
                Tidligere rapporter
              </h2>
              {rapporter.length > 0 ? (
                <ul className="space-y-3">
                  {rapporter.map((rapport) => (
                    <li
                      key={rapport._id}
                      className="border p-4 rounded shadow-sm"
                    >
                      <p className="text-sm text-gray-500">
                        {new Date(rapport.dato).toLocaleDateString("no-NO")}
                      </p>
                      <p>{rapport.innhold}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-gray-500">
                  Ingen rapporter registrert.
                </p>
              )}
            </div>
          </>
        ) : (
          <p>Laster pasientinformasjon...</p>
        )}
      </div>
    </MaxWidthWrapper>
  );
}
