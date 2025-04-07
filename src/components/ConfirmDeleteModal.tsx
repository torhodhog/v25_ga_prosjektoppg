"use client";
import React from "react";

interface Props {
  confirmation: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  error?: string | null;
}

export default function ConfirmDeleteModal({
  confirmation,
  onChange,
  onConfirm,
  onCancel,
  error,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-red-600">Bekreft sletting</h2>
        <p className="text-sm mb-2">
          Skriv <strong>&quot;Slett pasient permanent&quot;</strong> for å bekrefte sletting:
        </p>
        <input
          type="text"
          value={confirmation}
          onChange={(e) => onChange(e.target.value)}
          className="border p-2 w-full rounded"
        />
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Avbryt
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Bekreft sletting
          </button>
        </div>
      </div>
    </div>
  );
}
