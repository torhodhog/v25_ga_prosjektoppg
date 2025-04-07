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
import SmileyIndicator from "@/components/SmileyIndicator";
import Speedometer from "@/components/Speedometer";
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
          <button onClick={handleSave} className="ml-2 text-sm text-teal">
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
                  <span className="italic text-neutral_gray">
                    Ikke støttet for visning
                  </span>
                );
              }
              return fieldValue;
            })()
          ) : (
            <span className="italic text-neutral_gray">
              Klikk for å legge til
            </span>
          )}
        </button>
      )}
    </p>
  );

  return (
    <MaxWidthWrapper>
      <div className="p-8 max-w-5xl mx-auto bg-light rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-neutral_gray">
          Pasientdetaljer for {pasient?.navn}:
        </h1>

        {pasient ? (
          <>
            {/* Flex-container for layout */}
            <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
              <div className="lg:w-1/4 flex flex-col items-center">
                {/* SmileyIndicator */}
                <div className="mb-4">
                  <SmileyIndicator
                    verdi={pasient.smertehistorikk.at(-1)?.verdi ?? 0}
                  />
                </div>

                <div className="w-full h-80 bg-creamy rounded-lg shadow-md p-4">
                  <h2 className="font-bold text-center text-neutral_gray">
                    Sjekkliste for pasienter i alderen {pasient.alder} :
                  </h2>
                </div>
              </div>

              {/* Pasientdetaljer og smerteutvikling i midten */}
              <div className="lg:w-2/4 space-y-6">
                <div className="space-y-4 bg-creamy p-6 rounded-lg border-2 border-s shadow-xl text-neutral_gray">
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
                  <div>
                    <h2 className="text-xl font-semibold mb-2 ">
                      Smerteutvikling
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={pasient.smertehistorikk.map((entry) => ({
                          ...entry,
                          dato: new Date(entry.dato).toLocaleDateString(
                            "no-NO"
                          ),
                        }))}
                      >
                        <XAxis dataKey="dato" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="verdi"
                          stroke="#ef4444"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Speedometer til høyre */}
              <div className="lg:w-1/4 flex justify-center items-center">
                <Speedometer
                  smerteVerdi={pasient.smertehistorikk.at(-1)?.verdi ?? 0}
                />
              </div>
            </div>

            {/* Tidligere rapporter */}
            <div className="mt-5 bg-creamy p-6 rounded-lg shadow-xl border-2 border-gray-300">
              <h2 className="text-xl text-neutral_gray font-semibold mb-2">
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
                <p className="italic text-neutral_gray">
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
