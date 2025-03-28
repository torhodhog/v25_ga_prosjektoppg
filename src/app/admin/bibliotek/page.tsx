"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { bibliotek } from "./bibliotekData";

export default function BibliotekPage() {
  return (
    <MaxWidthWrapper>
      <h1 className="text-2xl font-bold mb-6">Fagbibliotek</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bibliotek.map((item, i) => (
          <div key={i} className="border p-4 rounded-lg shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold">{item.tittel}</h2>
            <p className="text-sm text-gray-600">{item.beskrivelse}</p>
            <p className="text-sm text-gray-500 mt-1">
              Type: <span className="italic">{item.type}</span> | Kategori: {item.kategori.join(", ")}
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-600 hover:underline"
            >
              Åpne {item.type === "PDF" ? "PDF" : item.type === "Video" ? "video" : "lenke"}
            </a>
          </div>
        ))}
      </div>

      <iframe
  src="https://www.innerbody.com/anatomy/integumentary"
  title="Innerbody Anatomy"
  width="100%"
  height="1000"
  className="rounded border"
/>

    </MaxWidthWrapper>
  );
}
