import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { rapporter, smertehistorikk } = body;

  if (!rapporter || !smertehistorikk) {
    return NextResponse.json({ error: "Mangler data" }, { status: 400 });
  }

  try {
    const input = `
Pasientens tidligere rapporter:
${rapporter.map((r: { innhold: string }) => `- ${r.innhold}`).join("\n")}

Smertehistorikk:
${smertehistorikk.map((s: { dato: string; verdi: string | number }) => `- ${s.dato}: ${s.verdi}`).join("\n")}

Basert på dette, lag en kort oppsummering av symptomer, observasjoner og anbefalte tiltak.
`;

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
Du er en profesjonell fysioterapiassistent. Basert på tidligere rapporter og smertehistorikk skal du lage en kort oppsummering. Følg denne strukturen:

1. Symptomer
2. Observasjoner
3. Tiltak

Bruk klinisk og nøytralt språk. Maks 5 linjer totalt.`,
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

    const output = data.choices?.[0]?.message?.content;

    if (!output) {
      return NextResponse.json({ error: "Ingen respons fra AI." }, { status: 500 });
    }

    return NextResponse.json({ result: output });
  } catch {
    return NextResponse.json({ error: "Feil ved AI-kall." }, { status: 500 });
  }
}
