"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, CheckCircle2, ShieldAlert, XCircle, Loader2, QrCode, RefreshCw } from "lucide-react";
import { IndividualTicketData } from "@/lib/types";

type ScanResultState = {
  status: "idle" | "valid" | "already_checked_in" | "invalid" | "unpaid" | "cancelled" | "success";
  message?: string;
  ticket?: IndividualTicketData;
  checkedInAt?: string;
  checkedInBy?: string;
};

export default function QrScannerPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkinState, setCheckinState] = useState<ScanResultState>({ status: "idle" });

  useEffect(() => {
    startCameraScanner();

    return () => {
      stopCameraScanner();
    };
  }, []);

  const startCameraScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
        },
        (decodedText) => {
          // Extract token from full URL or raw token string
          let token = decodedText;
          if (decodedText.includes("token=")) {
            token = decodedText.split("token=")[1].split("&")[0];
          }
          handleTokenScan(token);
        },
        (errorMessage) => {
          // Silent scan error framing
        }
      );
      setScanning(true);
    } catch (err) {
      console.warn("Camera init warning:", err);
      setScanning(false);
    }
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Stop scanner error:", err);
      }
    }
  };

  const handleTokenScan = async (token: string) => {
    if (loading || scannedToken === token) return;
    setScannedToken(token);
    setLoading(true);
    await stopCameraScanner();

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "validate" }),
      });

      const data = await res.json();
      setCheckinState({
        status: data.status,
        message: data.message,
        ticket: data.ticket,
        checkedInAt: data.checkedInAt,
        checkedInBy: data.checkedInBy,
      });
    } catch (err: any) {
      setCheckinState({
        status: "invalid",
        message: "Failed to communicate with gate check-in server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const executeCheckIn = async () => {
    if (!checkinState.ticket) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketNumber: checkinState.ticket.ticketNumber,
          action: "checkin",
          organizerId: "gate_staff_1",
        }),
      });

      const data = await res.json();
      setCheckinState({
        status: data.status,
        message: data.message,
        ticket: data.ticket,
      });
    } catch (err: any) {
      setCheckinState({
        status: "invalid",
        message: "Check-in transaction error.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedToken(null);
    setCheckinState({ status: "idle" });
    startCameraScanner();
  };

  return (
    <div className="min-h-screen bg-[#0A090D] py-6 px-4 flex flex-col items-center">
      <div className="max-w-md w-full space-y-6">
        {/* Top Header Nav */}
        <div className="flex justify-between items-center pb-4 border-b border-[#272435]">
          <Link href="/organizer" className="flex items-center gap-2 text-xs font-bold text-[#8E8A9F]">
            <ArrowLeft className="w-4 h-4" /> Gate Console
          </Link>
          <span className="text-xs font-extrabold text-[#F7B731] font-heading">CAMERA SCANNER</span>
        </div>

        {/* Camera Viewfinder Box */}
        {checkinState.status === "idle" && (
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden border-4 border-[#F7B731] bg-black shadow-2xl min-h-[320px] flex items-center justify-center">
              <div id="reader" className="w-full h-full" />
              {!scanning && (
                <div className="text-center p-6 space-y-3 z-10">
                  <QrCode className="w-12 h-12 text-[#F7B731] mx-auto animate-pulse" />
                  <p className="text-xs text-[#B5B1C5]">Initializing camera permission...</p>
                  <button
                    onClick={startCameraScanner}
                    className="btn-primary-gold px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Grant Camera Access
                  </button>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-[#8E8A9F]">
              Position ticket QR code within viewfinder frame for instant scan
            </p>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="card-glass rounded-3xl p-10 text-center border border-[#F7B731] space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#F7B731] mx-auto" />
            <p className="text-sm font-bold text-white">Validating Pass with Backend...</p>
          </div>
        )}

        {/* Validation Result Modal Views */}
        {!loading && checkinState.status !== "idle" && (
          <div className="space-y-6">
            {/* Status: Valid */}
            {checkinState.status === "valid" && checkinState.ticket && (
              <div className="card-glass rounded-3xl p-8 border-4 border-[#10B981] space-y-6 shadow-2xl text-center bg-[#10B981]/10">
                <div className="w-16 h-16 rounded-full bg-[#10B981] text-[#0A090D] flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#10B981] text-[#0A090D] uppercase tracking-widest">
                    ✓ VALID TICKET
                  </span>
                  <h2 className="text-3xl font-extrabold text-white font-heading mt-3">
                    {checkinState.ticket.holderName}
                  </h2>
                  <p className="text-lg font-bold text-[#F7B731] mt-1 font-heading">
                    {checkinState.ticket.ticketNumber}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A090D] border border-[#272435] text-xs space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-[#8E8A9F]">Ticket Category:</span>
                    <span className="font-bold text-white">{checkinState.ticket.ticketType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8A9F]">Payment Verification:</span>
                    <span className="font-bold text-[#10B981]">PAID</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8A9F]">Current Status:</span>
                    <span className="font-bold text-[#10B981]">VALID</span>
                  </div>
                </div>

                <button
                  onClick={executeCheckIn}
                  className="btn-primary-gold w-full py-4 rounded-2xl text-lg font-extrabold shadow-2xl"
                >
                  CONFIRM CHECK IN →
                </button>
              </div>
            )}

            {/* Status: Entry Confirmed Success */}
            {checkinState.status === "success" && (
              <div className="card-glass rounded-3xl p-8 border-4 border-[#10B981] space-y-6 shadow-2xl text-center bg-[#10B981]/20">
                <div className="w-20 h-20 rounded-full bg-[#10B981] text-[#0A090D] flex items-center justify-center mx-auto shadow-2xl">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div>
                  <h2 className="text-3xl font-extrabold text-[#10B981] font-heading">
                    ENTRY CONFIRMED!
                  </h2>
                  <p className="text-sm font-bold text-white mt-2">
                    Welcome to Garba Gala 2026!
                  </p>
                </div>

                <button
                  onClick={resetScanner}
                  className="w-full py-4 rounded-2xl bg-white text-[#0A090D] font-extrabold text-base flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>SCAN NEXT TICKET</span>
                </button>
              </div>
            )}

            {/* Status: Already Checked-In */}
            {checkinState.status === "already_checked_in" && (
              <div className="card-glass rounded-3xl p-8 border-4 border-[#E03616] space-y-6 shadow-2xl text-center bg-[#E03616]/20">
                <div className="w-16 h-16 rounded-full bg-[#E03616] text-white flex items-center justify-center mx-auto shadow-xl">
                  <XCircle className="w-10 h-10" />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-[#E03616] font-heading">
                    🔴 TICKET ALREADY USED
                  </h2>
                  {checkinState.ticket && (
                    <p className="text-xl font-bold text-white mt-1">
                      {checkinState.ticket.ticketNumber} ({checkinState.ticket.holderName})
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#0A090D] border border-[#E03616]/40 text-xs space-y-1 text-left">
                  <p className="text-[#E03616] font-bold">RE-ENTRY DENIED</p>
                  <p className="text-[#B5B1C5]">
                    Checked in at: <strong>{checkinState.checkedInAt ? new Date(checkinState.checkedInAt).toLocaleTimeString() : "Earlier Today"}</strong>
                  </p>
                  <p className="text-[#B5B1C5]">
                    Scanned by: <strong>{checkinState.checkedInBy || "Gate Staff"}</strong>
                  </p>
                </div>

                <button
                  onClick={resetScanner}
                  className="w-full py-3.5 rounded-2xl bg-[#14121B] border border-[#272435] text-white font-bold text-sm"
                >
                  Scan Next Ticket
                </button>
              </div>
            )}

            {/* Status: Invalid / Unpaid / Cancelled */}
            {(checkinState.status === "invalid" || checkinState.status === "unpaid" || checkinState.status === "cancelled") && (
              <div className="card-glass rounded-3xl p-8 border-4 border-[#E03616] space-y-6 shadow-2xl text-center bg-[#E03616]/15">
                <div className="w-16 h-16 rounded-full bg-[#E03616] text-white flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-10 h-10" />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-[#E03616] font-heading">
                    🔴 {checkinState.status === "unpaid" ? "PAYMENT NOT VERIFIED" : "INVALID TICKET"}
                  </h2>
                  <p className="text-xs text-[#B5B1C5] mt-2">
                    {checkinState.message || "Ticket could not be verified."}
                  </p>
                </div>

                <button
                  onClick={resetScanner}
                  className="w-full py-3.5 rounded-2xl bg-[#14121B] border border-[#272435] text-white font-bold text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
