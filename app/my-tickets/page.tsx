"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, Search, Calendar, MapPin, QrCode, ArrowRight, ShieldCheck, Download, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { BookingData } from "@/lib/types";
import { EVENT_DETAILS } from "@/lib/constants";

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchBookingId, setSearchBookingId] = useState("");
  const [searchError, setSearchError] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      if (user?.uid) {
        const q = query(
          collection(db, "bookings"),
          where("customerId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const list: BookingData[] = snap.docs.map((d) => d.data() as BookingData);
        setBookings(list);
      } else {
        // Fetch all bookings fallback for demo
        const snap = await getDocs(collection(db, "bookings"));
        const list: BookingData[] = snap.docs
          .map((d) => d.data() as BookingData)
          .filter((b) => b.paymentStatus === "paid");
        setBookings(list);
      }
    } catch (err) {
      console.warn("Fetch bookings error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchBookingId.trim()) return;
    const clean = searchBookingId.trim().toUpperCase();
    window.location.href = `/my-tickets/${clean}`;
  };

  return (
    <div className="min-h-screen bg-[#0A090D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#272435]">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              My Event Passes
            </h1>
            <p className="text-xs text-[#8E8A9F] mt-1">
              Garba Gala 2026 • Golden Celebration Hall • 27 Sept 2026
            </p>
          </div>

          {/* Booking ID Direct Lookup Bar */}
          <form onSubmit={handleManualSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#8E8A9F]" />
              <input
                type="text"
                placeholder="Enter Booking ID (e.g. GG26-...)"
                value={searchBookingId}
                onChange={(e) => setSearchBookingId(e.target.value)}
                className="w-full bg-[#14121B] border border-[#272435] rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-[#F7B731]"
              />
            </div>
            <button
              type="submit"
              className="btn-primary-gold px-4 py-2 rounded-xl text-xs font-bold shrink-0"
            >
              Lookup Pass
            </button>
          </form>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#F7B731] mx-auto" />
            <p className="text-xs text-[#8E8A9F]">Loading your confirmed bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="card-glass rounded-2xl p-6 border border-[#272435] hover:border-[#F7B731]/40 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#F7B731] px-2.5 py-0.5 rounded bg-[#FF9F1C]/20 border border-[#F7B731]/30">
                      {booking.bookingId}
                    </span>
                    <span className="text-[11px] font-bold text-[#10B981] px-2 py-0.5 rounded bg-[#10B981]/10">
                      {booking.paymentStatus.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white font-heading">
                    Garba Gala 2026 ({booking.quantity} Pass{booking.quantity > 1 ? "es" : ""})
                  </h3>

                  <div className="flex flex-wrap gap-4 text-xs text-[#8E8A9F]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#F7B731]" /> 27 Sept 2026, 5:30 PM
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FF9F1C]" /> Golden Celebration Hall
                    </span>
                    <span>Purchaser: <strong>{booking.purchaserName}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-[#272435]">
                  <div className="text-left md:text-right">
                    <div className="text-xl font-extrabold text-[#F7B731] font-heading">
                      ₹{booking.totalAmount}
                    </div>
                    <p className="text-[10px] text-[#8E8A9F] font-bold">TOTAL PAID</p>
                  </div>

                  <Link
                    href={`/my-tickets/${booking.bookingId}`}
                    className="btn-primary-gold px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Passes & QR</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-glass rounded-3xl p-12 text-center border border-[#272435] space-y-4">
            <Ticket className="w-12 h-12 text-[#8E8A9F] mx-auto" />
            <h2 className="text-xl font-bold text-white font-heading">No Active Passes Found</h2>
            <p className="text-xs text-[#8E8A9F] max-w-sm mx-auto">
              If you recently purchased a ticket, please enter your Booking ID in the lookup bar above or check your email for the attached PDF pass.
            </p>
            <Link href="/checkout" className="btn-primary-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold">
              Get Pass Now • ₹450
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
