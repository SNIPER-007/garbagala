import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { adminDb } from "@/lib/firebase-admin/config";
import { EVENT_DETAILS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { purchaserName, purchaserEmail, purchaserPhone, quantity = 1, customerId } = body;

    if (!purchaserName || !purchaserEmail || !purchaserPhone) {
      return NextResponse.json(
        { error: "Purchaser name, email, and phone number are required." },
        { status: 400 }
      );
    }

    const qty = Math.max(1, Math.min(10, parseInt(quantity, 10) || 1));

    // Server-side inventory check
    const ticketTypeRef = adminDb.collection("ticketTypes").doc("general-sale");
    const ticketTypeSnap = await ticketTypeRef.get();

    let price = 450;
    let totalQuantity = 150;
    let soldQuantity = 0;

    if (ticketTypeSnap.exists) {
      const data = ticketTypeSnap.data()!;
      price = data.price ?? 450;
      totalQuantity = data.totalQuantity ?? 150;
      soldQuantity = data.soldQuantity ?? 0;
    }

    const available = totalQuantity - soldQuantity;
    if (available < qty) {
      return NextResponse.json(
        { error: `Only ${available} tickets remaining. Cannot fulfill ${qty} passes.` },
        { status: 400 }
      );
    }

    const subtotal = price * qty;
    const totalAmount = subtotal;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        purchaserName,
        purchaserEmail,
        quantity: qty,
        eventId: EVENT_DETAILS.eventId,
      },
    });

    const bookingRef = adminDb.collection("bookings").doc();
    const bookingId = `GG26-${bookingRef.id.substring(0, 6).toUpperCase()}`;

    const newBooking = {
      bookingId,
      customerId: customerId || "guest",
      eventId: EVENT_DETAILS.eventId,
      purchaserName,
      purchaserEmail,
      purchaserPhone,
      ticketType: "General Sale",
      quantity: qty,
      subtotal,
      totalAmount,
      currency: "INR",
      paymentStatus: "pending",
      bookingStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await bookingRef.set(newBooking);

    return NextResponse.json({
      success: true,
      bookingId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_dummyKeyId",
    });
  } catch (error: any) {
    console.error("Create order API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment order." },
      { status: 500 }
    );
  }
}
