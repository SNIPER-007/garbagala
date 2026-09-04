import { NextResponse } from "next/server";
import { handlePayUFormPost } from "@/app/api/payu/handle-response";

export async function POST(request: Request) {
  try {
    return await handlePayUFormPost(request, "webhook");
  } catch (error: any) {
    console.error("PayU webhook handler error:", error);
    return NextResponse.json({ error: error.message || "PayU webhook failed." }, { status: 500 });
  }
}

