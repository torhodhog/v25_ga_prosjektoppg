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
            content: `Du er en erfaren fysioterapeut. Når du får et behandlingsnotat, skal du foreslå en kort og faglig tentativ diagnose basert på notatet. Svar med kun selve diagnosen, og ingenting annet.`,
          },
          {
            role: "user",
            content: input,
          },
        ],
        temperature: 0.3,
      }),
    });

    const data = await res.json();
    const output = data.choices?.[0]?.message?.content?.trim();

    if (!output) {
      return NextResponse.json({ error: "Ingen respons fra AI." }, { status: 500 });
    }

    return NextResponse.json({ result: output });
  } catch (err) {
    console.error("Feil i diagnosegenerering:", err);
    return NextResponse.json({ error: "Feil ved AI-kall." }, { status: 500 });
  }
}
