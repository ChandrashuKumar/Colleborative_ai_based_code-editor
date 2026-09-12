import { auth, db } from "@/config/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export const signUpUser = async (email, password, displayName) => {
  try {
    const res = await fetch("/api/signup/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    return await res.json();
  } catch (error) {
    console.error("Sign-up error:", error);
    return { success: false, message: error.message };
  }
};

export const verifyEmailCode = async (email, code, password, displayName) => {
  try {
    const res = await fetch("/api/signup/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password, displayName }),
    });

    const data = await res.json();
    if (!data.success) {
      return data;
    }

    const userCredential = await signInWithCustomToken(auth, data.token);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, message: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL || "robotic.png",
        authProvider: "google",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
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
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
