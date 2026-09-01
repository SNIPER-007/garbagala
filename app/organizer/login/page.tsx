"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { ShieldCheck, Mail, Lock, QrCode, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

// Whitelisted Organizer Emails
const ALLOWED_ORGANIZER_EMAILS = [
  "garbagala@gmail.com",
  "admin@garbagala.com",
  "organizer@garbagala.com",
  "nisha.soni@garbagala.com",
  "dipti.vora@garbagala.com",
];

export default function OrganizerLoginPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const checkIsAuthorizedEmail = async (cleanEmail: string): Promise<boolean> => {
    // 1. Check static whitelist
    if (ALLOWED_ORGANIZER_EMAILS.includes(cleanEmail.toLowerCase())) {
      return true;
    }

    // 2. Check Firestore /organizers collection for dynamically added emails
    try {
      const emailDocRef = doc(db, "organizers", cleanEmail.toLowerCase());
      const emailSnap = await getDoc(emailDocRef);
      if (emailSnap.exists() && emailSnap.data().active === true) {
        return true;
      }
    } catch (err) {
      console.warn("Firestore organizer check fallback:", err);
    }

    return false;
  };

  const handleOrganizerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Validate email authorization FIRST
      const isAuthorized = await checkIsAuthorizedEmail(cleanEmail);
      if (!isAuthorized) {
        throw new Error(
          "ACCESS DENIED: This email address is not authorized for organizer / gate staff privileges."
        );
      }

      // Step 2: Firebase Email/Password Sign-In
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (authErr: any) {
        // If user account doesn't exist yet for whitelisted email, allow initializing initial organizer password
        if (
          authErr.code === "auth/user-not-found" ||
          authErr.code === "auth/invalid-credential"
        ) {
          try {
            userCredential = await createUserWithEmailAndPassword(
              auth,
              cleanEmail,
              password
            );
          } catch (createErr: any) {
            throw new Error(
              authErr.message || "Invalid credentials or password error."
            );
          }
        } else {
          throw authErr;
        }
      }

      // Step 3: Ensure user document has organizer role set in Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      const userSnap = await getDoc(userRef);

      const targetRole = cleanEmail.includes("admin") ? "super_admin" : "organizer";

      if (!userSnap.exists() || userSnap.data()?.role === "customer") {
        await setDoc(
          userRef,
          {
            uid: userCredential.user.uid,
            name: cleanEmail.split("@")[0].replace(".", " ").toUpperCase(),
            email: cleanEmail,
            role: targetRole,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      await refreshProfile();
      router.push("/organizer");
    } catch (err: any) {
      console.error("Organizer login error:", err);
      setErrorMessage(
        err.message || "Failed to authenticate organizer credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A090D] py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full card-glass rounded-3xl p-8 border-2 border-[#F7B731]/40 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E03616] via-[#FF9F1C] to-[#F7B731] p-0.5 mx-auto">
            <div className="w-full h-full bg-[#0A090D] rounded-[14px] flex items-center justify-center">
              <QrCode className="w-7 h-7 text-[#F7B731]" />
            </div>
          </div>
          <span className="text-xs font-extrabold text-[#F7B731] badge-gold px-3 py-1 rounded-full uppercase tracking-wider">
            RESTRICTED ORGANIZER ACCESS
          </span>
          <h1 className="text-2xl font-extrabold font-heading text-white mt-2">
            Organizer Portal Sign In
          </h1>
          <p className="text-xs text-[#8E8A9F]">
            Enter your authorized email and password to access the venue scanner console.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#E03616]/20 border border-[#E03616] text-white text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#E03616] shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleOrganizerLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#B5B1C5] font-semibold mb-1.5">
              Authorized Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E8A9F]" />
              <input
                type="email"
                required
                placeholder="e.g. garbagala@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A090D] border border-[#272435] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#F7B731]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#B5B1C5] font-semibold mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E8A9F]" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A090D] border border-[#272435] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#F7B731]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-gold w-full py-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0A090D]" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>VERIFY & SIGN IN TO GATE CONSOLE</span>
          </button>
        </form>

        <div className="p-3.5 rounded-xl bg-[#0A090D] border border-[#272435] text-[11px] text-[#8E8A9F] space-y-1">
          <p className="text-white font-semibold">🔒 RESTRICTED PORTAL</p>
          <p>
            Only pre-authorized organizer and gate scanner emails are permitted. Unauthorized access attempts are logged for audit safety.
          </p>
        </div>
      </div>
    </div>
  );
}
