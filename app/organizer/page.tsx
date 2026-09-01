"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { QrCode, Search, CheckCircle2, Ticket, Users, RefreshCw, Flame, ShieldCheck } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    ticketsSold: 0,
    totalQuantity: 150,
    checkedInCount: 0,
    remainingToArrive: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      const isAuthorized =
        userProfile &&
        ["organizer", "checkin_staff", "super_admin"].includes(userProfile.role);

      if (!isAuthorized) {
        router.push("/organizer/login");
        return;
      }
    }

    // Realtime listeners for organizer dashboard stats
    const unsubTickets = onSnapshot(collection(db, "tickets"), (snap) => {
      const allTickets = snap.docs.map((d) => d.data());
      const checkedIn = allTickets.filter((t) => t.ticketStatus === "checked_in").length;
      const sold = allTickets.length;

      setStats({
        ticketsSold: sold,
        totalQuantity: 150,
        checkedInCount: checkedIn,
        remainingToArrive: Math.max(0, sold - checkedIn),
      });
      setLoading(false);
    });

    return () => unsubTickets();
  }, [authLoading, userProfile, router]);

  return (
    <div className="min-h-screen bg-[#0A090D] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#272435]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-gold text-xs font-bold uppercase tracking-wider">
              ORGANIZER GATE PORTAL
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white mt-2">
              GARBA GALA ENTRY CHECK-IN
            </h1>
            <p className="text-xs text-[#8E8A9F] mt-1">
              Golden Celebration Hall • Gate Scanner & Verification Console
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-xl border border-[#10B981]/30">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="font-bold">LIVE GATE SYNC ACTIVE</span>
          </div>
        </div>

        {/* Live Counter Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-glass rounded-2xl p-5 border border-[#272435] text-center space-y-1">
            <Ticket className="w-5 h-5 text-[#F7B731] mx-auto mb-2" />
            <p className="text-[10px] text-[#8E8A9F] uppercase font-extrabold tracking-wider">TICKETS SOLD</p>
            <p className="text-3xl font-extrabold text-white font-heading">{stats.ticketsSold}</p>
          </div>

          <div className="card-glass rounded-2xl p-5 border border-[#10B981]/40 text-center space-y-1 bg-[#10B981]/5">
            <CheckCircle2 className="w-5 h-5 text-[#10B981] mx-auto mb-2" />
            <p className="text-[10px] text-[#10B981] uppercase font-extrabold tracking-wider">CHECKED IN</p>
            <p className="text-3xl font-extrabold text-[#10B981] font-heading">{stats.checkedInCount}</p>
          </div>

          <div className="card-glass rounded-2xl p-5 border border-[#FF9F1C]/40 text-center space-y-1">
            <Users className="w-5 h-5 text-[#FF9F1C] mx-auto mb-2" />
            <p className="text-[10px] text-[#FF9F1C] uppercase font-extrabold tracking-wider">REMAINING</p>
            <p className="text-3xl font-extrabold text-white font-heading">{stats.remainingToArrive}</p>
          </div>

          <div className="card-glass rounded-2xl p-5 border border-[#272435] text-center space-y-1">
            <Flame className="w-5 h-5 text-[#E03616] mx-auto mb-2" />
            <p className="text-[10px] text-[#8E8A9F] uppercase font-extrabold tracking-wider">TOTAL CAPACITY</p>
            <p className="text-3xl font-extrabold text-white font-heading">{stats.totalQuantity}</p>
          </div>
        </div>

        {/* Primary Organizer Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          {/* Action 1: QR Scanner */}
          <Link
            href="/organizer/scan"
            className="btn-primary-gold p-8 rounded-3xl text-center space-y-4 shadow-2xl flex flex-col items-center justify-center group"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#0A090D] flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-8 h-8 text-[#F7B731]" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0A090D] font-heading">
                SCAN QR CODE
              </h2>
              <p className="text-xs font-semibold text-[#0A090D]/80 mt-1">
                Open phone camera scanner for instant gate verification
              </p>
            </div>
          </Link>

          {/* Action 2: Manual Ticket Search */}
          <Link
            href="/organizer/search"
            className="card-glass p-8 rounded-3xl text-center space-y-4 border-2 border-[#272435] hover:border-[#F7B731]/40 transition-all flex flex-col items-center justify-center group"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#14121B] border border-[#272435] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-8 h-8 text-[#FF9F1C]" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white font-heading">
                ENTER TICKET NUMBER
              </h2>
              <p className="text-xs text-[#8E8A9F] mt-1">
                Manual lookup by GG26-XXXXXX, Purchaser Name, or Mobile
              </p>
            </div>
          </Link>
        </div>

        {/* Notice */}
        <div className="p-4 rounded-xl bg-[#14121B] border border-[#272435] text-xs text-[#8E8A9F] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F7B731]" />
            Atomic Multi-Device Check-in Locking Enabled
          </span>
          <Link href="/organizer/checkins" className="text-[#F7B731] hover:underline font-bold">
            Live Check-in Feed →
          </Link>
        </div>
      </div>
    </div>
  );
}
