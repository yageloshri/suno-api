import { NextResponse, NextRequest } from "next/server";
import { cookies } from 'next/headers';
import { DEFAULT_MODEL, sunoApi } from "@/lib/SunoApi";
import { corsHeaders } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', {
      headers: {
        Allow: 'POST',
        ...corsHeaders
      },
      status: 405
    });
  }

  try {
    const body = await req.json();
    const { prompt, make_instrumental, model, wait_audio } = body;

    console.log("✅ Received Request Body:", body);

    // 🛑 בדיקה אם `prompt` קיים
    if (!prompt) {
      console.error("❌ Error: Missing 'prompt' in request body", body);
      return new NextResponse(JSON.stringify({ error: "Missing 'prompt' in request body" }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 🔥 ניסיון לבצע קריאה ל-Suno API
    const audioInfo = await (await sunoApi((await cookies()).toString())).generate(
      prompt,
      Boolean(make_instrumental),
      model || DEFAULT_MODEL,
      Boolean(wait_audio)
    );

    return new NextResponse(JSON.stringify(audioInfo), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error: any) {
    console.error('🔥 API ERROR:', error);

    // 🛑 טיפול בשגיאות בצורה בטוחה
    const statusCode = error.response?.status || 500;
    const errorDetail = error.response?.data?.detail || "Unknown server error";

    return new NextResponse(JSON.stringify({ error: `Internal server error: ${errorDetail}` }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}
