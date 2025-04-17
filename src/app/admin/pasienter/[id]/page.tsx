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
import DeleteReportButton from "@/components/DeleteReportButton";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

import Speedometer from "@/components/Speedometer";
import MeldingListe from "@/components/MeldingListe";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import AiAssistentPanel from "@/components/AIAssistentPanel";

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

  interface Melding {
    _id: string;
    sender: string;
    mottakerId: string;
    innhold: string;
    timestamp: string;
  }

  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [meldinger, setMeldinger] = useState<Melding[]>([]);
  const [editableField, setEditableField] = useState<keyof Patient | null>(
    null
  );
  const [editedValue, setEditedValue] = useState<string | number>("");
  const [open, setOpen] = useState(false);
  const [logg, setLogg] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [patientRes, reportsRes, meldingerRes] = await Promise.all([
        fetch(
          `https://fysioterapi-backend-production.up.railway.app/api/pasienter/${id}`,
          { credentials: "include" } // Bruk cookies for autentisering
        ),
        fetch(
          `https://fysioterapi-backend-production.up.railway.app/api/rapporter/${id}`,
          { credentials: "include" } // Bruk cookies for autentisering
        ),
        fetch(
          `https://fysioterapi-backend-production.up.railway.app/api/meldinger/${id}`,
          { credentials: "include" } // Bruk cookies for autentisering
        ),
      ]);

      const patientData = await patientRes.json();
      const reportsData = await reportsRes.json();
      const meldingerData = await meldingerRes.json();

      setPatient(patientData);
      setReports(reportsData);
      setMeldinger(meldingerData);
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

  const opprettLogg = async () => {
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/logg", {
        method: "POST",
        credentials: "include", // Bruk cookies for autentisering
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pasientId: id,
          tekst: logg,
        }),
      });

      if (!res.ok) {
        throw new Error("Kunne ikke opprette logg");
      }

      setSuccess("Logg opprettet!");
      setLogg("");
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError(
          err && typeof err === "object" && "message" in err
            ? (err.message as string) || "Noe gikk galt"
            : "Noe gikk galt"
        );
      } else {
        setError("Noe gikk galt");
      }
    }
  };

  // Removed unused function 'getLabel' to resolve the compile error.

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
        <h1 className="text-3xl font-bold mb-10 text-teal text-center">
          Pasientdetaljer for {patient?.navn}:
        </h1>

        {patient ? (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 space-y-6">
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
                </div>
              </div>
            </div>

            {/* Smertehistorikk */}
            <div className="lg:col-span-6 space-y-6">
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

            {/* Siste status */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white p-4 rounded-xl shadow text-center border">
                <Link href={`/logg/${patient._id}`}>
                  <button className="text-teal mt-2 underline">
                    Se treningslogg <br></br> (VIRKER IKKE ENDA)
                  </button>
                </Link>
              </div>
            </div>

            {/* Speedometer */}
            <div className="lg:col-span-3 space-y-6">
              <Speedometer
                smerteVerdi={patient.smertehistorikk.at(-1)?.verdi ?? 0}
              />
            </div>

            {/* Sjekkliste */}
            <div className="lg:col-span-3">
              <div className="bg-white p-4 rounded-xl shadow text-sm border">
                <h2 className="text-center font-semibold text-gray-600">
                  Sjekkliste for pasienter i alderen {patient.alder}
                </h2>
                <ul className="mt-2 list-disc pl-4 text-gray-500">
                  <li>
                    Benkjørhet <input type="checkbox" />
                  </li>
                  <li>
                    Fallfare og balanse <input type="checkbox" />
                  </li>
                  <li>
                    Hjerte-/karsykdommer <input type="checkbox" />
                  </li>
                  <li>
                    Medisinbruk <input type="checkbox" />
                  </li>
                  <li>
                    Sarkopeni <input type="checkbox" />
                  </li>
                  <li>
                    Kognitiv funksjon og læringsevne <input type="checkbox" />
                  </li>
                  <li>
                    Motivasjon, psykisk helse <input type="checkbox" />
                  </li>
                  <li>
                    Hverdagsfunksjon og boligforhold <input type="checkbox" />
                  </li>
                  <li>
                    Restitusjon <input type="checkbox" />
                  </li>
                </ul>
              </div>
            </div>

            {/* Alle rapporter */}
            <div className="lg:col-span-12 mt-10" id="rapporter">
              <div className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-lg font-semibold text-teal mb-4">
                  Tidligere rapporter
                </h2>
                {reports.length > 0 ? (
                  <ul className="space-y-3 text-sm text-gray-700">
                    {reports.map((r) => {
                      const [symptomer, observasjoner, tiltak] =
                        r.innhold.split("\n\n");
                      return (
                        <li
                          key={r._id}
                          className="border p-4 rounded shadow-sm bg-white hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => setOpen((prev) => !prev)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500 font-medium">
                                {new Date(r.dato).toLocaleDateString("no-NO")}
                              </p>
                              {!open ? (
                                <p className="mt-1 text-gray-500 italic truncate">
                                  {r.innhold.slice(0, 80)}...
                                </p>
                              ) : (
                                <div className="mt-2 space-y-2 whitespace-pre-line">
                                  <p>
                                    <strong>🩺 Symptomer:</strong>
                                    <br />
                                    {symptomer || "Ikke spesifisert"}
                                  </p>
                                  <p>
                                    <strong>👁 Observasjoner:</strong>
                                    <br />
                                    {observasjoner || "Ikke spesifisert"}
                                  </p>
                                  <p>
                                    <strong>✅ Tiltak:</strong>
                                    <br />
                                    {tiltak || "Ikke spesifisert"}
                                  </p>
                                </div>
                              )}
                            </div>

                            <DeleteReportButton
                              reportId={r._id}
                              onDeleted={() =>
                                setReports((prev) =>
                                  prev.filter((rep) => rep._id !== r._id)
                                )
                              }
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="italic text-gray-400">
                    Ingen rapporter registrert.
                  </p>
                )}
              </div>
            </div>

            {/* Meldinger */}
            <div className="lg:col-span-12">
              <MeldingListe meldinger={meldinger} setMeldinger={setMeldinger} />
            </div>

            {/* Opprett logg */}
            <div className="lg:col-span-12 mt-10">
              <div className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-lg font-semibold text-teal mb-4">
                  Opprett logg for pasient
                </h2>

                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}

                <textarea
                  value={logg}
                  onChange={(e) => setLogg(e.target.value)}
                  placeholder="Skriv loggtekst her..."
                  className="w-full border p-2 rounded mb-4"
                  rows={5}
                />

                <button
                  onClick={opprettLogg}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Lagre logg
                </button>
              </div>
            </div>
            {/* Lag ny rapport knapp */}
            <div className="lg:col-span-3 space-y-6">
              <Link href="/admin/rapporter">
                <button className="bg-light_teal text-white rounded-sm px-3 py-4 text-sm">
                  Lag ny rapport 📝
                </button>
              </Link>
            </div>

            {/* Slett pasient knapp */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex gap-2 justify-center">
                <DeletePatientButton
                  patientId={patient._id}
                  patientName={patient.navn}
                  redirectAfterDelete={true}
                />
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
