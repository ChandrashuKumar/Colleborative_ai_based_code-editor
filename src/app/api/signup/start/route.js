import { NextResponse } from "next/server";
import { getAdminDb } from "@/config/firebaseAdmin";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const userSnap = await adminDb.doc(`users/${email}`).get();
    if (userSnap.exists) {
      return NextResponse.json({ success: false, message: "User already exists. Please log in." });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    await adminDb.doc(`emailVerifications/${email}`).set({
      verifyCode,
      createdAt: new Date(),
    });

    const emailResponse = await sendVerificationEmail(email, verifyCode);
    if (!emailResponse.success) {
      console.error("Error sending verification email:", emailResponse.message);
      return NextResponse.json({ success: false, message: emailResponse.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
