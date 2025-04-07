// File: components/AIReportHelper.tsx
"use client";

import { useState } from "react";

interface Props {
   patientId: string;
   onSaved?: () => void;
   initialInput?: string; // 👈 legg til denne linja
   onFillFields?: ({ rapport, forslag }: { rapport: string; forslag: string }) => void;
 }
 

export default function AIReportHelper({ patientId, onSaved }: Props) {
  const [input, setInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateWithAI = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ukjent feil");
      setAiResponse(data.result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ukjent feil");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Token mangler.");

    const res = await fetch(
      `https://fysioterapi-backend-production.up.railway.app/api/rapporter/${patientId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ innhold: aiResponse }),
      }
    );

    if (res.ok) {
      alert("Rapport lagret!");
      setInput("");
      setAiResponse("");
      onSaved?.();
    } else {
      alert("Kunne ikke lagre rapport.");
    }
  };

  return (
   <div className="bg-white p-6 rounded-xl shadow border min-h-[700px] flex flex-col justify-between">
     <div>
       <h2 className="text-lg font-semibold text-teal mb-4">
         AI-assistent: Foreslå rapport
       </h2>
 
       <textarea
         placeholder="Skriv stikkord her..."
         value={input}
         onChange={(e) => setInput(e.target.value)}
         rows={6}
         className="w-full border rounded p-2 text-sm mb-2 resize-none"
       />
 
       <button
         onClick={generateWithAI}
         disabled={loading || !input.trim()}
         className="w-full py-2 bg-teal text-white rounded hover:bg-teal-600 disabled:opacity-50"
       >
         {loading ? "Henter forslag..." : "Foreslå med AI"}
       </button>
 
       {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
     </div>
 
     {aiResponse && (
       <div className="mt-6 flex flex-col flex-grow">
         <h3 className="font-semibold mb-2">AI-forslag (kan redigeres):</h3>
         <textarea
           value={aiResponse}
           onChange={(e) => setAiResponse(e.target.value)}
           className="w-full border rounded p-2 text-sm resize-none flex-grow"
         />
         <button
           onClick={saveReport}
           className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
         >
           Lagre rapport
         </button>
       </div>
     )}
   </div>
 );
 
}
