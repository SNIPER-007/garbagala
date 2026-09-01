import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { adminDb } from "@/lib/firebase-admin/config";
import { generateSecureQrToken } from "@/lib/qr/token";
import { generateTicketPdf } from "@/lib/pdf/ticket-pdf";
import { sendTicketEmail } from "@/lib/resend";
import { EVENT_DETAILS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = body;

    if (!razorpayOrderId || !bookingId) {
      return NextResponse.json({ error: "Missing required verification params." }, { status: 400 });
    }

    // Verify HMAC signature if signature provided
    if (razorpaySignature && razorpayPaymentId) {
      const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid Razorpay payment signature." }, { status: 400 });
      }
    }

    // Find booking
    const bookingsQuery = await adminDb.collection("bookings")
      .where("razorpayOrderId", "==", razorpayOrderId)
      .limit(1)
      .get();

    if (bookingsQuery.empty) {
      return NextResponse.json({ error: "Booking order not found." }, { status: 444 });
    }

    const bookingDoc = bookingsQuery.docs[0];
    const bookingData = bookingDoc.data();

    // Idempotency check: if already paid, return tickets instantly
    if (bookingData.paymentStatus === "paid" && bookingData.bookingStatus === "paid") {
      const existingTickets = await adminDb.collection("tickets")
        .where("bookingId", "==", bookingData.bookingId)
        .get();

      const ticketNumbers = existingTickets.docs.map((d) => d.data().ticketNumber);

      return NextResponse.json({
        success: true,
        alreadyFulfilled: true,
        bookingId: bookingData.bookingId,
        ticketNumbers,
      });
    }

    // Execute atomic transaction for inventory deduction & sequential ticket numbering
    const generatedTicketNumbers: string[] = [];

    await adminDb.runTransaction(async (transaction) => {
      // 1. Read Counter Document
      const counterRef = adminDb.collection("counters").doc("tickets");
      const counterSnap = await transaction.get(counterRef);

      let currentCounter = 0;
      if (counterSnap.exists) {
        currentCounter = counterSnap.data()?.lastNumber || 0;
      }

      // 2. Read Ticket Type Inventory
      const ticketTypeRef = adminDb.collection("ticketTypes").doc("general-sale");
      const ticketTypeSnap = await transaction.get(ticketTypeRef);

      let currentSold = 0;
      let totalQty = 150;
      if (ticketTypeSnap.exists) {
        currentSold = ticketTypeSnap.data()?.soldQuantity || 0;
        totalQty = ticketTypeSnap.data()?.totalQuantity || 150;
      }

      const qtyNeeded = bookingData.quantity || 1;
      if (currentSold + qtyNeeded > totalQty) {
        throw new Error(`Inventory exhausted. Remaining: ${totalQty - currentSold}, Requested: ${qtyNeeded}`);
      }

      // 3. Issue individual tickets
      const newCounter = currentCounter + qtyNeeded;
      transaction.set(counterRef, { lastNumber: newCounter }, { merge: true });
      transaction.set(ticketTypeRef, { soldQuantity: currentSold + qtyNeeded }, { merge: true });

      for (let i = 0; i < qtyNeeded; i++) {
        const sequentialNum = currentCounter + i + 1;
        const formattedNum = `GG26-${String(sequentialNum).padStart(6, "0")}`;
        generatedTicketNumbers.push(formattedNum);

        const ticketRef = adminDb.collection("tickets").doc();
        const qrToken = generateSecureQrToken();

        const individualTicket = {
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
        };

        transaction.set(ticketRef, individualTicket);
      }

      // 4. Update Booking Document
      transaction.update(bookingDoc.ref, {
        paymentStatus: "paid",
        bookingStatus: "paid",
        razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}`,
        paymentVerifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // Generate PDF Ticket for purchaser
    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await generateTicketPdf({
        ticketNumber: generatedTicketNumbers[0] || "GG26-000001",
        bookingId: bookingData.bookingId,
        holderName: bookingData.purchaserName,
        ticketType: bookingData.ticketType || "General Sale",
        qrToken: generateSecureQrToken(),
        price: bookingData.totalAmount / (bookingData.quantity || 1),
      });
    } catch (pdfErr) {
      console.error("PDF generation warning:", pdfErr);
    }

    // Dispatch Resend Email asynchronously
    sendTicketEmail({
      toEmail: bookingData.purchaserEmail,
      purchaserName: bookingData.purchaserName,
      bookingId: bookingData.bookingId,
      ticketNumbers: generatedTicketNumbers,
      quantity: bookingData.quantity,
      totalAmount: bookingData.totalAmount,
      pdfAttachment: pdfBuffer,
    }).catch((emailErr) => console.error("Email dispatch warning:", emailErr));

    return NextResponse.json({
      success: true,
      bookingId: bookingData.bookingId,
      ticketNumbers: generatedTicketNumbers,
    });
  } catch (error: any) {
    console.error("Payment verification API error:", error);
    return NextResponse.json(
      { error: error.message || "Server-side payment verification failed." },
      { status: 500 }
    );
  }
}
