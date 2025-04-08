
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { input } = body;

  if (!input || typeof input !== "string") {
    return NextResponse.json({ error: "Ugyldig input" }, { status: 400 });
  }

  try {
  

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
Du er en erfaren fysioterapeut. Når du får stikkord fra en kollega, skal du skrive en profesjonell og strukturert pasientrapport.

Del rapporten inn i følgende tre seksjoner:

1. **Symptomer:** Kortfattet beskrivelse av hva pasienten opplever.
2. **Observasjoner:** Objektive funn og observasjoner under undersøkelse.
3. **Tiltak / Anbefalinger:** Faglige anbefalinger for videre behandling og konkrete øvelser/treningsopplegg.

Svar alltid i samme struktur. Bruk et nøytralt, klinisk språk.

Informasjonen din skal hentes fra anerkjente fysioterapikilder og evidensbasert praksis. Du kan gjerne lene deg på informasjon fra følgende ressurser:
- helsebiblioteket.no
- nhi.no
- fhi.no
- fysionett.no

Unngå personlige meninger. Du skal være en trygg og faglig autoritet.
`
,
          },
          {
            role: "user",
            content: input,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await res.json();

console.log("AI-response status:", res.status);
console.log("AI-response body:", data);


    const output = data.choices?.[0]?.message?.content;

    if (!output) {
      return NextResponse.json({ error: "Ingen respons fra AI." }, { status: 500 });
    }

    return NextResponse.json({ result: output });
  } catch {
    return NextResponse.json({ error: "Feil ved AI-kall." }, { status: 500 });
  }
}
