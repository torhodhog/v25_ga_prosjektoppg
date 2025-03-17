"use client";
import { useEffect, useState } from "react";
import { SidebarDemo } from "@/components/Sidebar";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function AdminPage() {
  const [user, setUser] = useState<{ navn: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("https://fysioterapi-backend-production.up.railway.app/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Kunne ikke hente brukerdata");

        const data = await res.json();
        setUser(data); // Oppdater brukerinfo
      } catch (error) {
        console.error("Feil ved henting av bruker:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex">
      <SidebarDemo user={user} /> {/* Sender brukerinfo til sidebar */}
      <MaxWidthWrapper>
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Velkommen til admin-panelet</h1>
      </div>
      </MaxWidthWrapper>
    </div>
  );
}
