"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  DollarSign,
  Ticket,
  Users,
  CheckCircle2,
  Search,
  Download,
  Mail,
  Loader2,
  Sparkles,
  Flame,
  FileSpreadsheet,
} from "lucide-react";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { BookingData, IndividualTicketData } from "@/lib/types";

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [tickets, setTickets] = useState<IndividualTicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [resendLoadingId, setResendLoadingId] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to bookings & tickets
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      const bList = snap.docs.map((d) => d.data() as BookingData);
      setBookings(bList);
    });

    const unsubTickets = onSnapshot(collection(db, "tickets"), (snap) => {
      const tList = snap.docs.map((d) => d.data() as IndividualTicketData);
      setTickets(tList);
      setLoading(false);
    });

    return () => {
      unsubBookings();
      unsubTickets();
    };
  }, []);

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const totalSold = tickets.length;
  const checkedInCount = tickets.filter((t) => t.ticketStatus === "checked_in").length;
  const successfulPayments = bookings.filter((b) => b.paymentStatus === "paid").length;
  const pendingPayments = bookings.filter((b) => b.paymentStatus === "pending").length;

  const handleResendEmail = async (bookingId: string) => {
    setResendLoadingId(bookingId);
    try {
      const res = await fetch("/api/resend-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Ticket email resent successfully for ${bookingId}`);
      } else {
        alert(`Resend failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error resending email: ${err.message}`);
    } finally {
      setResendLoadingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.bookingId.toLowerCase().includes(term) ||
      b.purchaserName.toLowerCase().includes(term) ||
      b.purchaserEmail.toLowerCase().includes(term) ||
      b.purchaserPhone.includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#0A090D] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#272435]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-gold text-xs font-bold uppercase tracking-wider">
              SUPER ADMIN CONSOLE
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white mt-2">
              Garba Gala 2026 Admin Dashboard
            </h1>
            <p className="text-xs text-[#8E8A9F] mt-1">
              Live Sales Analytics, Ticket Roster & Revenue Oversight
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/export"
              className="btn-primary-gold px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV Data</span>
            </Link>
          </div>
        </div>

        {/* Analytics Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-glass rounded-2xl p-5 border border-[#F7B731]/40 space-y-2">
            <div className="flex justify-between items-center text-[#F7B731]">
              <span className="text-[10px] uppercase font-extrabold tracking-wider">TOTAL REVENUE</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-white font-heading">₹{totalRevenue}</p>
            <p className="text-[11px] text-[#8E8A9F]">{successfulPayments} Paid Bookings</p>
          </div>

          <div className="card-glass rounded-2xl p-5 border border-[#272435] space-y-2">
            <div className="flex justify-between items-center text-[#FF9F1C]">
              <span className="text-[10px] uppercase font-extrabold tracking-wider">TICKETS SOLD</span>
              <Ticket className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-white font-heading">{totalSold} / 150</p>
            <p className="text-[11px] text-[#8E8A9F]">{150 - totalSold} Remaining Stock</p>
          </div>

          <div className="card-glass rounded-2xl p-5 border border-[#10B981]/40 bg-[#10B981]/5 space-y-2">
            <div className="flex justify-between items-center text-[#10B981]">
              <span className="text-[10px] uppercase font-extrabold tracking-wider">GATE CHECKED-IN</span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-[#10B981] font-heading">{checkedInCount}</p>
            <p className="text-[11px] text-[#8E8A9F]">{totalSold - checkedInCount} Yet to Arrive</p>
          </div>

          <div className="card-glass rounded-2xl p-5 border border-[#272435] space-y-2">
            <div className="flex justify-between items-center text-[#E03616]">
              <span className="text-[10px] uppercase font-extrabold tracking-wider">PENDING PAYMENTS</span>
              <Flame className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-white font-heading">{pendingPayments}</p>
            <p className="text-[11px] text-[#8E8A9F]">Checkout Drop-offs</p>
          </div>
        </div>

        {/* Organizer Email Whitelist Manager */}
        <div className="card-glass rounded-3xl p-6 border border-[#272435] space-y-4">
          <div className="flex items-center gap-2 text-white font-bold font-heading text-lg">
            <ShieldCheck className="w-5 h-5 text-[#F7B731]" />
            <span>Grant Organizer Access</span>
          </div>
          <p className="text-xs text-[#8E8A9F]">
            Add an email address below to grant them instant access to the Gate Scanner & Organizer Portal.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem("orgEmail") as HTMLInputElement;
              const emailVal = input.value.trim();
              if (!emailVal) return;

              try {
                const res = await fetch("/api/admin/grant-organizer", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: emailVal, role: "organizer" }),
                });
                const data = await res.json();
                if (data.success) {
                  alert(`Successfully granted organizer access to ${emailVal}`);
                  input.value = "";
                } else {
                  alert(`Error: ${data.error}`);
                }
              } catch (err: any) {
                alert(`Error granting access: ${err.message}`);
              }
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              name="orgEmail"
              type="email"
              required
              placeholder="Enter email address (e.g. member@garbagala.com)"
              className="flex-1 bg-[#0A090D] border border-[#272435] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#F7B731]"
            />
            <button
              type="submit"
              className="btn-primary-gold px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Grant Access</span>
            </button>
          </form>
        </div>

        {/* Search & Booking Management Table */}
        <div className="card-glass rounded-3xl p-6 border border-[#272435] space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-extrabold text-white font-heading">
              Booking Roster Management ({filteredBookings.length})
            </h2>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#8E8A9F]" />
              <input
                type="text"
                placeholder="Search name, phone, booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A090D] border border-[#272435] rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-[#F7B731]"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#F7B731] mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#272435] text-[#8E8A9F] uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Purchaser Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Pass Qty</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272435]">
                  {filteredBookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-[#14121B]">
                      <td className="py-4 px-4 font-bold text-[#F7B731]">{b.bookingId}</td>
                      <td className="py-4 px-4 font-bold text-white">{b.purchaserName}</td>
                      <td className="py-4 px-4 text-[#B5B1C5]">
                        <div>{b.purchaserEmail}</div>
                        <div className="text-[10px] text-[#8E8A9F]">{b.purchaserPhone}</div>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">{b.quantity}</td>
                      <td className="py-4 px-4 font-bold text-[#F7B731]">₹{b.totalAmount}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            b.paymentStatus === "paid"
                              ? "bg-[#10B981]/20 text-[#10B981]"
                              : "bg-[#E03616]/20 text-[#E03616]"
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleResendEmail(b.bookingId)}
                          disabled={resendLoadingId === b.bookingId}
                          className="px-3 py-1.5 rounded-lg border border-[#272435] text-[#B5B1C5] hover:text-white hover:border-[#F7B731] font-semibold text-[11px] inline-flex items-center gap-1.5 bg-[#0A090D]"
                        >
                          {resendLoadingId === b.bookingId ? (
                            <Loader2 className="w-3 h-3 animate-spin text-[#F7B731]" />
                          ) : (
                            <Mail className="w-3 h-3 text-[#F7B731]" />
                          )}
                          <span>Resend Email</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
