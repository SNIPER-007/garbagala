import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { adminDb } from "@/lib/firebase-admin/config";
import { generateSecureQrToken } from "@/lib/qr/token";
import { generateTicketPdf } from "@/lib/pdf/ticket-pdf";
import { sendTicketEmail } from "@/lib/resend";
import { EVENT_DETAILS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      console.warn("Razorpay Webhook: Invalid signature received.");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured" || event === "order.paid") {
      const entity = payload.payload.payment?.entity || payload.payload.order?.entity;
      const orderId = entity.order_id || entity.id;
      const paymentId = entity.id;

      if (!orderId) {
        return NextResponse.json({ received: true });
      }

      // Search booking
      const bookingsQuery = await adminDb.collection("bookings")
        .where("razorpayOrderId", "==", orderId)
        .limit(1)
        .get();

      if (bookingsQuery.empty) {
        console.warn(`Webhook: No matching booking for orderId ${orderId}`);
        return NextResponse.json({ received: true });
      }

      const bookingDoc = bookingsQuery.docs[0];
      const bookingData = bookingDoc.data();

      // Idempotency: if already paid, skip double fulfillment
      if (bookingData.paymentStatus === "paid") {
        return NextResponse.json({ received: true, alreadyPaid: true });
      }

      // Perform atomic ticket generation & inventory update
      const generatedTicketNumbers: string[] = [];

      await adminDb.runTransaction(async (transaction) => {
        const counterRef = adminDb.collection("counters").doc("tickets");
        const counterSnap = await transaction.get(counterRef);

        let currentCounter = 0;
        if (counterSnap.exists) {
          currentCounter = counterSnap.data()?.lastNumber || 0;
        }

        const ticketTypeRef = adminDb.collection("ticketTypes").doc("general-sale");
        const ticketTypeSnap = await transaction.get(ticketTypeRef);

        let currentSold = 0;
        let totalQty = 150;
        if (ticketTypeSnap.exists) {
          currentSold = ticketTypeSnap.data()?.soldQuantity || 0;
          totalQty = ticketTypeSnap.data()?.totalQuantity || 150;
        }

        const qtyNeeded = bookingData.quantity || 1;
        const newCounter = currentCounter + qtyNeeded;

        transaction.set(counterRef, { lastNumber: newCounter }, { merge: true });
        transaction.set(ticketTypeRef, { soldQuantity: currentSold + qtyNeeded }, { merge: true });

        for (let i = 0; i < qtyNeeded; i++) {
          const sequentialNum = currentCounter + i + 1;
          const formattedNum = `GG26-${String(sequentialNum).padStart(6, "0")}`;
          generatedTicketNumbers.push(formattedNum);

          const ticketRef = adminDb.collection("tickets").doc();
          const qrToken = generateSecureQrToken();

          transaction.set(ticketRef, {
            ticketId: ticketRef.id,
            bookingId: bookingData.bookingId,
            eventId: EVENT_DETAILS.eventId,
            ticketNumber: formattedNum,
            ticketType: bookingData.ticketType || "General Sale",
            holderName: bookingData.purchaserName,
            holderEmail: bookingData.purchaserEmail,
            holderPhone: bookingData.purchaserPhone,
            qrToken,
            ticketStatus: "valid",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        transaction.update(bookingDoc.ref, {
          paymentStatus: "paid",
          bookingStatus: "paid",
          razorpayPaymentId: paymentId,
          paymentVerifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      // PDF & Email
      const pdfBuffer = await generateTicketPdf({
        ticketNumber: generatedTicketNumbers[0] || "GG26-000001",
        bookingId: bookingData.bookingId,
        holderName: bookingData.purchaserName,
        ticketType: bookingData.ticketType || "General Sale",
        qrToken: generateSecureQrToken(),
        price: bookingData.totalAmount / (bookingData.quantity || 1),
      }).catch(() => undefined);

      await sendTicketEmail({
        toEmail: bookingData.purchaserEmail,
        purchaserName: bookingData.purchaserName,
        bookingId: bookingData.bookingId,
        ticketNumbers: generatedTicketNumbers,
        quantity: bookingData.quantity,
        totalAmount: bookingData.totalAmount,
        pdfAttachment: pdfBuffer,
      }).catch((e) => console.error("Webhook email warning:", e));

      return NextResponse.json({ received: true, fulfilled: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Razorpay webhook handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
