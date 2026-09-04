import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/config";
import { fulfillPaidBooking } from "@/lib/tickets/fulfillment";
import { isPayUSuccessStatus, verifyPayUPayment } from "@/lib/payu";

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing booking ID." }, { status: 400 });
    }

    const bookingSnap = await adminDb.collection("bookings").doc(bookingId).get();
    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const bookingData = bookingSnap.data()!;

    if (bookingData.paymentStatus === "paid" && bookingData.bookingStatus === "paid") {
      const ticketsSnap = await adminDb.collection("tickets")
        .where("bookingId", "==", bookingData.bookingId)
        .get();

      return NextResponse.json({
        success: true,
        alreadyFulfilled: true,
        bookingId: bookingData.bookingId,
        ticketNumbers: ticketsSnap.docs.map((doc) => doc.data().ticketNumber),
      });
    }

    if (bookingData.paymentProvider !== "payu" || !bookingData.payuTxnId) {
      return NextResponse.json({ error: "Unsupported or missing payment transaction." }, { status: 400 });
    }

    const payment = await verifyPayUPayment(bookingData.payuTxnId);
    const amountMatches = Number(payment.amount).toFixed(2) === Number(bookingData.totalAmount).toFixed(2);

    if (!isPayUSuccessStatus(payment) || !amountMatches) {
      return NextResponse.json(
        { error: "Payment is not confirmed yet." },
        { status: 202 }
      );
    }

    const result = await fulfillPaidBooking({
      bookingDocId: bookingSnap.id,
      providerPaymentId: payment.mihpayid,
      providerRaw: payment.raw,
    });

    return NextResponse.json({
      success: true,
      bookingId: result.bookingId,
      ticketNumbers: result.ticketNumbers,
      alreadyFulfilled: result.alreadyFulfilled,
    });
  } catch (error: any) {
    console.error("Payment verification API error:", error);
    return NextResponse.json(
      { error: error.message || "Server-side payment verification failed." },
      { status: 500 }
    );
  }
}

