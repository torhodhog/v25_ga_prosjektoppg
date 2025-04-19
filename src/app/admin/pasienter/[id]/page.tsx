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
// import DeleteReportButton from "@/components/DeleteReportButton";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

import Speedometer from "@/components/Speedometer";

import { useParams, useRouter } from "next/navigation";
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
import { ArrowLeft } from "lucide-react";

export default function PatientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

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
  //   const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [patientRes, reportsRes] = await Promise.all([
        fetch(
          `https://fysioterapi-backend-production.up.railway.app/api/pasienter/${id}`,
          { credentials: "include" }
        ),
        fetch(
          `https://fysioterapi-backend-production.up.railway.app/api/rapporter/${id}`,
          { credentials: "include" }
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

    const res = await fetch(
      `https://fysioterapi-backend-production.up.railway.app/api/pasienter/${id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
  <div className="p-6 md:p-8 max-w-6xl mx-auto bg-light min-h-screen">
    <div className="mb-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-teal hover:underline"
      >
        <ArrowLeft className="h-5 w-5" />
        Tilbake
      </button>
    </div>

    <h1 className="text-3xl font-bold mb-6 text-teal">
      Pasientdetaljer for {patient?.navn}:
    </h1>

    {patient ? (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Venstre panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="space-y-2">
            <Link href={`/admin/logg/${patient._id}`}>
              <button className="bg-light_teal w-full text-white rounded px-3 py-2 text-sm mb-4">
                Se treningslogg 📋
              </button>
            </Link>
            <Link href={`/admin/notat/${patient._id}`}>
              <button className="bg-light_teal w-full text-white rounded px-3 py-2 text-sm">
                Lag nytt notat 📝
              </button>
            </Link>
          </div>

          <div className="bg-white p-4 rounded shadow text-sm border">
            <h2 className="text-center font-semibold text-gray-600 mb-2">
              Sjekkliste ({patient.alder} år)
            </h2>
            <ul className="space-y-1 text-gray-500">
              {["Benkjørhet", "Fallfare og balanse", "Hjerte-/karsykdommer", "Medisinbruk", "Sarkopeni", "Kognitiv funksjon og læringsevne", "Motivasjon, psykisk helse", "Hverdagsfunksjon og boligforhold", "Restitusjon"].map((punkt, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>{punkt}</span>
                  <input type="checkbox" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Midtpanel - Info og graf */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded shadow border">
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

          {patient.smertehistorikk?.length > 0 && (
            <div className="bg-white p-6 rounded shadow border">
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

        {/* Høyre panel */}
        <div className="lg:col-span-3 space-y-6">
          <Speedometer smerteVerdi={patient.smertehistorikk.at(-1)?.verdi ?? 0} />

          <AiAssistentPanel
            rapporter={reports}
            smertehistorikk={patient.smertehistorikk}
            onUse={(tekst) => {
              localStorage.setItem("foreslaattRapport", tekst);
              localStorage.setItem("foreslaattPasientId", patient._id);
              window.location.href = "/admin/rapporter";
            }}
          />

          <div className="flex flex-col gap-2">
            <DeletePatientButton
              patientId={patient._id}
              patientName={patient.navn}
              redirectAfterDelete={true}
            />
            <Link href="/admin/rapporter">
              <button className="bg-light_teal w-full text-white rounded px-3 py-2 text-sm">
                Lag ny rapport 📝
              </button>
            </Link>
          </div>
        </div>

        {/* Rapportsammendrag */}
        <div className="lg:col-span-12">
          <div className="bg-white p-6 rounded shadow border mt-4">
            <h2 className="text-lg font-semibold text-teal mb-4">
              Tidligere rapporter
            </h2>
            {reports.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((r) => (
                  <Link
                    key={r._id}
                    href={`/admin/rapporter/${r._id}`}
                    className="block border rounded-lg p-4 bg-light hover:bg-white shadow-sm transition group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500 font-medium">
                        {new Date(r.dato).toLocaleDateString("no-NO")}
                      </p>
                      <span className="text-gray-400 group-hover:text-teal">📄</span>
                    </div>
                    <p className="text-gray-600 text-sm italic line-clamp-3">
                      {r.innhold.replace(/\n/g, " ").slice(0, 140)}...
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="italic text-gray-400">Ingen rapporter registrert.</p>
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
