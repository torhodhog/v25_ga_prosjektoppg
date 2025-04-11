"use client";

import { SidebarDemo } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ navn: string; rolle: string } | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          "https://fysioterapi-backend-production.up.railway.app/api/auth/me",
          {
            credentials: "include", // Bruk cookies for autentisering
          }
        );

        if (!res.ok) {
          console.error("Feil ved autentisering: Status", res.status);
          throw new Error("Kunne ikke hente brukerdata");
        }

        const data = await res.json();

        if (data.rolle !== "terapeut") {
          router.push("/"); // Redirect hvis ikke terapeut
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("Feil ved henting av bruker:", error);
        router.push("/"); // Redirect ved feil
      }
    };

    fetchUser();
  }, [router]);

  if (!user) return null; // Ikke vis noe før brukerdata er lastet inn

  return (
    <div className="flex h-screen">
      <SidebarDemo user={user} />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
