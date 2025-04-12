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

    try {
      const res = await fetch(
        `https://fysioterapi-backend-production.up.railway.app/api/pasienter/${patientId}`,
        {
          method: "DELETE",
          credentials: "include", // Dette mener jeg med 'include' i fetch. 
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Feil ved sletting av pasient:", errorData);
        setError(errorData.error || "Kunne ikke slette pasienten.");
        return;
      }

      if (redirectAfterDelete) {
        router.push("/admin/pasienter");
      } else if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      console.error("Noe gikk galt ved sletting:", err);
      setError("Noe gikk galt ved sletting.");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-black hover:text-red-900 text-sm bg-peach p-4 pr-6  ml-2 mb-2 rounded-sm"
      >
        Slett pasient 🗑️
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
