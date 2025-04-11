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
            credentials: "include", // Send cookies for autentisering
          }
        );

        if (!res.ok) {
          console.error("Feil ved autentisering: Status", res.status);
          const responseBody = await res.text();
          console.error("Headers mottatt:", res.headers);
          console.error("Body mottatt:", responseBody);

          if (res.status === 401) {
            console.error("401 Unauthorized: Brukeren er ikke autentisert.");
            router.push("/"); // Redirect til root hvis ikke autentisert
          }
          return;
        }

        const data = await res.json();

        if (data.rolle !== "terapeut") {
          console.error("Brukeren har ikke riktig rolle: ", data.rolle);
          router.push("/"); // Redirect hvis ikke terapeut
          return;
        }

        console.log("Brukerdata hentet: ", data);
        setUser(data);
      } catch (error) {
        console.error("Feil ved henting av bruker:", error);
        router.push("/login"); // Redirect ved feil
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
