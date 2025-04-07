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

import DeletePatientButton from "@/components/DeletePatientButton";
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

export default function PatientDetailsPage() {
  const { id } = useParams();

  interface Patient {
    _id: string;
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

  interface Report {
    _id: string;
    innhold: string;
    dato: string;
  }

  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [editableField, setEditableField] = useState<keyof Patient | null>(
    null
  );
  const [editedValue, setEditedValue] = useState<string | number>("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [patientRes, reportsRes] = await Promise.all([
        fetch(
          `https://fysioterapi-backend-production.up.railway.app/api/pasienter/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          `https://fysioterapi-backend-production.up.railway.app/api/rapporter/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const patientData = await patientRes.json();
      const reportsData = await reportsRes.json();
      setPatient(patientData);
      setReports(reportsData);
    };

    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!editableField || !patient) return;
    const token = localStorage.getItem("token");

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
    setPatient(updated);
    setEditableField(null);
  };

  const renderField = (label: string, field: keyof Patient) => (
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
            const value = patient?.[field];
            setEditedValue(
              typeof value === "string" || typeof value === "number"
                ? value
                : ""
            );
            setEditableField(field);
          }}
          className="cursor-pointer hover:underline bg-transparent border-none p-0"
        >
          {patient?.[field] !== undefined && patient?.[field] !== "" ? (
            Array.isArray(patient?.[field]) ? (
              <span className="italic text-neutral_gray">Ikke visbar</span>
            ) : (
              patient?.[field]
            )
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
      <div className="p-8 max-w-6xl mx-auto bg-light min-h-screen">
        <h1 className="text-3xl font-bold mb-10 text-teal">
          Pasientdetaljer for {patient?.navn}:
        </h1>

        {patient ? (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Smiley + Sjekkliste */}
            <div className="lg:col-span-3 space-y-6">
              <SmileyIndicator
                verdi={patient.smertehistorikk.at(-1)?.verdi ?? 0}
              />
              <div className="bg-white p-4 rounded-xl shadow text-sm border">
                <h2 className="text-center font-semibold text-gray-600">
                  Sjekkliste for pasienter i alderen {patient.alder}
                </h2>
                <ul className="mt-2 list-disc pl-4 text-gray-500">
                  <li>Innhent samtykke</li>
                  <li>Vurder henvisning</li>
                </ul>
              </div>
            </div>

            {/* Info + graf */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-lg font-semibold text-teal mb-4">
                  Pasientinfo
                </h2>
                <div className="space-y-3 text-sm text-gray-700">
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
              </div>

              {patient.smertehistorikk?.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow border">
                  <h2 className="text-lg font-semibold text-teal mb-4">
                    Smerteutvikling
                  </h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={patient.smertehistorikk.map((entry) => ({
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
            </div>

            {/* Speedometer + slett */}
            <div className="lg:col-span-3 flex flex-col items-center justify-between">
              <Speedometer
                smerteVerdi={patient.smertehistorikk.at(-1)?.verdi ?? 0}
              />
              <div className="mt-6">
                <DeletePatientButton
                  patientId={patient._id}
                  patientName={patient.navn}
                  redirectAfterDelete={true}
                />
              </div>
            </div>

            {/* Rapporter */}
            <div className="lg:col-span-12 mt-10">
              <div className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-lg font-semibold text-teal mb-4">
                  Tidligere rapporter
                </h2>
                {reports.length > 0 ? (
                  <ul className="space-y-3 text-sm text-gray-700">
                    {reports.map((r) => (
                      <li key={r._id} className="border p-4 rounded shadow-sm">
                        <p className="text-sm text-gray-500">
                          {new Date(r.dato).toLocaleDateString("no-NO")}
                        </p>
                        <p>{r.innhold}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-gray-400">
                    Ingen rapporter registrert.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p>Laster pasientinformasjon...</p>
        )}
      </div>
    </MaxWidthWrapper>
  );
}
