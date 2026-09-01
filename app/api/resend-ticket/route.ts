import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/config";
import { sendTicketEmail } from "@/lib/resend";
import { generateTicketPdf } from "@/lib/pdf/ticket-pdf";
import { generateSecureQrToken } from "@/lib/qr/token";

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    const bookingSnap = await adminDb.collection("bookings").doc(bookingId).get();
    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const bookingData = bookingSnap.data()!;
    const ticketsSnap = await adminDb.collection("tickets")
      .where("bookingId", "==", bookingId)
      .get();

    const ticketNumbers = ticketsSnap.docs.map((d) => d.data().ticketNumber);

    const pdfBuffer = await generateTicketPdf({
      ticketNumber: ticketNumbers[0] || "GG26-000001",
      bookingId: bookingData.bookingId,
      holderName: bookingData.purchaserName,
      ticketType: bookingData.ticketType || "General Sale",
      qrToken: generateSecureQrToken(),
      price: bookingData.totalAmount / (bookingData.quantity || 1),
    }).catch(() => undefined);

    const emailRes = await sendTicketEmail({
      toEmail: bookingData.purchaserEmail,
      purchaserName: bookingData.purchaserName,
      bookingId: bookingData.bookingId,
      ticketNumbers,
      quantity: bookingData.quantity,
      totalAmount: bookingData.totalAmount,
      pdfAttachment: pdfBuffer,
    });

    if (emailRes.success) {
      return NextResponse.json({ success: true, message: "Ticket email resent successfully." });
    } else {
      return NextResponse.json({ error: "Failed to dispatch email via Resend." }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Resend ticket email API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
