"use client";

import { useState } from "react";

interface Melding {
  _id: string;
  sender: string;
  mottakerId: string;
  innhold: string;
  timestamp: string;
}

interface Props {
  meldinger: Melding[];
  setMeldinger: React.Dispatch<React.SetStateAction<Melding[]>>;
}

export default function MeldingListe({ meldinger, setMeldinger }: Props) {
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const handleReply = async (mottakerId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        "https://fysioterapi-backend-production.up.railway.app/api/meldinger",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mottakerId, innhold: replyText }),
        }
      );

      if (res.ok) {
        setReplyText("");
        setActiveReplyId(null);
      }
    } catch (err) {
      console.error("Feil ved sending av svar:", err);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `https://fysioterapi-backend-production.up.railway.app/api/meldinger/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setMeldinger((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      console.error("Feil ved sletting:", err);
    }
  };

  return (
    <ul className="space-y-4 mt-6">
      {meldinger.map((m) => (
        <li
          key={m._id}
          className={`p-4 rounded shadow-sm relative ${
            m.sender === "pasient"
              ? "bg-blue-50 border-l-4 border-blue-400"
              : "bg-green-50 border-l-4 border-green-400"
          }`}
        >
          <p className="text-xs text-gray-500 mb-1">
            {new Date(m.timestamp).toLocaleString("no-NO")} –{" "}
            {m.sender === "pasient" ? "Fra pasient" : "Fra deg"}
          </p>
          <p className="whitespace-pre-line">{m.innhold}</p>

          <div className="mt-2 flex gap-2 text-sm">
            <button
              onClick={() => handleDelete(m._id)}
              className="text-red-500 hover:underline"
            >
              Slett
            </button>
            <button
              onClick={() =>
                setActiveReplyId((prev) => (prev === m._id ? null : m._id))
              }
              className="text-teal hover:underline"
            >
              {activeReplyId === m._id ? "Avbryt" : "Svar"}
            </button>
          </div>

          {activeReplyId === m._id && (
            <div className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                className="w-full p-2 border rounded"
                placeholder="Skriv svaret ditt her..."
              />
              <button
                onClick={() => handleReply(m.mottakerId)}
                className="mt-2 bg-teal text-white px-4 py-2 rounded"
              >
                Send svar
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
