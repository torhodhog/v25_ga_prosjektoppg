"use client";

import { useEffect, useState } from "react";
// import ChatbotButton from "@/components/ChatBotButtom";
import GridComponent from "@/components/gridComponent";

interface Terapeut {
  navn: string;
  epost: string;
  // legg til flere felter hvis nødvendig
}

export default function AdminPage() {
  const [terapeut, setTerapeut] = useState<Terapeut | null>(null);

  useEffect(() => {
    const fetchTerapeut = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(
          "https://fysioterapi-backend-production.up.railway.app/api/auth/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Kunne ikke hente brukerdata");
        const data = await res.json();
        setTerapeut(data);
      } catch (err) {
        console.error("Feil ved henting av terapeut:", err);
      }
    };

    fetchTerapeut();
  }, []);

  return (
    <div className="bg-light/50 min-h-screen">
      <h1 className="text-xl text-neutral_gray font-bold ml-12 pt-8">
        Tilgang kun for <br></br> <span className="font-extrabold text-black text-2xl">{terapeut?.navn ?? "innlogget bruker"}</span>
      </h1>
      <GridComponent />
      {/* <ChatbotButton /> */}
    </div>
  );
}
