"use client";

import { useState } from "react";

interface Props {
  reportId: string;
  onDeleted: () => void;
}

export default function DeleteReportButton({ reportId, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    const bekreft = confirm("Er du sikker på at du vil slette denne rapporten?");
    if (!bekreft) return;

    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Ingen token funnet.");
      setLoading(false);
      return;
    }

    const res = await fetch(
      `https://fysioterapi-backend-production.up.railway.app/api/rapporter/${reportId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      onDeleted();
    } else {
      setError("Kunne ikke slette rapporten.");
    }

    setLoading(false);
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-500 text-xs ml-2 hover:underline"
      >
        {loading ? "Sletter..." : "🗑️ "}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </>
  );
}
