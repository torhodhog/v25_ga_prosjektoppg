"use client";
import { useState } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function SettingsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Velg et bilde først!");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://fysioterapi-backend-production.up.railway.app/api/profil/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Kunne ikke laste opp bilde");

      const data = await res.json();
      setSuccessMessage("Profilbilde oppdatert!");
      setUploadError(null);

      // Lagre bildet lokalt for rask oppdatering
      localStorage.setItem("profileImage", data.bildeUrl);
    } catch (error) {
      console.error("Feil ved bildeopplasting:", error);
      setUploadError("Noe gikk galt. Prøv igjen.");
    }
  };

  return (
    <MaxWidthWrapper>
      <div className="max-w-3xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold">Innstillinger</h1>
        <p className="text-gray-500">Last opp et nytt profilbilde</p>

        <input type="file" onChange={handleFileChange} className="mt-4" />
        <button
          onClick={handleUpload}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Last opp bilde
        </button>

        {uploadError && <p className="text-red-500 mt-4">{uploadError}</p>}
        {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
      </div>
    </MaxWidthWrapper>
  );
}

