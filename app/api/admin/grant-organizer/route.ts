import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/config";

export async function POST(request: Request) {
  try {
    const { email, role = "organizer", active = true } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Add to /organizers collection
    const organizerRef = adminDb.collection("organizers").doc(cleanEmail);
    await organizerRef.set(
      {
        email: cleanEmail,
        role,
        active,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 2. If user document exists in /users collection, update user role
    const usersQuery = await adminDb.collection("users")
      .where("email", "==", cleanEmail)
      .limit(1)
      .get();

    if (!usersQuery.empty) {
      const userDoc = usersQuery.docs[0];
      await userDoc.ref.update({
        role,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Organizer access successfully granted to ${cleanEmail}`,
    });
  } catch (error: any) {
    console.error("Grant organizer API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
