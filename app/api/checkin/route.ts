import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/config";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, ticketNumber, action = "validate", organizerId = "staff_gate_1" } = body;

    if (!token && !ticketNumber) {
      return NextResponse.json({ error: "Missing QR token or ticket number." }, { status: 400 });
    }

    let ticketDocRef: FirebaseFirestore.DocumentReference | null = null;
    let ticketData: any = null;

    if (token) {
      // Find ticket by opaque QR token
      const snap = await adminDb.collection("tickets")
        .where("qrToken", "==", token)
        .limit(1)
        .get();

      if (!snap.empty) {
        ticketDocRef = snap.docs[0].ref;
        ticketData = snap.docs[0].data();
      }
    } else if (ticketNumber) {
      // Find ticket by human-readable ticket number (e.g. GG26-000001)
      const cleanNum = ticketNumber.trim().toUpperCase();
      const snap = await adminDb.collection("tickets")
        .where("ticketNumber", "==", cleanNum)
        .limit(1)
        .get();

      if (!snap.empty) {
        ticketDocRef = snap.docs[0].ref;
        ticketData = snap.docs[0].data();
      }
    }

    if (!ticketDocRef || !ticketData) {
      return NextResponse.json({
        status: "invalid",
        message: "Ticket could not be verified. Invalid QR token or ticket number.",
      });
    }

    // Check payment status from parent booking
    const bookingSnap = await adminDb.collection("bookings").doc(ticketData.bookingId).get();
    if (bookingSnap.exists) {
      const bData = bookingSnap.data()!;
      if (bData.paymentStatus !== "paid") {
        return NextResponse.json({
          status: "unpaid",
          message: "Payment not verified. Entry not allowed.",
          ticket: ticketData,
        });
      }
    }

    // Check if ticket is cancelled/refunded
    if (ticketData.ticketStatus === "cancelled" || ticketData.ticketStatus === "refunded") {
      return NextResponse.json({
        status: "cancelled",
        message: "This ticket has been cancelled or refunded.",
        ticket: ticketData,
      });
    }

    // Check if already checked in
    if (ticketData.ticketStatus === "checked_in") {
      return NextResponse.json({
        status: "already_checked_in",
        message: "TICKET ALREADY USED",
        ticket: ticketData,
        checkedInAt: ticketData.checkedInAt,
        checkedInBy: ticketData.checkedInBy || "Gate Scanner Staff",
      });
    }

    // If request action is check-in execution -> run atomic transaction
    if (action === "checkin") {
      await adminDb.runTransaction(async (transaction) => {
        const freshSnap = await transaction.get(ticketDocRef!);
        if (!freshSnap.exists) {
          throw new Error("Ticket document disappeared.");
        }
        const freshData = freshSnap.data()!;

        if (freshData.ticketStatus === "checked_in") {
          throw new Error("ALREADY_CHECKED_IN");
        }

        const nowIso = new Date().toISOString();
        transaction.update(ticketDocRef!, {
          ticketStatus: "checked_in",
          checkedInAt: nowIso,
          checkedInBy: organizerId,
          updatedAt: nowIso,
        });

        // Record check-in audit log
        const checkinLogRef = adminDb.collection("checkIns").doc();
        transaction.set(checkinLogRef, {
          checkInId: checkinLogRef.id,
          ticketId: freshData.ticketId,
          ticketNumber: freshData.ticketNumber,
          bookingId: freshData.bookingId,
          holderName: freshData.holderName,
          scannedBy: organizerId,
          scannedAt: nowIso,
        });
      });

      return NextResponse.json({
        status: "success",
        message: "ENTRY CONFIRMED! Welcome to Garba Gala 2026.",
        ticket: {
          ...ticketData,
          ticketStatus: "checked_in",
        },
      });
    }

    // Otherwise, return validation preview
    return NextResponse.json({
      status: "valid",
      message: "Valid Pass. Ready for Check-in.",
      ticket: ticketData,
    });
  } catch (error: any) {
    if (error.message === "ALREADY_CHECKED_IN") {
      return NextResponse.json({
        status: "already_checked_in",
        message: "TICKET ALREADY USED",
      });
    }
    console.error("Check-in API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
