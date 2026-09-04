import { NextResponse } from "next/server";
import { handlePayUFormPost } from "@/app/api/payu/handle-response";
import { parsePayUFormPayload } from "@/lib/payu";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const clonedRequest = new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: rawBody,
  });
  const params = parsePayUFormPayload(rawBody);
  const result = await handlePayUFormPost(clonedRequest, "callback");
  const bookingId = params.udf1;
  const redirectUrl = new URL(
    bookingId ? `/booking/success?bookingId=${encodeURIComponent(bookingId)}` : "/my-tickets",
    request.url
  );

  if (!result.ok) {
    redirectUrl.searchParams.set("payment", "pending");
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}

