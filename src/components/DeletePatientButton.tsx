"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

interface Props {
  patientId: string;
  patientName: string;
  redirectAfterDelete?: boolean;
  onDeleted?: () => void;
}

export default function DeletePatientButton({
  patientId,
  
  redirectAfterDelete = false,
  onDeleted,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmation !== "Slett pasient permanent") {
      setError('Du må skrive "Slett pasient permanent" for å bekrefte.');
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Ingen token funnet.");
      return;
    }

    try {
      const res = await fetch(
        `https://fysioterapi-backend-production.up.railway.app/api/pasienter/${patientId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Kunne ikke slette pasienten.");
        return;
      }

      if (redirectAfterDelete) {
        router.push("/admin/pasienter");
      } else if (onDeleted) {
        onDeleted();
      }
    } catch {
      setError("Noe gikk galt ved sletting.");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-red-600 hover:text-red-900 text-sm bg-gray-300 p-4 rounded-sm"
      >
        Slett pasient
      </button>

      {showModal && (
        <ConfirmDeleteModal
          confirmation={confirmation}
          onChange={setConfirmation}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowModal(false);
            setConfirmation("");
            setError(null);
          }}
          error={error}
        />
      )}
    </>
  );
}
