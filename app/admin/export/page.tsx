"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileSpreadsheet, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function AdminExportPage() {
  const [downloading, setDownloading] = useState(false);
  const [exportedCount, setExportedCount] = useState<number | null>(null);

  const triggerCsvExport = async () => {
    setDownloading(true);
    try {
      const ticketsSnap = await getDocs(collection(db, "tickets"));
      const tickets = ticketsSnap.docs.map((d) => d.data());

      const bookingsSnap = await getDocs(collection(db, "bookings"));
      const bookingsMap = new Map();
      bookingsSnap.docs.forEach((d) => {
        const b = d.data();
        bookingsMap.set(b.bookingId, b);
      });

      const headers = [
        "Booking ID",
        "Ticket Number",
        "Purchaser Name",
        "Phone",
        "Email",
        "Ticket Type",
        "Amount (INR)",
        "Payment Status",
        "Ticket Status",
        "Checked In At",
        "Checked In By",
      ];

      const rows = tickets.map((t) => {
        const parentBooking = bookingsMap.get(t.bookingId) || {};
        const amountPerTicket = parentBooking.totalAmount
          ? parentBooking.totalAmount / (parentBooking.quantity || 1)
          : 450;

        return [
          `"${t.bookingId || ""}"`,
          `"${t.ticketNumber || ""}"`,
          `"${t.holderName || parentBooking.purchaserName || ""}"`,
          `"${t.holderPhone || parentBooking.purchaserPhone || ""}"`,
          `"${t.holderEmail || parentBooking.purchaserEmail || ""}"`,
          `"${t.ticketType || "General Sale"}"`,
          `"${amountPerTicket}"`,
          `"${parentBooking.paymentStatus || "paid"}"`,
          `"${t.ticketStatus || "valid"}"`,
          `"${t.checkedInAt || ""}"`,
          `"${t.checkedInBy || ""}"`,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Garba_Gala_2026_Attendee_Export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportedCount(tickets.length);
    } catch (err) {
      console.error("CSV Export error:", err);
      alert("Failed to export CSV file.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A090D] py-12 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full card-glass rounded-3xl p-8 border border-[#272435] space-y-6 text-center">
        <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-[#8E8A9F] hover:text-[#F7B731]">
          <ArrowLeft className="w-4 h-4" /> Back to Admin Console
        </Link>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E03616] via-[#FF9F1C] to-[#F7B731] p-0.5 mx-auto">
          <div className="w-full h-full bg-[#0A090D] rounded-[14px] flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8 text-[#F7B731]" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold font-heading text-white">
            Export Attendees & Tickets CSV
          </h1>
          <p className="text-xs text-[#8E8A9F] mt-1">
            Download full roster for gate check-in reconciliation and financial reporting.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0A090D] border border-[#272435] text-xs text-[#B5B1C5] space-y-2 text-left">
          <p className="text-white font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            EXCLUDED PRIVACY FIELDS:
          </p>
          <p>• API secrets, payment credentials, and authentication tokens are strictly stripped.</p>
        </div>

        <button
          onClick={triggerCsvExport}
          disabled={downloading}
          className="btn-primary-gold w-full py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 shadow-2xl"
        >
          {downloading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#0A090D]" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span>DOWNLOAD FULL CSV REPORT</span>
        </button>

        {exportedCount !== null && (
          <div className="p-3 rounded-xl bg-[#10B981]/20 text-[#10B981] text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Successfully exported {exportedCount} ticket records!</span>
          </div>
        )}
      </div>
    </div>
  );
}
