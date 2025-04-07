
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
            content:
              "Du er en erfaren fysioterapeut. Når du får stikkord fra en kollega, skriver du en kort profesjonell rapporttekst med forslag til treningsopplegg. Vær presis og konkret. Del opp teksten i 'Rapport' og 'Forslag til treningsopplegg'.",
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
