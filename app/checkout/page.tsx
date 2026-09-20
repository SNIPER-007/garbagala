"use client";

import React, { useState } from "react";
import { Ticket, User, Mail, Phone, ShieldCheck, ArrowRight, Minus, Plus, Loader2, Sparkles, Tag, CheckCircle2, X } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { EVENT_DETAILS } from "@/lib/constants";

export default function CheckoutPage() {
  const { user, userProfile } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState(userProfile?.name || "");
  const [email, setEmail] = useState(userProfile?.email || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const unitPrice = 450;
  const subtotal = unitPrice * quantity;
  const discountAmount = appliedCoupon === "NATYAMGARBA5" ? Number((subtotal * 0.05).toFixed(2)) : 0;
  const totalAmount = Number((subtotal - discountAmount).toFixed(2));

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncreaseQty = () => {
    if (quantity < 10) setQuantity((prev) => prev + 1);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (code === "NATYAMGARBA5") {
      setAppliedCoupon("NATYAMGARBA5");
      setCouponSuccess("Coupon applied successfully — 5 percent off");
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code.");
      setCouponSuccess("");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
    setCouponSuccess("");
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage("Please fill in your name, email, and 10-digit mobile number.");
      return;
    }

    if (phone.trim().length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on server
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaserName: name,
          purchaserEmail: email,
          purchaserPhone: phone,
          quantity,
          customerId: user?.uid || "guest",
          couponCode: appliedCoupon || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize payment order.");
      }

      if (!data.paymentUrl || !data.fields) {
        throw new Error("Payment gateway response was incomplete.");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.paymentUrl;
      form.style.display = "none";

      Object.entries(data.fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A090D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-gold text-xs font-bold uppercase tracking-wider">
            SECURE CHECKOUT
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Complete Your Booking
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8A9F]">
            {EVENT_DETAILS.name} • 27 September 2026 • Golden Celebration Hall
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#E03616]/20 border border-[#E03616] text-[#FFFFFF] text-sm flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#E03616] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Pass Selection & Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Quantity */}
            <div className="card-glass rounded-2xl p-6 border border-[#272435] space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[#272435]">
                <div>
                  <h2 className="text-lg font-bold text-white font-heading">
                    1. Select Quantity
                  </h2>
                  <p className="text-xs text-[#8E8A9F]">General Sale Pass • ₹450 per pass</p>
                </div>
                <span className="text-sm font-extrabold text-[#F7B731]">₹{unitPrice} / pass</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-[#B5B1C5] font-semibold">Number of Passes</span>

                <div className="flex items-center gap-4 bg-[#0A090D] border border-[#272435] rounded-xl p-1.5">
                  <button
                    type="button"
                    onClick={handleDecreaseQty}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-[#14121B] flex items-center justify-center text-white disabled:opacity-30 hover:bg-[#272435]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-extrabold text-white text-lg font-heading">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncreaseQty}
                    disabled={quantity >= 10}
                    className="w-8 h-8 rounded-lg bg-[#14121B] flex items-center justify-center text-white disabled:opacity-30 hover:bg-[#272435]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-[#8E8A9F]">
                All tickets will be issued under purchaser name with unique QR codes.
              </p>
            </div>

            {/* Step 2: Customer Contact Info */}
            <div className="card-glass rounded-2xl p-6 border border-[#272435] space-y-4">
              <h2 className="text-lg font-bold text-white font-heading pb-2 border-b border-[#272435]">
                2. Purchaser Details
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#B5B1C5] font-semibold mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-[#8E8A9F]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0A090D] border border-[#272435] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#F7B731]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#B5B1C5] font-semibold mb-1.5">Email Address (For Pass Delivery) *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#8E8A9F]" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0A090D] border border-[#272435] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#F7B731]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#B5B1C5] font-semibold mb-1.5">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#8E8A9F]" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0A090D] border border-[#272435] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#F7B731]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Coupon Code Section */}
            <div className="card-glass rounded-2xl p-6 border border-[#272435] space-y-4">
              <h2 className="text-lg font-bold text-white font-heading pb-2 border-b border-[#272435] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#F7B731]" />
                3. Coupon Code
              </h2>

              <p className="text-xs text-[#B5B1C5]">Have a coupon code?</p>

              {appliedCoupon ? (
                <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#10B981]">
                        Coupon applied successfully — 5 percent off
                      </p>
                      <p className="text-[11px] text-[#B5B1C5]">
                        Code: <strong className="text-white">{appliedCoupon}</strong> (Saving ₹{discountAmount.toFixed(2)})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1.5 rounded-lg bg-[#14121B] border border-[#272435] text-[#8E8A9F] hover:text-white hover:border-[#E03616]"
                    title="Remove Coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError("");
                      }}
                      className="flex-1 bg-[#0A090D] border border-[#272435] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F7B731] uppercase tracking-wider font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-5 py-2.5 rounded-xl bg-[#272435] hover:bg-[#F7B731] hover:text-[#0A090D] text-white text-xs font-bold transition-all shrink-0"
                    >
                      APPLY
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-xs text-[#E03616] font-semibold pl-1">
                      {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Payment Button */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card-glass rounded-2xl p-6 border-2 border-[#F7B731]/40 space-y-6 sticky top-28">
              <h2 className="text-xl font-extrabold text-white font-heading">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs border-b border-[#272435] pb-4">
                <div className="flex justify-between text-[#B5B1C5]">
                  <span>Ticket Price ({quantity} × ₹450.00)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-[#10B981] font-semibold">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#B5B1C5]">
                  <span>Convenience & Verification Fee</span>
                  <span className="text-[#10B981] font-bold">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-extrabold text-white">
                <span>Final Price</span>
                <span className="text-2xl text-[#F7B731] font-heading">₹{totalAmount.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary-gold w-full py-4 rounded-xl text-base font-extrabold flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#0A090D]" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>PAY ₹{totalAmount.toFixed(2)} VIA PAYU</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-[#8E8A9F] space-y-2 pt-2 border-t border-[#272435]">
                <p className="flex items-center gap-1.5 text-[#FF9F1C] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#F7B731]" />
                  Secure PayU Hosted Checkout
                </p>
                <p>
                  Tickets are strictly non-refundable and non-transferable. Passes will be emailed immediately upon successful payment verification.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
