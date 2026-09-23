import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/config";
import { EVENT_DETAILS } from "@/lib/constants";
import { buildPayUCheckoutFields, getPayUPaymentUrl } from "@/lib/payu";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { purchaserName, purchaserEmail, purchaserPhone, quantity = 1, customerId, couponCode } = body;

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
    let totalQuantity = 500;
    let soldQuantity = 0;
    let status = "active";

    if (ticketTypeSnap.exists) {
      const data = ticketTypeSnap.data()!;
      price = data.price ?? 450;
      totalQuantity = data.totalQuantity ?? 500;
      soldQuantity = data.soldQuantity ?? 0;
      status = data.status ?? "active";
    }

    if (status !== "active") {
      return NextResponse.json(
        { error: "This ticket type is not currently available." },
        { status: 400 }
      );
    }

    const available = totalQuantity - soldQuantity;
    if (available < qty) {
      return NextResponse.json(
        { error: `Only ${available} tickets remaining. Cannot fulfill ${qty} passes.` },
        { status: 400 }
      );
    }

    const subtotal = price * qty;

    // Server-side Coupon Code Validation
    const normalizedCoupon = (couponCode || "").trim().toUpperCase();
    let discountPercent = 0;
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;

    if (normalizedCoupon === "NATYAMGARBA5") {
      appliedCouponCode = "NATYAMGARBA5";
      discountPercent = 5;
      discountAmount = Number((subtotal * 0.05).toFixed(2));
    } else if (normalizedCoupon === "RTR350") {
      appliedCouponCode = "RTR350";
      discountPercent = 0;
      discountAmount = Number(((price - 350) * qty).toFixed(2));
    }

    const totalAmount = Number((subtotal - discountAmount).toFixed(2));

    const bookingSeedRef = adminDb.collection("bookings").doc();
    const bookingId = `GG26-${bookingSeedRef.id.substring(0, 6).toUpperCase()}`;
    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    const payuTxnId = `GG26${Date.now()}${bookingSeedRef.id.substring(0, 6)}`;
    const now = new Date().toISOString();

    const checkoutFields = buildPayUCheckoutFields({
      request,
      txnid: payuTxnId,
      bookingId,
      amount: totalAmount,
      firstname: purchaserName,
      email: purchaserEmail,
      phone: purchaserPhone,
    });

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
      discountAmount,
      discountPercent,
      couponCode: appliedCouponCode,
      totalAmount,
      currency: "INR",
      paymentStatus: "pending",
      bookingStatus: "pending",
      paymentProvider: "payu",
      payuTxnId,
      payuAmount: checkoutFields.amount,
      payuProductInfo: checkoutFields.productinfo,
      createdAt: now,
      updatedAt: now,
    };

    await bookingRef.set(newBooking);

    return NextResponse.json({
      success: true,
      bookingId,
      paymentProvider: "payu",
      paymentUrl: getPayUPaymentUrl(),
      fields: checkoutFields,
    });
  } catch (error: any) {
    console.error("Create order API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment order." },
      { status: 500 }
    );
  }
}
