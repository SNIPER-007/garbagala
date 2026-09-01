"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Sparkles, ArrowRight, ShieldCheck, Ticket } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { signInGuest, user } = useAuth();
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      await signInGuest();
      router.push("/my-tickets");
    } catch (err) {
      console.error("Guest login error:", err);
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A090D] py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full card-glass rounded-3xl p-8 border border-[#272435] space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E03616] to-[#F7B731] p-0.5 mx-auto">
          <div className="w-full h-full bg-[#0A090D] rounded-[14px] flex items-center justify-center">
            <Ticket className="w-6 h-6 text-[#F7B731]" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white">
            Access My Passes
          </h1>
          <p className="text-xs text-[#8E8A9F] mt-1">
            Garba Gala 2026 Ticket Dashboard
          </p>
        </div>

        {user ? (
          <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#10B981] space-y-3">
            <p className="font-bold">Signed in as Guest Purchaser</p>
            <button
              onClick={() => router.push("/my-tickets")}
              className="btn-primary-gold w-full py-2.5 rounded-lg text-xs font-bold"
            >
              Go to My Tickets →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleGuestLogin}
              disabled={guestLoading}
              className="btn-primary-gold w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-xl"
            >
              <Sparkles className="w-4 h-4" />
              <span>{guestLoading ? "Connecting..." : "Fast Pass Sign-In"}</span>
            </button>

            <p className="text-[11px] text-[#8E8A9F] leading-relaxed">
              No registration required. Access your bookings and QR passes using your session or booking reference number.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
