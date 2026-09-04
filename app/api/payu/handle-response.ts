import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/config";
import {
  isPayUSuccessStatus,
  parsePayUFormPayload,
  verifyPayUResponseHash,
  verifyPayUPayment,
} from "@/lib/payu";
import { fulfillPaidBooking } from "@/lib/tickets/fulfillment";

export async function handlePayUFormPost(request: Request, source: "callback" | "webhook") {
  const rawBody = await request.text();
  const params = parsePayUFormPayload(rawBody);

  if (!verifyPayUResponseHash(params)) {
    console.warn(`PayU ${source}: invalid response hash.`);
    return NextResponse.json({ error: "Invalid PayU response hash." }, { status: 400 });
  }

  const txnid = params.txnid;
  if (!txnid) {
    return NextResponse.json({ error: "Missing PayU transaction ID." }, { status: 400 });
  }

  const bookingQuery = await adminDb.collection("bookings")
    .where("payuTxnId", "==", txnid)
    .limit(1)
    .get();

  if (bookingQuery.empty) {
    console.warn(`PayU ${source}: no matching booking for txnid ${txnid}.`);
    return NextResponse.json({ received: true });
  }

  const bookingDoc = bookingQuery.docs[0];
  const bookingData = bookingDoc.data();

  if (params.udf1 && params.udf1 !== bookingData.bookingId) {
    return NextResponse.json({ error: "PayU booking reference mismatch." }, { status: 400 });
  }

  if (params.amount && Number(params.amount).toFixed(2) !== Number(bookingData.totalAmount).toFixed(2)) {
    return NextResponse.json({ error: "PayU amount mismatch." }, { status: 400 });
  }

  if (bookingData.paymentStatus === "paid" && bookingData.bookingStatus === "paid") {
    return NextResponse.json({ received: true, success: true, alreadyFulfilled: true });
  }

  const payment = await verifyPayUPayment(txnid);
  const amountMatches = Number(payment.amount).toFixed(2) === Number(bookingData.totalAmount).toFixed(2);

  if (!isPayUSuccessStatus(payment) || !amountMatches) {
    await bookingDoc.ref.set({
      paymentStatus: "failed",
      bookingStatus: "failed",
      paymentProviderRaw: {
        source,
        callback: params,
        verification: payment.raw,
      },
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ received: true, success: false });
  }

  const result = await fulfillPaidBooking({
    bookingDocId: bookingDoc.id,
    providerPaymentId: payment.mihpayid || params.mihpayid,
    providerRaw: {
      source,
      callback: params,
      verification: payment.raw,
    },
  });

  return NextResponse.json({
    received: true,
    success: true,
    bookingId: result.bookingId,
    ticketNumbers: result.ticketNumbers,
    alreadyFulfilled: result.alreadyFulfilled,
  });
}

