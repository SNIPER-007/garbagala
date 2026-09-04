import { adminDb } from "@/lib/firebase-admin/config";
import { EVENT_DETAILS } from "@/lib/constants";
import { generateSecureQrToken } from "@/lib/qr/token";
import { generateTicketPdf } from "@/lib/pdf/ticket-pdf";
import { sendTicketEmail } from "@/lib/resend";

type FulfillmentResult = {
  bookingId: string;
  ticketNumbers: string[];
  alreadyFulfilled: boolean;
};

async function getTicketNumbersForBooking(bookingId: string): Promise<string[]> {
  const ticketsSnap = await adminDb.collection("tickets")
    .where("bookingId", "==", bookingId)
    .get();

  return ticketsSnap.docs.map((doc) => doc.data().ticketNumber);
}

export async function fulfillPaidBooking(input: {
  bookingDocId: string;
  providerPaymentId?: string;
  providerRaw?: any;
}): Promise<FulfillmentResult> {
  const bookingRef = adminDb.collection("bookings").doc(input.bookingDocId);
  const bookingSnap = await bookingRef.get();

  if (!bookingSnap.exists) {
    throw new Error("Booking not found.");
  }

  const bookingData = bookingSnap.data()!;

  if (bookingData.paymentStatus === "paid" && bookingData.bookingStatus === "paid") {
    return {
      bookingId: bookingData.bookingId,
      ticketNumbers: await getTicketNumbersForBooking(bookingData.bookingId),
      alreadyFulfilled: true,
    };
  }

  const generatedTicketNumbers: string[] = [];

  await adminDb.runTransaction(async (transaction) => {
    const freshBookingSnap = await transaction.get(bookingRef);
    if (!freshBookingSnap.exists) {
      throw new Error("Booking not found.");
    }

    const freshBooking = freshBookingSnap.data()!;
    if (freshBooking.paymentStatus === "paid" && freshBooking.bookingStatus === "paid") {
      return;
    }

    const counterRef = adminDb.collection("counters").doc("tickets");
    const counterSnap = await transaction.get(counterRef);
    const currentCounter = counterSnap.exists ? counterSnap.data()?.lastNumber || 0 : 0;

    const ticketTypeRef = adminDb.collection("ticketTypes").doc("general-sale");
    const ticketTypeSnap = await transaction.get(ticketTypeRef);
    const currentSold = ticketTypeSnap.exists ? ticketTypeSnap.data()?.soldQuantity || 0 : 0;
    const totalQuantity = ticketTypeSnap.exists ? ticketTypeSnap.data()?.totalQuantity || 150 : 150;
    const qtyNeeded = freshBooking.quantity || 1;

    if (currentSold + qtyNeeded > totalQuantity) {
      throw new Error(`Inventory exhausted. Remaining: ${totalQuantity - currentSold}, Requested: ${qtyNeeded}`);
    }

    transaction.set(counterRef, { lastNumber: currentCounter + qtyNeeded }, { merge: true });
    transaction.set(ticketTypeRef, { soldQuantity: currentSold + qtyNeeded }, { merge: true });

    for (let i = 0; i < qtyNeeded; i++) {
      const ticketNumber = `GG26-${String(currentCounter + i + 1).padStart(6, "0")}`;
      generatedTicketNumbers.push(ticketNumber);

      const ticketRef = adminDb.collection("tickets").doc();
      transaction.set(ticketRef, {
        ticketId: ticketRef.id,
        bookingId: freshBooking.bookingId,
        eventId: EVENT_DETAILS.eventId,
        ticketNumber,
        ticketType: freshBooking.ticketType || "General Sale",
        holderName: freshBooking.purchaserName,
        holderEmail: freshBooking.purchaserEmail,
        holderPhone: freshBooking.purchaserPhone,
        qrToken: generateSecureQrToken(),
        ticketStatus: "valid",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    transaction.update(bookingRef, {
      paymentStatus: "paid",
      bookingStatus: "paid",
      payuPaymentId: input.providerPaymentId,
      paymentVerifiedAt: new Date().toISOString(),
      paymentProviderRaw: input.providerRaw || null,
      updatedAt: new Date().toISOString(),
    });
  });

  const finalTicketNumbers = generatedTicketNumbers.length
    ? generatedTicketNumbers
    : await getTicketNumbersForBooking(bookingData.bookingId);

  let pdfBuffer: Buffer | undefined;
  try {
    pdfBuffer = await generateTicketPdf({
      ticketNumber: finalTicketNumbers[0] || "GG26-000001",
      bookingId: bookingData.bookingId,
      holderName: bookingData.purchaserName,
      ticketType: bookingData.ticketType || "General Sale",
      qrToken: generateSecureQrToken(),
      price: bookingData.totalAmount / (bookingData.quantity || 1),
    });
  } catch (pdfErr) {
    console.error("PDF generation warning:", pdfErr);
  }

  sendTicketEmail({
    toEmail: bookingData.purchaserEmail,
    purchaserName: bookingData.purchaserName,
    bookingId: bookingData.bookingId,
    ticketNumbers: finalTicketNumbers,
    quantity: bookingData.quantity,
    totalAmount: bookingData.totalAmount,
    pdfAttachment: pdfBuffer,
  }).catch((emailErr) => console.error("Email dispatch warning:", emailErr));

  return {
    bookingId: bookingData.bookingId,
    ticketNumbers: finalTicketNumbers,
    alreadyFulfilled: false,
  };
}

