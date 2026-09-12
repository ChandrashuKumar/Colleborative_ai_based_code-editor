import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/config/firebaseAdmin";

export async function POST(request) {
  try {
    const { email, code, password, displayName } = await request.json();
    if (!email || !code || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const verificationRef = adminDb.doc(`emailVerifications/${email}`);
    const verificationSnap = await verificationRef.get();

    if (!verificationSnap.exists) {
      return NextResponse.json({ success: false, message: "No verification code found." });
    }

    const { verifyCode, createdAt } = verificationSnap.data();

    if (code !== verifyCode) {
      return NextResponse.json({ success: false, message: "Incorrect verification code." });
    }

    const expirationTime = 10 * 60 * 1000;
    const codeAge = Date.now() - createdAt.toDate().getTime();
    if (codeAge > expirationTime) {
      await verificationRef.delete();
      return NextResponse.json({ success: false, message: "Code has expired. Please request a new one." });
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });

    await adminDb.doc(`users/${email}`).set({
      email,
      displayName,
      photoURL: "/robotic.png",
      authProvider: "email",
      createdAt: new Date(),
      lastLogin: new Date(),
      twoFactorEnabled: false,
      workspaces: {},
      settings: {
        theme: "dark",
        fontSize: 14,
        showLineNumbers: true,
        aiSuggestions: true,
      },
      snippets: [],
    });

    await verificationRef.delete();

    const token = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
