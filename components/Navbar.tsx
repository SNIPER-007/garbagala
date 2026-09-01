"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket, User, ShieldCheck, QrCode, Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

export default function Navbar() {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tickets", label: "Passes" },
    { href: "/my-tickets", label: "My Tickets", icon: Ticket },
  ];

  if (userProfile?.role === "organizer" || userProfile?.role === "checkin_staff" || userProfile?.role === "super_admin") {
    navLinks.push({ href: "/organizer", label: "Organizer Portal", icon: QrCode });
  }

  if (userProfile?.role === "super_admin") {
    navLinks.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0A090D]/90 backdrop-blur-md border-b border-[#272435]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E03616] via-[#FF9F1C] to-[#F7B731] p-0.5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0A090D] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#F7B731]" />
            </div>
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5 font-heading">
              GARBA GALA <span className="text-[#F7B731] text-xs px-2 py-0.5 rounded-full bg-[#FF9F1C]/20 border border-[#F7B731]/30 font-sans">2026</span>
            </div>
            <p className="text-[10px] text-[#8E8A9F] tracking-widest uppercase font-semibold">27 SEPT • MULUND WEST</p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-[#F7B731] gold-text-glow"
                    : "text-[#B5B1C5] hover:text-white"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA & User Login */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/my-tickets"
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border border-[#272435] text-[#B5B1C5] hover:text-white hover:border-[#F7B731]/40 transition-all bg-[#14121B]"
          >
            <User className="w-3.5 h-3.5 text-[#F7B731]" />
            {userProfile?.name ? userProfile.name.split(" ")[0] : "My Pass"}
          </Link>

          <Link
            href="/checkout"
            className="btn-primary-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 font-bold"
          >
            <Ticket className="w-4 h-4" />
            Get Pass • ₹450
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg border border-[#272435] text-[#B5B1C5] hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#14121B] border-b border-[#272435] px-4 pt-4 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-[#B5B1C5] hover:text-[#F7B731]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/my-tickets"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-sm font-semibold rounded-lg border border-[#272435] text-white bg-[#0A090D]"
            >
              My Tickets / Pass Area
            </Link>
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary-gold w-full py-3 text-center text-sm font-bold rounded-xl"
            >
              Get Your Pass • ₹450
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
